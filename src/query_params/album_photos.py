from dataclasses import dataclass


@dataclass
class AlbumPhotos:
    album_id: int
    page: int = 0
    page_size: int = 20
