from dataclasses import dataclass
from datetime import datetime

from fastapi import UploadFile

from src.utils.common import save_file, transliterate
from src.utils.image import crop_image_square


@dataclass
class Organizer:
    organizer_id: int
    name: str
    image_url: str

    def to_dict(self) -> dict:
        return {
            "organizer_id": self.organizer_id,
            "name": self.name,
            "image_url": self.image_url
        }

    @classmethod
    def from_dict(cls: "Organizer", data: dict) -> "Organizer":
        return cls(
            organizer_id=data["organizer_id"],
            name=data["name"],
            image_url=data["image_url"]
        )

    def get_diff(self, data: dict) -> dict:
        place_data = self.to_dict()
        diff = {}

        for field in ["name", "image_url"]:
            if field in data and place_data[field] != data[field]:
                diff[field] = {"prev": place_data[field], "new": data[field]}

        return diff

    def save_image(self, image: UploadFile) -> str:
        image_name = f"{transliterate(self.name)}.png"
        image_path = f"web/images/organizers/{image_name}"
        save_file(file=image, output_path=image_path)
        crop_image_square(path=image_path, size=144)

        return f"/images/organizers/{image_name}?v={int(datetime.now().timestamp())}"
