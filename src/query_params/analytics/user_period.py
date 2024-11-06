from dataclasses import dataclass
from typing import Optional

from src.utils.date import parse_period


@dataclass
class UserPeriod:
    username: Optional[str] = None
    period: str = ""

    def to_query(self, username_key: str, period_key: str) -> dict:
        query = {}

        if self.username:
            query[username_key] = self.username

        if period := parse_period(period=self.period):
            start_date, end_date = period
            query[period_key] = {"$gte": start_date, "$lte": end_date}

        return query
