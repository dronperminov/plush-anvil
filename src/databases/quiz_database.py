import logging
from collections import defaultdict
from datetime import datetime
from typing import Dict, List, Optional

from src import Database
from src.databases.organizer_database import OrganizerDatabase
from src.databases.place_database import PlaceDatabase
from src.entities.analytics.team_analytics import TeamAnalytics
from src.entities.history_action import AddQuizAction, EditQuizAction, RemoveQuizAction
from src.entities.quiz import Quiz
from src.entities.schedule import Schedule
from src.entities.user import User
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

    def get_nearest_quizzes(self) -> List[Quiz]:
        quizzes = self.database.quizzes.find({"datetime": {"$gte": datetime.now()}}).sort({"datetime": 1}).limit(2)
        return [Quiz.from_dict(quiz) for quiz in quizzes]

    def get_team_analytics(self) -> TeamAnalytics:
        quizzes = [Quiz.from_dict(quiz) for quiz in self.database.quizzes.find({"result.position": {"$gt": 0}})]
        return TeamAnalytics.evaluate(quizzes=quizzes)

    def get_users(self) -> List[User]:
        username2score = self.get_activity_scores()
        users = sorted([User.from_dict(user) for user in self.database.users.find({})], key=lambda user: -username2score.get(user.username, 0))
        return users

    def get_activity_scores(self) -> Dict[str, float]:
        username2score = defaultdict(float)
        quizzes = list(self.database.quizzes.find({"participants": {"$ne": []}}, {"datetime": 1, "participants": 1}))
        end_date = max([quiz["datetime"] for quiz in quizzes], default=datetime.now())

        for quiz in quizzes:
            for participant in quiz["participants"]:
                username2score[participant] += self.activity_score_alpha ** (end_date - quiz["datetime"]).days

        return {username: score for username, score in username2score.items()}

    def get_schedule(self, params: ScheduleParams) -> Schedule:
        start_date, end_date = get_month_range(year=params.year, month=params.month)
        quizzes = [Quiz.from_dict(quiz) for quiz in self.database.quizzes.find({"datetime": {"$gte": start_date, "$lte": end_date}}).sort({"datetime": 1})]

        places = self.place_database.get_quiz_places(quizzes=quizzes, only_used=True)
        organizers = self.organizer_database.get_quiz_organizers(quizzes=quizzes, only_used=True)
        username2avatar = self.database.get_user_avatar_urls(usernames=list({participant for quiz in quizzes for participant in quiz.participants}))

        day2quizzes: Dict[int, list] = defaultdict(list)

        for quiz in quizzes:
            day2quizzes[quiz.datetime.day].append(quiz)

        schedule = Schedule(
            month=params.month,
            year=params.year,
            all_users=[user.to_short() for user in self.get_users()],
            all_places=self.place_database.get_all_places(),
            all_organizers=self.organizer_database.get_all_organizers(),
            places=places,
            organizers=organizers,
            username2avatar=username2avatar,
            analytics=TeamAnalytics.evaluate(quizzes=quizzes),
            day2quizzes={day: day_quizzes for day, day_quizzes in day2quizzes.items()}
        )

        return schedule
