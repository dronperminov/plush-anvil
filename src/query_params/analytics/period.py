from dataclasses import dataclass

from src.utils.date import parse_period


@dataclass
class Period:
    period: str = ""

    def to_query(self, key: str) -> dict:
        period = parse_period(period=self.period)
        if not period:
            return {}

        start_date, end_date = period
        return {key: {"$gte": start_date, "$lte": end_date}}
