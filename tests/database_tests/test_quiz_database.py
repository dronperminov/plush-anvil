from datetime import datetime

from src.entities.quiz import Quiz
from src.entities.quiz_participant import QuizParticipant
from src.entities.quiz_result import QuizResult
from src.enums import Category, PaidType
from tests.database_tests.abstract_database_test import AbstractDatabaseTest


class TestQuizDatabaseReal(AbstractDatabaseTest):
    def test_1_insert_quiz(self) -> None:
        self.assertEqual(self.quiz_database.get_count(), 0)
        self.assertIsNone(self.quiz_database.get_quiz(quiz_id=1))

        quiz_id = self.database.get_identifier("quizzes")
        quiz = Quiz(
            quiz_id=quiz_id,
            name="Телеквиз",
            short_name="Телеквиз",
            description="Обновлённый формат телеквиза! Мы убрали из 4 тура «100 к 1» и сделали вместо него 4 разные игры!",
            datetime=datetime(2024, 9, 22, 15, 00),
            cost=700,
            place_id=1,
            organizer_id=1,
            category=Category.ABOUT_EVERYTHING,
            album_id=None,
            ignore_rating=False,
            participants=[QuizParticipant(username="user1", paid_type=PaidType.PAID)],
            result=None
        )

        self.quiz_database.add_quiz(quiz=quiz, username="user")

        self.assertEqual(self.quiz_database.get_count(), 1)
        inserted_quiz = self.quiz_database.get_quiz(quiz_id=1)
        self.assertIsNotNone(inserted_quiz)
        self.assertEqual(quiz, inserted_quiz)

    def test_2_update_quiz(self) -> None:
        quiz = self.quiz_database.get_quiz(quiz_id=1)
        result = QuizResult(position=1, teams=15, players=8)
        self.quiz_database.update_quiz(quiz_id=1, diff=quiz.get_diff({"result": result.to_dict(), "album_id": 1}), username="user")

        updated_quiz = self.quiz_database.get_quiz(quiz_id=1)
        self.assertIsNotNone(updated_quiz)

        self.assertIsNone(quiz.result)
        self.assertEqual(updated_quiz.result, result)

        self.assertIsNone(quiz.album_id)
        self.assertEqual(updated_quiz.album_id, 1)

    def test_3_remove_quiz(self) -> None:
        self.assertEqual(self.quiz_database.get_count(), 1)
        self.assertIsNotNone(self.quiz_database.get_quiz(quiz_id=1))

        self.quiz_database.remove_quiz(quiz_id=1, username="user")

        self.assertEqual(self.quiz_database.get_count(), 0)
        self.assertIsNone(self.quiz_database.get_quiz(quiz_id=1))
