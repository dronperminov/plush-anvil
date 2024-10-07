from dataclasses import dataclass


@dataclass
class RenameAlbum:
    album_id: int
    title: str
