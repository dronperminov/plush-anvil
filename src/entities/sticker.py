from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional

from src.entities.paid_info import PaidInfo
from src.enums import PaidType


@dataclass
class Sticker:
    used: Optional[datetime]
    dates: List[datetime]

    def is_full(self) -> bool:
        return len(self.dates) == 10

    def add(self, date: datetime) -> None:
        self.dates.append(date)

    @classmethod
    def from_paid_infos(cls: "Sticker", paid_infos: List[PaidInfo]) -> List["Sticker"]:
        stickers = []

        for paid_info in paid_infos[::-1]:
            if paid_info.paid_type != PaidType.PAID:
                continue

            if not stickers or stickers[-1].is_full():
                stickers.append(Sticker(used=None, dates=[]))

            stickers[-1].add(paid_info.date)

        last_used = -1
        for paid_info in paid_infos[::-1]:
            if paid_info.paid_type == PaidType.STICKERS:
                last_used += 1
                stickers[last_used].used = paid_info.date

        return stickers[::-1]
