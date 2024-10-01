from dataclasses import dataclass, field
from datetime import datetime

from src.entities.paid_date import PaidDate


@dataclass
class HistoryAction:
    name: str = field(init=False)
    username: str
    timestamp: datetime

    def __post_init__(self) -> None:
        self.timestamp = self.timestamp.replace(microsecond=0)

    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "username": self.username,
            "timestamp": self.timestamp
        }

    @classmethod
    def from_dict(cls: "HistoryAction", data: dict) -> "HistoryAction":
        name = data["name"]
        username = data["username"]
        timestamp = data["timestamp"]

        if name == SignUpAction.name:
            return SignUpAction(username=username, timestamp=timestamp)

        if name == AddPlaceAction.name:
            return AddPlaceAction(username=username, timestamp=timestamp, place_id=data["place_id"])

        if name == EditPlaceAction.name:
            return EditPlaceAction(username=username, timestamp=timestamp, place_id=data["place_id"], diff=data["diff"])

        if name == RemovePlaceAction.name:
            return RemovePlaceAction(username=username, timestamp=timestamp, place_id=data["place_id"])

        if name == AddOrganizerAction.name:
            return AddOrganizerAction(username=username, timestamp=timestamp, organizer_id=data["organizer_id"])

        if name == EditOrganizerAction.name:
            return EditOrganizerAction(username=username, timestamp=timestamp, organizer_id=data["organizer_id"], diff=data["diff"])

        if name == RemoveOrganizerAction.name:
            return RemoveOrganizerAction(username=username, timestamp=timestamp, organizer_id=data["organizer_id"])

        if name == AddQuizAction.name:
            return AddQuizAction(username=username, timestamp=timestamp, quiz_id=data["quiz_id"])

        if name == EditQuizAction.name:
            return EditQuizAction(username=username, timestamp=timestamp, quiz_id=data["quiz_id"], diff=data["diff"])

        if name == RemoveQuizAction.name:
            return RemoveQuizAction(username=username, timestamp=timestamp, quiz_id=data["quiz_id"])

        if name == AddAlbumAction.name:
            return AddAlbumAction(username=username, timestamp=timestamp, album_id=data["album_id"])

        if name == EditAlbumAction.name:
            return EditAlbumAction(username=username, timestamp=timestamp, album_id=data["album_id"], diff=data["diff"])

        if name == RemoveAlbumAction.name:
            return RemoveAlbumAction(username=username, timestamp=timestamp, album_id=data["album_id"])

        if name == AddPhotoAction.name:
            return AddPhotoAction(username=username, timestamp=timestamp, photo_id=data["photo_id"])

        if name == EditPhotoAction.name:
            return EditPhotoAction(username=username, timestamp=timestamp, photo_id=data["photo_id"], diff=data["diff"])

        if name == RemovePhotoAction.name:
            return RemovePhotoAction(username=username, timestamp=timestamp, photo_id=data["photo_id"])

        if name == AddMarkupAction.name:
            return AddMarkupAction(username=username, timestamp=timestamp, markup_id=data["markup_id"])

        if name == RemoveMarkupAction.name:
            return RemoveMarkupAction(username=username, timestamp=timestamp, markup_id=data["markup_id"])

        if name == AddPaidDateAction.name:
            return AddPaidDateAction(username=username, timestamp=timestamp, paid_date=PaidDate.from_dict(data["paid_date"]))

        raise ValueError(f'Invalid HistoryAction name "{name}"')


@dataclass
class SignUpAction(HistoryAction):
    name = "sign_up"


@dataclass
class AddPlaceAction(HistoryAction):
    name = "add_place"
    place_id: int

    def to_dict(self) -> dict:
        return {**super().to_dict(), "place_id": self.place_id}


@dataclass
class EditPlaceAction(HistoryAction):
    name = "edit_place"
    place_id: int
    diff: dict

    def to_dict(self) -> dict:
        return {**super().to_dict(), "place_id": self.place_id, "diff": self.diff}


@dataclass
class RemovePlaceAction(HistoryAction):
    name = "remove_place"
    place_id: int

    def to_dict(self) -> dict:
        return {**super().to_dict(), "place_id": self.place_id}


@dataclass
class AddOrganizerAction(HistoryAction):
    name = "add_organizer"
    organizer_id: int

    def to_dict(self) -> dict:
        return {**super().to_dict(), "organizer_id": self.organizer_id}


@dataclass
class EditOrganizerAction(HistoryAction):
    name = "edit_organizer"
    organizer_id: int
    diff: dict

    def to_dict(self) -> dict:
        return {**super().to_dict(), "organizer_id": self.organizer_id, "diff": self.diff}


@dataclass
class RemoveOrganizerAction(HistoryAction):
    name = "remove_organizer"
    organizer_id: int

    def to_dict(self) -> dict:
        return {**super().to_dict(), "organizer_id": self.organizer_id}


@dataclass
class AddQuizAction(HistoryAction):
    name = "add_quiz"
    quiz_id: int

    def to_dict(self) -> dict:
        return {**super().to_dict(), "quiz_id": self.quiz_id}


@dataclass
class EditQuizAction(HistoryAction):
    name = "edit_quiz"
    quiz_id: int
    diff: dict

    def to_dict(self) -> dict:
        return {**super().to_dict(), "quiz_id": self.quiz_id, "diff": self.diff}


@dataclass
class RemoveQuizAction(HistoryAction):
    name = "remove_quiz"
    quiz_id: int

    def to_dict(self) -> dict:
        return {**super().to_dict(), "quiz_id": self.quiz_id}


@dataclass
class AddAlbumAction(HistoryAction):
    name = "add_album"
    album_id: int

    def to_dict(self) -> dict:
        return {**super().to_dict(), "album_id": self.album_id}


@dataclass
class EditAlbumAction(HistoryAction):
    name = "edit_album"
    album_id: int
    diff: dict

    def to_dict(self) -> dict:
        return {**super().to_dict(), "album_id": self.album_id, "diff": self.diff}


@dataclass
class RemoveAlbumAction(HistoryAction):
    name = "remove_album"
    album_id: int

    def to_dict(self) -> dict:
        return {**super().to_dict(), "album_id": self.album_id}


@dataclass
class AddPhotoAction(HistoryAction):
    name = "add_photo"
    photo_id: int

    def to_dict(self) -> dict:
        return {**super().to_dict(), "photo_id": self.photo_id}


@dataclass
class EditPhotoAction(HistoryAction):
    name = "edit_photo"
    photo_id: int
    diff: dict

    def to_dict(self) -> dict:
        return {**super().to_dict(), "photo_id": self.photo_id, "diff": self.diff}


@dataclass
class RemovePhotoAction(HistoryAction):
    name = "remove_photo"
    photo_id: int

    def to_dict(self) -> dict:
        return {**super().to_dict(), "photo_id": self.photo_id}


@dataclass
class AddMarkupAction(HistoryAction):
    name = "add_markup"
    markup_id: int

    def to_dict(self) -> dict:
        return {**super().to_dict(), "markup_id": self.markup_id}


@dataclass
class RemoveMarkupAction(HistoryAction):
    name = "remove_markup"
    markup_id: int

    def to_dict(self) -> dict:
        return {**super().to_dict(), "markup_id": self.markup_id}


@dataclass
class AddPaidDateAction(HistoryAction):
    name = "add_paid_date"
    paid_date: PaidDate

    def to_dict(self) -> dict:
        return {**super().to_dict(), "paid_date": self.paid_date.to_dict()}
