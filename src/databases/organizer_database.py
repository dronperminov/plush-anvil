import logging
from collections import defaultdict
from datetime import datetime
from typing import Dict, List, Optional

from src import Database
from src.entities.history_action import AddOrganizerAction, EditOrganizerAction, RemoveOrganizerAction
from src.entities.organizer import Organizer
from src.entities.quiz import Quiz


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

    def remove_organizer(self, organizer_id: int, username: str) -> None:
        organizer = self.get_organizer(organizer_id=organizer_id)
        assert organizer is not None

        action = RemoveOrganizerAction(username=username, timestamp=datetime.now(), organizer_id=organizer_id)
        self.database.organizers.delete_one({"organizer_id": organizer_id})

        self.database.history.insert_one(action.to_dict())
        self.logger.info(f"Removed organizer {organizer_id} by @{username}")

    def get_organizer(self, organizer_id: int) -> Optional[Organizer]:
        organizer = self.database.organizers.find_one({"organizer_id": organizer_id})
        return Organizer.from_dict(organizer) if organizer else None

    def get_organizers(self, organizer_ids: List[int]) -> Dict[int, Organizer]:
        return {organizer["organizer_id"]: Organizer.from_dict(organizer) for organizer in self.database.organizers.find({"organizer_id": {"$in": organizer_ids}})}

    def get_all_organizers(self) -> List[Organizer]:
        quizzes = [Quiz.from_dict(quiz) for quiz in self.database.quizzes.find({"result.position": {"$gt": 0}})]
        return self.get_quiz_organizers(quizzes=quizzes, only_used=False)

    def get_quiz_organizers(self, quizzes: List[Quiz], only_used: bool) -> List[Organizer]:
        today = datetime.now()
        organizer_id2score: Dict[int, float] = defaultdict(float)

        for quiz in quizzes:
            organizer_id2score[quiz.organizer_id] += 0.98 ** (today - quiz.datetime).days

        query = {"organizer_id": {"$in": list(organizer_id2score)}} if only_used else {}
        organizers = [Organizer.from_dict(organizer) for organizer in self.database.organizers.find(query)]
        return sorted(organizers, key=lambda organizer: -organizer_id2score.get(organizer.organizer_id, 0))
