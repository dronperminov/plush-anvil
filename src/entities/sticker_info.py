from dataclasses import dataclass
from typing import List

from src.entities.paid_info import PaidInfo


@dataclass
class StickerInfo:
    games: int
    paid_infos: List[PaidInfo]
