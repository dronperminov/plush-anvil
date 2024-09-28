from dataclasses import dataclass
from typing import List


@dataclass
class Photo:
    photo_id: int
    album_id: int
    url: str
    preview_url: str
    markup_ids: List[int]

    def to_dict(self) -> dict:
        return {
            "photo_id": self.photo_id,
            "album_id": self.album_id,
            "url": self.url,
            "preview_url": self.preview_url,
            "markup_ids": self.markup_ids
        }

    @classmethod
    def from_dict(cls: "Photo", data: dict) -> "Photo":
        return cls(
            photo_id=data["photo_id"],
            album_id=data["album_id"],
            url=data["url"],
            preview_url=data["preview_url"],
            markup_ids=data["markup_ids"]
        )
