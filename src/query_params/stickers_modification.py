from dataclasses import dataclass
from datetime import datetime
from typing import List

from src.entities.paid_date import PaidDate


@dataclass
class UserSticker:
    username: str
    count: int


@dataclass
class StickersModification:
    date: datetime
    users: List[UserSticker]
    action: str

    def to_paid_dates(self) -> List[PaidDate]:
        return [PaidDate(username=user.username, date=self.date) for user in self.users for _ in range(user.count)]

    @property
    def usernames(self) -> List[str]:
        return [user.username for user in self.users]
