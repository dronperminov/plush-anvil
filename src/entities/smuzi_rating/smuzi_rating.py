from dataclasses import dataclass
from typing import Optional

from src.entities.smuzi_rating.next_level_info import NextLevelInfo
from src.entities.smuzi_rating.smuzi_level import SmuziLevel


@dataclass
class RatingInfo:
    rating: int
    mean_rating: float
    games: int
    curr_level: SmuziLevel
    next_level: Optional[NextLevelInfo]
