from dataclasses import dataclass
from datetime import date, datetime, timedelta

from src.entities.smuzi_rating.smuzi_level import SmuziLevel


@dataclass
class NextLevelInfo:
    lost_games: int
    lost_score: float
    lost_days: int
    end_date: date
    level: SmuziLevel

    @classmethod
    def evaluate(cls: "NextLevelInfo", rating: int, games: int, start_date: datetime, next_level: SmuziLevel) -> "NextLevelInfo":
        today = datetime.now().date()
        lost_games = round((next_level.score - rating) / (rating / games) + 0.5)
        days = (today - start_date.date()).days
        lost_days = round(days / games * lost_games + 0.5)

        return cls(
            lost_games=lost_games,
            lost_score=next_level.score - rating,
            lost_days=lost_days,
            end_date=today + timedelta(days=lost_days),
            level=next_level
        )
