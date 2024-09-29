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

    def get_diff(self, data: dict) -> dict:
        place_data = self.to_dict()
        diff = {}

        for field in ["name", "description", "image_url"]:
            if field in data and place_data[field] != data[field]:
                diff[field] = {"prev": place_data[field], "new": data[field]}

        return diff
