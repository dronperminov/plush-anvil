from dataclasses import dataclass, field
from datetime import datetime


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
        name = data.pop("name")
        username = data.pop("username")
        timestamp = data.pop("timestamp")

        actions = [
            SignUpAction,
            AddPlaceAction, EditPlaceAction, RemovePlaceAction,
            AddOrganizerAction, EditOrganizerAction, RemoveOrganizerAction,
            AddQuizAction, EditQuizAction, RemoveQuizAction,
            AddAlbumAction, EditAlbumAction, RemoveAlbumAction,
            AddPhotoAction, EditPhotoAction, RemovePhotoAction,
            AddMarkupAction, RemoveMarkupAction,
            AddAchievementAction, RemoveAchievementAction
        ]

        for action in actions:
            if name == action.name:
                return action(username=username, timestamp=timestamp, **data)

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
class AddAchievementAction(HistoryAction):
    name = "add_achievement"
    achievement_id: int

    def to_dict(self) -> dict:
        return {**super().to_dict(), "achievement_id": self.achievement_id}


@dataclass
class RemoveAchievementAction(HistoryAction):
    name = "remove_achievement"
    achievement_id: int

    def to_dict(self) -> dict:
        return {**super().to_dict(), "achievement_id": self.achievement_id}
