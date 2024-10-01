import logging
from collections import defaultdict
from datetime import datetime
from typing import Dict, List, Optional

from src import Database
from src.entities.history_action import AddPlaceAction, EditPlaceAction, RemovePlaceAction
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

    def remove_place(self, place_id: int, username: str) -> None:
        place = self.get_place(place_id=place_id)
        assert place is not None

        action = RemovePlaceAction(username=username, timestamp=datetime.now(), place_id=place_id)
        self.database.places.delete_one({"place_id": place_id})

        self.database.history.insert_one(action.to_dict())
        self.logger.info(f"Removed place {place_id} by @{username}")

    def get_place(self, place_id: int) -> Optional[Place]:
        place = self.database.places.find_one({"place_id": place_id})
        return Place.from_dict(place) if place else None

    def get_places(self, place_ids: List[int]) -> Dict[int, Place]:
        return {place["place_id"]: Place.from_dict(place) for place in self.database.places.find({"place_id": {"$in": place_ids}})}

    def get_all_places(self) -> List[Place]:
        today = datetime.now()
        place_id2score = defaultdict(float)

        for quiz in self.database.quizzes.find({"result.position": {"$gt": 0}}):
            place_id2score[quiz["place_id"]] += 0.98 ** (today - quiz["datetime"]).days

        places = [Place.from_dict(place) for place in self.database.places.find({})]
        return sorted(places, key=lambda place: -place_id2score.get(place.place_id, 0))
