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
