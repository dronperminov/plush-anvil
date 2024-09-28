from dataclasses import dataclass
from typing import Optional


@dataclass
class Place:
    place_id: int
    name: str
    address: str
    yandex_map_link: str
    metro_station: Optional[str]
    color: str

    def to_dict(self) -> dict:
        return {
            "place_id": self.place_id,
            "name": self.name,
            "address": self.address,
            "yandex_map_link": self.yandex_map_link,
            "metro_station": self.metro_station,
            "color": self.color
        }

    @classmethod
    def from_dict(cls: "Place", data: dict) -> "Place":
        return cls(
            place_id=data["place_id"],
            name=data["name"],
            address=data["address"],
            yandex_map_link=data["yandex_map_link"],
            metro_station=data["metro_station"],
            color=data["color"]
        )
