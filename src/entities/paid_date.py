from dataclasses import dataclass
from datetime import datetime


@dataclass
class PaidDate:
    username: str
    date: datetime

    def to_dict(self) -> dict:
        return {
            "username": self.username,
            "date": self.date
        }

    @classmethod
    def from_dict(cls: "PaidDate", data: dict) -> "PaidDate":
        return cls(
            username=data["username"],
            date=data["date"]
        )
