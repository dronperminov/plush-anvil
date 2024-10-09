import logging
from collections import defaultdict
from datetime import datetime
from typing import Dict, Tuple

from src import Database
from src.entities.analytics.games_result import GamesResult
from src.query_params.analytics.period import Period


class AnalyticsDatabase:
    def __init__(self, database: Database, logger: logging.Logger) -> None:
        self.database = database
        self.logger = logger

    def get_team_activity(self, period: Period) -> Dict[datetime, int]:
        date2count = defaultdict(int)
        for quiz in self.database.quizzes.find(self.__quizzes_query(period=period), {"datetime": 1}):
            date2count[quiz["datetime"]] += 1

        return date2count

    def get_games_result(self, period: Period) -> GamesResult:
        wins, top3, top10, games = 0, 0, 0, 0

        for quiz in self.database.quizzes.find(self.__quizzes_query(period=period), {"result": 1}):
            position = quiz["result"]["position"]

            if position == 1:
                wins += 1
            elif position <= 3:
                top3 += 1
            elif position <= 10:
                top10 += 1

            games += 1

        return GamesResult(wins=wins, top3=top3, top10=top10, games=games)

    def get_positions(self, period: Period, max_position: int = 15) -> Tuple[Dict[int, int], float]:
        position2count = {position + 1: 0 for position in range(max_position + 1)}
        positions = []

        for quiz in self.database.quizzes.find(self.__quizzes_query(period=period), {"result": 1}):
            position = quiz["result"]["position"]
            position2count[min(max_position + 1, position)] += 1
            positions.append(position)

        return position2count, sum(positions) / max(len(positions), 1)

    def __quizzes_query(self, period: Period) -> dict:
        return {**period.to_query("datetime"), "result.position": {"$gt": 0}}
