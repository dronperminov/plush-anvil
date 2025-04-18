from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional

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
    participants: List[str]
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
            "participants": self.participants,
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
            participants=data["participants"],
            result=QuizResult.from_dict(data["result"]) if data["result"] else None
        )

    def get_diff(self, data: dict) -> dict:
        quiz_data = self.to_dict()
        diff = {}

        fields = [
            "name", "short_name", "description", "datetime", "cost", "place_id", "organizer_id",
            "category", "album_id", "participants", "result"
        ]

        for field in fields:
            if field in data and quiz_data[field] != data[field]:
                diff[field] = {"prev": quiz_data[field], "new": data[field]}

        return diff

    def get_album_title(self, place: str) -> str:
        return f'{self.name} ({self.datetime.strftime("%d.%m.%Y")}) {self.datetime.strftime("%H:%M")} {place}'
