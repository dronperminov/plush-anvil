from dataclasses import dataclass
from typing import Dict

from src.enums import Category


@dataclass
class CategoryAnalytics:
    category: Category
    games: int
    wins: int
    top3: int
    top10: int
    mean_position: float
    positions: Dict[int, int]
