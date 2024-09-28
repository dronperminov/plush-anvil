from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional

from src.entities.quiz_participant import QuizParticipant
from src.entities.quiz_result import QuizResult
from src.enums import Category


@dataclass
class Quiz:
    quiz_id: int
    name: str
    short_name: str
    description: str
    datetime: datetime
    cost: int
    place_id: int
    organizer_id: int
    category: Category

    album_id: Optional[int]
    ignore_rating: Optional[bool]
    participants: List[QuizParticipant]
    result: Optional[QuizResult]

    def to_dict(self) -> dict:
        return {
            "quiz_id": self.quiz_id,
            "name": self.name,
            "short_name": self.short_name,
            "description": self.description,
            "datetime": self.datetime,
            "cost": self.cost,
            "place_id": self.place_id,
            "organizer_id": self.organizer_id,
            "category": self.category.value,
            "album_id": self.album_id,
            "ignore_rating": self.ignore_rating,
            "participants": [participant.to_dict() for participant in self.participants],
            "result": self.result.to_dict() if self.result else None
        }

    @classmethod
    def from_dict(cls: "Quiz", data: dict) -> "Quiz":
        return cls(
            quiz_id=data["quiz_id"],
            name=data["name"],
            short_name=data["short_name"],
            description=data["description"],
            datetime=data["datetime"],
            cost=data["cost"],
            place_id=data["place_id"],
            organizer_id=data["organizer_id"],
            category=Category(data["category"]),
            album_id=data["album_id"],
            ignore_rating=data["ignore_rating"],
            participants=[QuizParticipant.from_dict(participant) for participant in data["participants"]],
            result=QuizResult.from_dict(data["result"]) if data["result"] else None
        )
