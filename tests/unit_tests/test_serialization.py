from datetime import datetime
from unittest import TestCase

from src.entities.birth_date import BirthDate
from src.entities.organizer import Organizer
from src.entities.place import Place
from src.entities.quiz import Quiz
from src.entities.quiz_participant import QuizParticipant
from src.entities.quiz_result import QuizResult
from src.entities.user import User
from src.enums import Category, PaidType, UserRole


class TestSerialization(TestCase):
    def test_organizer_serialization(self) -> None:
        organizer = Organizer(
            organizer_id=1,
            name="Organizer 1",
            description="Some organizer description",
            image_url="some image url"
        )

        organizer_dict = organizer.to_dict()
        organizer_from_dict = Organizer.from_dict(organizer_dict)
        self.assertEqual(organizer, organizer_from_dict)

    def test_place_serialization(self) -> None:
        place = Place(
            place_id=1,
            name="Place 1",
            address="Some address",
            yandex_map_link="https://maps.yandex.ru/organization/lalala",
            metro_station="Some metro",
            color="#fef000"
        )

        place_dict = place.to_dict()
        place_from_dict = Place.from_dict(place_dict)
        self.assertEqual(place, place_from_dict)

    def test_user_serialization(self) -> None:
        user = User(
            username="admin",
            password_hash="password hash",
            full_name="user full name",
            role=UserRole.ADMIN,
            avatar_url="url to avatar",
            birthdate=BirthDate(day=5, month=12)
        )

        user_dict = user.to_dict()
        user_from_dict = User.from_dict(user_dict)
        self.assertEqual(user, user_from_dict)

    def test_quiz_result_serialization(self) -> None:
        quiz_result = QuizResult(
            position=1,
            teams=15,
            players=5
        )

        quiz_result_dict = quiz_result.to_dict()
        quiz_result_from_dict = QuizResult.from_dict(quiz_result_dict)
        self.assertEqual(quiz_result, quiz_result_from_dict)

    def test_quiz_participant_serialization(self) -> None:
        participant = QuizParticipant(
            username="user_1",
            paid_type=PaidType.PAID
        )

        participant_dict = participant.to_dict()
        participant_from_dict = QuizParticipant.from_dict(participant_dict)
        self.assertEqual(participant, participant_from_dict)

    def test_quiz_serialization(self) -> None:
        participants = [
            QuizParticipant(username="user_1", paid_type=PaidType.PAID),
            QuizParticipant(username="user_2", paid_type=PaidType.PAID),
        ]

        quiz = Quiz(
            quiz_id=1,
            name="Quiz 1",
            short_name="Q1",
            description="Some quiz description",
            datetime=datetime(2024, 9, 29, 15, 00),
            cost=700,
            place_id=1,
            organizer_id=1,
            category=Category.MUSIC,
            album_id=5,
            ignore_rating=True,
            participants=participants,
            result=QuizResult(position=1, teams=15, players=5)
        )

        quiz_dict = quiz.to_dict()
        quiz_from_dict = Quiz.from_dict(quiz_dict)
        self.assertEqual(quiz, quiz_from_dict)
