import logging
from collections import defaultdict
from datetime import datetime
from typing import Dict, List, Optional, Tuple

from src import Database
from src.databases.organizer_database import OrganizerDatabase
from src.databases.place_database import PlaceDatabase
from src.entities.analytics.team_analytics import TeamAnalytics
from src.entities.history_action import AddPaidDateAction, AddQuizAction, EditQuizAction, RemovePaidDateAction, RemoveQuizAction
from src.entities.paid_date import PaidDate
from src.entities.paid_info import PaidInfo
from src.entities.quiz import Quiz
from src.entities.schedule import Schedule
from src.entities.sticker import Sticker
from src.entities.sticker_info import StickerInfo
from src.entities.user import User
from src.enums import PaidType
from src.query_params.page_query import PageQuery
from src.query_params.schedule_params import ScheduleParams
from src.utils.date import get_month_range


class QuizDatabase:
    def __init__(self, database: Database, place_database: PlaceDatabase, organizer_database: OrganizerDatabase, logger: logging.Logger) -> None:
        self.database = database
        self.place_database = place_database
        self.organizer_database = organizer_database
        self.logger = logger
        self.activity_score_alpha = 0.98

    def get_count(self) -> int:
        return self.database.quizzes.count_documents({})

    def add_quiz(self, quiz: Quiz, username: str) -> None:
        action = AddQuizAction(username=username, timestamp=datetime.now(), quiz_id=quiz.quiz_id)
        self.database.quizzes.insert_one(quiz.to_dict())
        self.database.history.insert_one(action.to_dict())
        self.logger.info(f'Added quiz "{quiz.name}" ({quiz.quiz_id}) by @{username}')

    def update_quiz(self, quiz_id: int, diff: dict, username: str) -> None:
        if not diff:
            return

        quiz = self.database.quizzes.find_one({"quiz_id": quiz_id}, {"name": 1})
        assert quiz is not None

        action = EditQuizAction(username=username, timestamp=datetime.now(), quiz_id=quiz_id, diff=diff)
        self.database.quizzes.update_one({"quiz_id": quiz_id}, {"$set": {key: key_diff["new"] for key, key_diff in diff.items()}})
        self.database.history.insert_one(action.to_dict())
        self.logger.info(f'Updated quiz "{quiz["name"]}" ({quiz_id}) by @{username} (keys: {[key for key in diff]})')

    def remove_quiz(self, quiz_id: int, username: str) -> None:
        quiz = self.database.quizzes.find_one({"quiz_id": quiz_id}, {"name": 1})
        assert quiz is not None

        action = RemoveQuizAction(username=username, timestamp=datetime.now(), quiz_id=quiz_id)
        self.database.quizzes.delete_one({"quiz_id": quiz_id})
        self.database.history.insert_one(action.to_dict())
        self.logger.info(f'Removed quiz "{quiz["name"]}" ({quiz_id}) by @{username}')

    def get_quiz(self, quiz_id: int) -> Optional[Quiz]:
        quiz = self.database.quizzes.find_one({"quiz_id": quiz_id})
        return Quiz.from_dict(quiz) if quiz else None

    def get_rating_quizzes(self) -> List[Quiz]:
        query = {
            "datetime": {"$gte": datetime(2024, 1, 1)},
            "result.position": {"$gt": 0},
            "organizer_id": self.database.get_smuzi_id(),
            "ignore_rating": {"$ne": True}
        }
        return [Quiz.from_dict(quiz) for quiz in self.database.quizzes.find(query).sort("datetime", 1)]

    def get_nearest_quizzes(self) -> List[Quiz]:
        quizzes = self.database.quizzes.find({"datetime": {"$gte": datetime.now()}}).sort({"datetime": 1}).limit(2)
        return [Quiz.from_dict(quiz) for quiz in quizzes]

    def add_paid_date(self, paid_date: PaidDate, username: str) -> None:
        action = AddPaidDateAction(username=username, timestamp=datetime.now(), paid_date=paid_date)
        self.database.paid_dates.insert_one(paid_date.to_dict())
        self.database.history.insert_one(action.to_dict())
        self.logger.info(f"Added paid date {paid_date.date} for {paid_date.username} by @{username}")

    def remove_paid_date(self, paid_date: PaidDate, username: str) -> bool:
        if not self.database.paid_dates.find_one(paid_date.to_dict()):
            return False

        action = RemovePaidDateAction(username=username, timestamp=datetime.now(), paid_date=paid_date)
        self.database.paid_dates.delete_one(paid_date.to_dict())
        self.database.history.insert_one(action.to_dict())
        self.logger.info(f"Removed paid date {paid_date.date} for {paid_date.username} by @{username}")
        return True

    def get_team_analytics(self) -> TeamAnalytics:
        quizzes = [Quiz.from_dict(quiz) for quiz in self.database.quizzes.find({"result.position": {"$gt": 0}})]
        return TeamAnalytics.evaluate(quizzes=quizzes)

    def get_users(self) -> List[User]:
        username2score = self.get_activity_scores()
        users = sorted([User.from_dict(user) for user in self.database.users.find({})], key=lambda user: -username2score[user.username])
        return users

    def get_activity_scores(self) -> Dict[str, float]:
        username2score = defaultdict(float)
        quizzes = list(self.database.quizzes.find({"participants": {"$ne": []}}, {"datetime": 1, "participants": 1}))
        end_date = max([quiz["datetime"] for quiz in quizzes], default=datetime.now())

        for quiz in quizzes:
            for participant in quiz["participants"]:
                username2score[participant["username"]] += self.activity_score_alpha ** (end_date - quiz["datetime"]).days

        return username2score

    def get_sticker_users(self, params: PageQuery) -> Tuple[int, List[User], Dict[str, StickerInfo]]:
        username2user = {user["username"]: User.from_dict(user) for user in self.database.users.find({"stickers_start_date": {"$ne": None}})}
        username2paid_infos = self.database.get_users_paid_info(usernames=list(username2user))

        for quiz in self.database.quizzes.find(self.__get_stickers_query()):
            for participant in quiz["participants"]:
                username = participant["username"]
                paid_type = PaidType(participant["paid_type"])

                if username in username2user and paid_type != PaidType.FREE and username2user[username].is_valid_sticker_date(quiz["datetime"]):
                    username2paid_infos[username].append(PaidInfo(date=quiz["datetime"], paid_type=paid_type, extra=False))

        username2sticker_info = {}
        for username, paid_infos in username2paid_infos.items():
            if not paid_infos:
                continue

            paid_infos = sorted(paid_infos, key=lambda paid_info: paid_info.date, reverse=True)
            paid_games = self.__get_paid_games(paid_infos)
            username2sticker_info[username] = StickerInfo(games=paid_games, paid_infos=paid_infos)

        users = sorted([username2user[username] for username in username2sticker_info], key=lambda user: -username2sticker_info[user.username].games)
        return len(username2sticker_info), users[params.skip:params.skip + params.page_size], username2sticker_info

    def get_user_stickers(self, username: str) -> Tuple[int, List[Sticker]]:
        user = self.database.get_user(username=username)
        paid_infos = self.database.get_user_paid_info(username=username)

        for quiz in self.database.quizzes.find({**self.__get_stickers_query(), "participants.username": username}):
            for participant in quiz["participants"]:
                paid_type = PaidType(participant["paid_type"])

                if participant["username"] == username and paid_type != PaidType.FREE and user.is_valid_sticker_date(quiz["datetime"]):
                    paid_infos.append(PaidInfo(date=quiz["datetime"], paid_type=paid_type, extra=False))

        paid_infos = sorted(paid_infos, key=lambda paid_info: paid_info.date, reverse=True)
        end_index = self.__get_last_free_game(paid_infos)
        stickers = Sticker.from_paid_infos(paid_infos=paid_infos if end_index == -1 else paid_infos[:end_index])
        return self.__get_paid_games(paid_infos=paid_infos), stickers

    def get_schedule(self, params: ScheduleParams) -> Schedule:
        start_date, end_date = get_month_range(year=params.year, month=params.month)
        quizzes = [Quiz.from_dict(quiz) for quiz in self.database.quizzes.find({"datetime": {"$gte": start_date, "$lte": end_date}}).sort({"datetime": 1})]

        places = self.place_database.get_quiz_places(quizzes=quizzes, only_used=True)
        organizers = self.organizer_database.get_quiz_organizers(quizzes=quizzes, only_used=True)

        day2quizzes: Dict[int, list] = defaultdict(list)

        for quiz in quizzes:
            day2quizzes[quiz.datetime.day].append(quiz)

        schedule = Schedule(
            month=params.month,
            year=params.year,
            places=places,
            organizers=organizers,
            analytics=TeamAnalytics.evaluate(quizzes=quizzes),
            day2quizzes={day: day_quizzes for day, day_quizzes in day2quizzes.items()}
        )

        return schedule

    def __get_stickers_query(self) -> dict:
        return {"organizer_id": self.database.get_smuzi_id(), "datetime": {"$gte": datetime(2024, 4, 1)}}

    def __get_paid_games(self, paid_infos: List[PaidInfo]) -> int:
        end_index = self.__get_last_free_game(paid_infos)

        if end_index == -1:
            return len(paid_infos)

        return sum(paid_info.paid_type.to_games() for paid_info in paid_infos[:end_index])

    def __get_last_free_game(self, paid_infos: List[PaidInfo]) -> int:
        paid_games = 0

        for game in paid_infos[::-1]:
            if game.paid_type == PaidType.STICKERS:
                break

            paid_games += 1

        end_index = len(paid_infos) - paid_games - 1
        if paid_games == len(paid_infos):
            return -1

        return len(paid_infos) if paid_games >= 10 else end_index
