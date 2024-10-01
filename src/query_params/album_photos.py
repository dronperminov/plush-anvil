from dataclasses import dataclass
from typing import Union

from src.query_params.page_query import PageQuery


@dataclass
class AlbumPhotos(PageQuery):
    album_id: Union[int, str]
