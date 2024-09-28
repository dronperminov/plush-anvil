from enum import Enum


class PaidType(Enum):
    PAID = "paid"
    FREE = "free"
    PASS = "pass"

    def to_rus(self) -> str:
        paid_type2rus = {
            PaidType.PAID: "платно",
            PaidType.FREE: "бесплатно",
            PaidType.PASS: "за наклейки",
        }

        return paid_type2rus[self]
