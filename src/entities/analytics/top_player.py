from dataclasses import dataclass
from typing import Dict

from src.enums import Category


@dataclass
class TopPlayer:
    username: str
    full_name: str
    avatar_url: str
    score: float
    games: int
    category2count: Dict[Category, int]

    def to_dict(self) -> dict:
        return {
            "username": self.username,
            "full_name": self.full_name,
            "avatar_url": self.avatar_url,
            "score": self.score,
            "games": self.games,
            "category2count": {category.value: count for category, count in self.category2count.items()}
        }
