from dataclasses import dataclass


@dataclass
class GamesResult:
    wins: int
    top3: int
    top10: int
    games: int
