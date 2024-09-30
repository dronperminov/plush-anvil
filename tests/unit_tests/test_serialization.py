from datetime import datetime
from unittest import TestCase

from src.entities.album import Album
from src.entities.birth_date import BirthDate
from src.entities.history_action import AddAlbumAction, AddMarkupAction, AddOrganizerAction, AddPaidDateAction, AddPhotoAction, AddPlaceAction, AddQuizAction, \
    EditAlbumAction, EditOrganizerAction, EditPhotoAction, EditPlaceAction, EditQuizAction, HistoryAction, RemoveAlbumAction, RemoveMarkupAction, RemovePhotoAction, \
    RemoveQuizAction, SignUpAction
from src.entities.markup import Markup
from src.entities.organizer import Organizer
from src.entities.paid_date import PaidDate
from src.entities.photo import Photo
from src.entities.place import Place
from src.entities.quiz import Quiz
from src.entities.quiz_participant import QuizParticipant
from src.entities.quiz_result import QuizResult
from src.entities.user import User
from src.enums import Category, PaidType, UserRole


class TestSerialization(TestCase):
    def test_markup_serialization(self) -> None:
        markup = Markup(
            markup_id=1,
            photo_id=1,
            username="user",
            x=0.2,
            y=0.1,
            width=0.7,
            height=0.05
        )

        markup_dict = markup.to_dict()
        markup_from_dict = Markup.from_dict(markup_dict)
        self.assertEqual(markup, markup_from_dict)

    def test_photo_serialization(self) -> None:
        photo = Photo(
            photo_id=1,
            album_id=1,
            url="some photo url",
            preview_url="some preview photo url",
            markup_ids=[1, 2, 3, 89]
        )

        photo_dict = photo.to_dict()
        photo_from_dict = Photo.from_dict(photo_dict)
        self.assertEqual(photo, photo_from_dict)

    def test_album_serialization(self) -> None:
        album = Album(
            album_id=1,
            title="Album title",
            photo_ids=[1, 5, 8],
            date=datetime(2024, 9, 29, 15, 00),
            cover_id=1
        )

        album_dict = album.to_dict()
        album_from_dict = Album.from_dict(album_dict)
        self.assertEqual(album, album_from_dict)

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
            birth_date=BirthDate(day=5, month=12)
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

    def test_paid_date_serialization(self) -> None:
        paid_date = PaidDate(username="user_1", date=datetime(2024, 9, 29))
        paid_date_dict = paid_date.to_dict()
        paid_date_from_dict = PaidDate.from_dict(paid_date_dict)
        self.assertEqual(paid_date, paid_date_from_dict)

    def test_history_action_serialization(self) -> None:
        history_actions = [
            SignUpAction(username="user", timestamp=datetime(2024, 1, 1, 20, 23, 51)),

            AddPlaceAction(username="user", timestamp=datetime(2024, 1, 1, 20, 23, 51), place_id=1),
            EditPlaceAction(username="user", timestamp=datetime(2024, 1, 1, 20, 23, 51), place_id=1, diff={"name": {"prev": "bla", "new": "some"}}),

            AddOrganizerAction(username="user", timestamp=datetime(2024, 1, 1, 20, 23, 51), organizer_id=1),
            EditOrganizerAction(username="user", timestamp=datetime(2024, 1, 1, 20, 23, 51), organizer_id=1, diff={"name": {"prev": "bla", "new": "some"}}),

            AddQuizAction(username="user", timestamp=datetime(2024, 1, 1, 20, 23, 51), quiz_id=1),
            EditQuizAction(username="user", timestamp=datetime(2024, 1, 1, 20, 23, 51), quiz_id=1, diff={"name": {"prev": "bla", "new": "some"}}),
            RemoveQuizAction(username="user", timestamp=datetime(2024, 1, 1, 20, 23, 51), quiz_id=1),

            AddAlbumAction(username="user", timestamp=datetime(2024, 1, 1, 20, 23, 51), album_id=1),
            EditAlbumAction(username="user", timestamp=datetime(2024, 1, 1, 20, 23, 51), album_id=1, diff={"title": {"prev": "bla", "new": "some"}}),
            RemoveAlbumAction(username="user", timestamp=datetime(2024, 1, 1, 20, 23, 51), album_id=1),

            AddPhotoAction(username="user", timestamp=datetime(2024, 1, 1, 20, 23, 51), photo_id=1),
            EditPhotoAction(username="user", timestamp=datetime(2024, 1, 1, 20, 23, 51), photo_id=1, diff={"url": {"prev": "bla", "new": "some"}}),
            RemovePhotoAction(username="user", timestamp=datetime(2024, 1, 1, 20, 23, 51), photo_id=1),

            AddMarkupAction(username="user", timestamp=datetime(2024, 1, 1, 20, 23, 51), markup_id=1),
            RemoveMarkupAction(username="user", timestamp=datetime(2024, 1, 1, 20, 23, 51), markup_id=1),

            AddPaidDateAction(username="user", timestamp=datetime(2024, 1, 1, 20, 23, 51), paid_date=PaidDate(username="user", date=datetime(2024, 9, 28)))
        ]

        for history_action in history_actions:
            history_action_dict = history_action.to_dict()
            history_action_from_dict = HistoryAction.from_dict(history_action_dict)
            self.assertEqual(history_action, history_action_from_dict)
