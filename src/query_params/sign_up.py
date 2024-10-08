from dataclasses import dataclass
from datetime import datetime
from typing import Optional

from src.entities.birth_date import BirthDate
from src.entities.user import User
from src.enums import UserRole
from src.utils.auth import get_password_hash


@dataclass
class SignUp:
    username: str
    password: str
    full_name: str
    birth_date: Optional[BirthDate]

    def to_user(self) -> User:
        return User(
            username=self.username,
            password_hash=get_password_hash(self.password),
            full_name=self.full_name,
            role=UserRole.USER,
            avatar_url="/images/profiles/default.png",
            birth_date=self.birth_date,
            stickers_start_date=datetime.now()
        )
