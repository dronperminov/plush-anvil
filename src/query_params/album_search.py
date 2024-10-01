import re
from dataclasses import dataclass
from typing import Optional

from fastapi import Query

from src.query_params.page_query import PageQuery


@dataclass
class AlbumSearch(PageQuery):
    query: str = ""
    order: str = "date"
    order_type: int = -1

    def to_query(self) -> dict:
        query = {}

        if self.query:
            query["title"] = {"$regex": re.escape(self.query), "$options": "i"}

        return query


@dataclass
class AlbumSearchQuery:
    query: Optional[str] = Query(None)
    order: Optional[str] = Query(None)
    order_type: Optional[int] = Query(None)

    def is_empty(self) -> bool:
        fields = [self.query, self.order, self.order_type]

        for field in fields:
            if field is not None:
                return False

        return True

    def to_search_params(self) -> Optional[AlbumSearch]:
        if self.is_empty():
            return None

        return AlbumSearch(
            query=self.query if self.query is not None else "",
            order=self.order if self.order is not None else "date",
            order_type=self.order_type if self.order_type is not None else -1,
            page_size=12,
            page=0
        )
