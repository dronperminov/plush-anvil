from dataclasses import dataclass


@dataclass
class PageQuery:
    page: int
    page_size: int

    @property
    def skip(self) -> int:
        return self.page * self.page_size
