import logging
from datetime import datetime
from typing import Dict, List, Optional, Tuple

from src import Database
from src.entities.analytics.team_analytics import TeamAnalytics
from src.entities.history_action import AddPaidDateAction, AddQuizAction, EditQuizAction, RemoveQuizAction
from src.entities.paid_date import PaidDate
from src.entities.paid_info import PaidInfo
from src.entities.quiz import Quiz
from src.entities.sticker_info import StickerInfo
from src.entities.user import User
from src.enums import PaidType
from src.query_params.page_query import PageQuery


class QuizDatabase:
    def __init__(self, database: Database, logger: logging.Logger) -> None:
        self.database = database
        self.logger = logger

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
            "result": {"$ne": None},
            "organizer_id": self.__get_smuzi_id(),
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

    def get_team_analytics(self) -> TeamAnalytics:
        quizzes = [Quiz.from_dict(quiz) for quiz in self.database.quizzes.find({"result.position": {"$gt": 0}})]
        return TeamAnalytics.evaluate(quizzes=quizzes)

    def get_sticker_users(self, params: PageQuery) -> Tuple[int, List[User], Dict[str, StickerInfo]]:
        username2user = {user["username"]: User.from_dict(user) for user in self.database.users.find({"stickers_start_date": {"$ne": None}})}
        username2paid_infos = self.database.get_users_paid_info(usernames=list(username2user))

        for quiz in self.database.quizzes.find({"organizer_id": self.__get_smuzi_id(), "datetime": {"$gte": datetime(2024, 4, 1)}}):
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

    def __get_smuzi_id(self) -> int:
        organizer = self.database.organizers.find_one({"name": "Смузи"}, {"organizer_id": 1})
        return organizer["organizer_id"]

    def __get_paid_games(self, paid_infos: List[PaidInfo]) -> int:
        end_index = self.__get_last_free_game(paid_infos)

        if end_index == -1:
            return len(paid_infos)

        paid_games = 0
        for paid_info in paid_infos[:end_index]:
            if paid_info.paid_type == PaidType.PAID:
                paid_games += 1
            elif paid_info.paid_type == PaidType.STICKERS:
                paid_games -= 10

        return paid_games

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
