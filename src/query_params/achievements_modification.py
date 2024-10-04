from dataclasses import dataclass
from datetime import datetime
from typing import List

from src.enums import HandleAchievementType


@dataclass
class UserAchievement:
    username: str
    count: int


@dataclass
class AchievementsModification:
    date: datetime
    users: List[UserAchievement]
    achievement_type: HandleAchievementType
    action: str

    @property
    def usernames(self) -> List[str]:
        return [user.username for user in self.users]
