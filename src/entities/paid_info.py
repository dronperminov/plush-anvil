from dataclasses import dataclass
from datetime import datetime

from src.enums import PaidType


@dataclass
class PaidInfo:
    date: datetime
    paid_type: PaidType
    extra: bool
