from dataclasses import dataclass
from datetime import datetime
from typing import Optional

from src.entities.birth_date import BirthDate
from src.enums import UserRole


@dataclass
class User:
    username: str
    password_hash: str
    full_name: str
    role: UserRole
    avatar_url: str
    birth_date: Optional[BirthDate]
    stickers_start_date: Optional[datetime]

    def to_dict(self) -> dict:
        return {
            "username": self.username,
            "password_hash": self.password_hash,
            "full_name": self.full_name,
            "role": self.role.value,
            "avatar_url": self.avatar_url,
            "birth_date": self.birth_date.to_dict() if self.birth_date else None,
            "stickers_start_date": self.stickers_start_date
        }

    @classmethod
    def from_dict(cls: "User", data: dict) -> "User":
        return cls(
            username=data["username"],
            password_hash=data["password_hash"],
            full_name=data["full_name"],
            role=UserRole(data["role"]),
            avatar_url=data["avatar_url"],
            birth_date=BirthDate.from_dict(data["birth_date"]) if data["birth_date"] else None,
            stickers_start_date=data["stickers_start_date"]
        )

    def is_valid_sticker_date(self, date: datetime) -> bool:
        return self.stickers_start_date is not None and self.stickers_start_date <= date
