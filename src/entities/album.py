from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional


@dataclass
class Album:
    album_id: int
    title: str
    photo_ids: List[int]
    date: datetime
    cover_id: Optional[int]

    def to_dict(self) -> dict:
        return {
            "album_id": self.album_id,
            "title": self.title,
            "photo_ids": self.photo_ids,
            "date": self.date,
            "cover_id": self.cover_id
        }

    @classmethod
    def from_dict(cls: "Album", data: dict) -> "Album":
        return cls(
            album_id=data["album_id"],
            title=data["title"],
            photo_ids=data["photo_ids"],
            date=data["date"],
            cover_id=data["cover_id"]
        )

    def get_diff(self, data: dict) -> dict:
        album_data = self.to_dict()
        diff = {}

        for field in ["title", "photo_ids", "date", "cover_id"]:
            if field in data and album_data[field] != data[field]:
                diff[field] = {"prev": album_data[field], "new": data[field]}

        return diff
