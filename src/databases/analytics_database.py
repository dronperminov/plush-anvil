import logging
from collections import defaultdict
from datetime import datetime
from typing import Dict

from src import Database
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

    def __quizzes_query(self, period: Period) -> dict:
        return {**period.to_query("datetime"), "result.position": {"$gt": 0}}
