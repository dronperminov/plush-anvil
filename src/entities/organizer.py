from dataclasses import dataclass


@dataclass
class Organizer:
    organizer_id: int
    name: str
    description: str
    image_url: str

    def to_dict(self) -> dict:
        return {
            "organizer_id": self.organizer_id,
            "name": self.name,
            "description": self.description,
            "image_url": self.image_url
        }

    @classmethod
    def from_dict(cls: "Organizer", data: dict) -> "Organizer":
        return cls(
            organizer_id=data["organizer_id"],
            name=data["name"],
            description=data["description"],
            image_url=data["image_url"]
        )
