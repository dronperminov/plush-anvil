from dataclasses import dataclass
from typing import List

from src.entities.analytics.top_player import TopPlayer


@dataclass
class MonthAnalytics:
    month: int
    year: int
    games: int
    wins: int
    prizes: int
    top3: int
    mean_position: float
    mean_players: float
    top_players: List[TopPlayer]
