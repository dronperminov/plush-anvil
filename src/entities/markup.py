from dataclasses import dataclass


@dataclass
class Markup:
    markup_id: int
    photo_id: int
    username: str
    x: float
    y: float
    width: float
    height: float

    def to_dict(self) -> dict:
        return {
            "markup_id": self.markup_id,
            "photo_id": self.photo_id,
            "username": self.username,
            "x": self.x,
            "y": self.y,
            "width": self.width,
            "height": self.height
        }

    @classmethod
    def from_dict(cls: "Markup", data: dict) -> "Markup":
        return cls(
            markup_id=data["markup_id"],
            photo_id=data["photo_id"],
            username=data["username"],
            x=data["x"],
            y=data["y"],
            width=data["width"],
            height=data["height"],
        )
