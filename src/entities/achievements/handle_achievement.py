from dataclasses import dataclass
from datetime import datetime

from src.enums import HandleAchievementType


@dataclass
class HandleAchievement:
    achievement_id: int
    username: str
    date: datetime
    achievement_type: HandleAchievementType

    def to_dict(self) -> dict:
        return {
            "achievement_id": self.achievement_id,
            "username": self.username,
            "date": self.date,
            "achievement_type": self.achievement_type.value
        }

    @classmethod
    def from_dict(cls: "HandleAchievement", data: dict) -> "HandleAchievement":
        return cls(
            achievement_id=data["achievement_id"],
            username=data["username"],
            date=data["date"],
            achievement_type=HandleAchievementType(data["achievement_type"])
        )
