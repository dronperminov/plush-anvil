import logging
from datetime import datetime
from typing import List, Optional

from src import Database
from src.entities.history_action import AddPaidDateAction, AddQuizAction, EditQuizAction, RemoveQuizAction
from src.entities.paid_date import PaidDate
from src.entities.quiz import Quiz


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
        organizer = self.database.organizers.find_one({"name": "Смузи"})
        query = {
            "datetime": {"$gte": datetime(2024, 1, 1)},
            "result": {"$ne": None},
            "organizer_id": organizer["organizer_id"],
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
