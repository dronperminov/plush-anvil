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
        name = data["name"]
        username = data["username"]
        timestamp = data["timestamp"]

        if name == SignUpAction.name:
            return SignUpAction(username=username, timestamp=timestamp)

        if name == AddPlaceAction.name:
            return AddPlaceAction(username=username, timestamp=timestamp, place_id=data["place_id"])

        if name == AddOrganizerAction.name:
            return AddOrganizerAction(username=username, timestamp=timestamp, organizer_id=data["organizer_id"])

        if name == AddQuizAction.name:
            return AddQuizAction(username=username, timestamp=timestamp, quiz_id=data["quiz_id"])

        if name == EditQuizAction.name:
            return EditQuizAction(username=username, timestamp=timestamp, quiz_id=data["quiz_id"], diff=data["diff"])

        if name == RemoveQuizAction.name:
            return RemoveQuizAction(username=username, timestamp=timestamp, quiz_id=data["quiz_id"])

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
class AddOrganizerAction(HistoryAction):
    name = "add_organizer"
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
