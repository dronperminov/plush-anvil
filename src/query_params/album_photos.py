from dataclasses import dataclass
from typing import Union


@dataclass
class AlbumPhotos:
    album_id: Union[int, str]
    page: int = 0
    page_size: int = 20
