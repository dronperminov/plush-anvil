import logging
from datetime import datetime
from typing import List, Optional

from src import Database
from src.entities.history_action import AddOrganizerAction, EditOrganizerAction
from src.entities.organizer import Organizer


class OrganizerDatabase:
    def __init__(self, database: Database, logger: logging.Logger) -> None:
        self.database = database
        self.logger = logger

    def get_count(self) -> int:
        return self.database.organizers.count_documents({})

    def add_organizer(self, organizer: Organizer, username: str) -> None:
        action = AddOrganizerAction(username=username, timestamp=datetime.now(), organizer_id=organizer.organizer_id)
        self.database.organizers.insert_one(organizer.to_dict())
        self.database.history.insert_one(action.to_dict())
        self.logger.info(f'Added organizer "{organizer.name}" ({organizer.organizer_id}) by @{username}')

    def update_organizer(self, organizer_id: int, diff: dict, username: str) -> None:
        if not diff:
            return

        organizer = self.database.organizers.find_one({"organizer_id": organizer_id}, {"name": 1})
        assert organizer is not None

        action = EditOrganizerAction(username=username, timestamp=datetime.now(), organizer_id=organizer_id, diff=diff)
        self.database.organizers.update_one({"organizer_id": organizer_id}, {"$set": {key: key_diff["new"] for key, key_diff in diff.items()}})
        self.database.history.insert_one(action.to_dict())
        self.logger.info(f'Updated organizer "{organizer["name"]}" ({organizer_id}) by @{username} (keys: {[key for key in diff]})')

    def get_organizer(self, organizer_id: int) -> Optional[Organizer]:
        organizer = self.database.organizers.find_one({"organizer_id": organizer_id})
        return Organizer.from_dict(organizer) if organizer else None

    def get_organizers(self) -> List[Organizer]:
        return [Organizer.from_dict(organizer) for organizer in self.database.organizers.find({})]
