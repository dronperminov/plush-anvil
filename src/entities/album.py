from dataclasses import dataclass
from datetime import datetime
from typing import List


@dataclass
class Album:
    album_id: int
    title: str
    photo_ids: List[int]
    date: datetime
    preview_url: str

    def to_dict(self) -> dict:
        return {
            "album_id": self.album_id,
            "title": self.title,
            "photo_ids": self.photo_ids,
            "date": self.date,
            "preview_url": self.preview_url
        }

    @classmethod
    def from_dict(cls: "Album", data: dict) -> "Album":
        return cls(
            album_id=data["album_id"],
            title=data["title"],
            photo_ids=data["photo_ids"],
            date=data["date"],
            preview_url=data["preview_url"]
        )
