from enum import Enum


class PaidType(Enum):
    PAID = "paid"
    FREE = "free"
    STICKERS = "stickers"

    def to_rus(self) -> str:
        paid_type2rus = {
            PaidType.PAID: "платно",
            PaidType.FREE: "бесплатно",
            PaidType.STICKERS: "за наклейки",
        }

        return paid_type2rus[self]

    def to_games(self) -> int:
        paid_type2games = {
            PaidType.PAID: 1,
            PaidType.STICKERS: -10,
            PaidType.FREE: 0
        }
        return paid_type2games[self]
