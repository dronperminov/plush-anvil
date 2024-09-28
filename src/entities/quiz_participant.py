from dataclasses import dataclass

from src.enums import PaidType


@dataclass
class QuizParticipant:
    username: str
    paid_type: PaidType

    def to_dict(self) -> dict:
        return {
            "username": self.username,
            "paid_type": self.paid_type.value,
        }

    @classmethod
    def from_dict(cls: "QuizParticipant", data: dict) -> "QuizParticipant":
        return cls(
            username=data["username"],
            paid_type=PaidType(data["paid_type"])
        )
