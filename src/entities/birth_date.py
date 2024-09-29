from dataclasses import dataclass
from datetime import datetime


@dataclass
class BirthDate:
    day: int
    month: int

    def to_dict(self) -> dict:
        return {
            "day": self.day,
            "month": self.month
        }

    @classmethod
    def from_dict(cls: "BirthDate", data: dict) -> "BirthDate":
        return cls(
            day=data["day"],
            month=data["month"]
        )

    def get_days(self) -> int:
        today = datetime.now()
        year = today.year + 1 if (self.month, self.day) < (today.month, today.day) else today.year
        return (datetime(year, self.month, self.day) - datetime(today.year, today.month, today.day)).days
