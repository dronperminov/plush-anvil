from dataclasses import dataclass


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
