import logging
from datetime import datetime
from typing import Dict, List, Optional

from src import Database
from src.entities.history_action import AddPlaceAction, EditPlaceAction
from src.entities.place import Place


class PlaceDatabase:
    def __init__(self, database: Database, logger: logging.Logger) -> None:
        self.database = database
        self.logger = logger

    def get_count(self) -> int:
        return self.database.places.count_documents({})

    def add_place(self, place: Place, username: str) -> None:
        action = AddPlaceAction(username=username, timestamp=datetime.now(), place_id=place.place_id)
        self.database.places.insert_one(place.to_dict())
        self.database.history.insert_one(action.to_dict())
        self.logger.info(f'Added place "{place.name}" ({place.place_id}) by @{username}')

    def update_place(self, place_id: int, diff: dict, username: str) -> None:
        if not diff:
            return

        place = self.database.places.find_one({"place_id": place_id}, {"name": 1})
        assert place is not None

        action = EditPlaceAction(username=username, timestamp=datetime.now(), place_id=place_id, diff=diff)
        self.database.places.update_one({"place_id": place_id}, {"$set": {key: key_diff["new"] for key, key_diff in diff.items()}})
        self.database.history.insert_one(action.to_dict())
        self.logger.info(f'Updated place "{place["name"]}" ({place_id}) by @{username} (keys: {[key for key in diff]})')

    def get_place(self, place_id: int) -> Optional[Place]:
        place = self.database.places.find_one({"place_id": place_id})
        return Place.from_dict(place) if place else None

    def get_places(self, place_ids: List[int]) -> Dict[int, Place]:
        return {place["place_id"]: Place.from_dict(place) for place in self.database.places.find({"place_id": {"$in": place_ids}})}
