from dataclasses import dataclass
from typing import List

from src.entities.quiz import Quiz


@dataclass
class TeamAnalytics:
    games: int
    wins: int
    top3: int
    mean_position: float
    mean_players: float

    @classmethod
    def evaluate(cls: "TeamAnalytics", quizzes: List[Quiz]) -> "TeamAnalytics":
        games = 0
        wins = 0
        top3 = 0
        positions = 0
        players = 0

        for quiz in quizzes:
            if not quiz.result:
                continue

            if quiz.result.position == 1:
                wins += 1

            if 1 <= quiz.result.position <= 3:
                top3 += 1

            games += 1
            positions += quiz.result.position
            players += quiz.result.players

        return cls(
            games=games,
            wins=wins,
            top3=top3,
            mean_position=positions / max(games, 1),
            mean_players=players / max(games, 1)
        )
