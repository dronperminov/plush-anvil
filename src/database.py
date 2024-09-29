import logging
import re
from datetime import datetime
from typing import Optional

from pymongo import ASCENDING, DESCENDING, MongoClient

from src.entities.history_action import SignUpAction
from src.entities.user import User


class Database:
    client: MongoClient = None
    identifiers = None
    users = None

    quizzes = None
    places = None
    organizers = None

    albums = None
    photos = None
    markup = None

    paid_dates = None
    metro_stations = None
    history = None

    def __init__(self, mongo_url: str, database_name: str, logger: logging.Logger) -> None:
        self.mongo_url = mongo_url
        self.database_name = database_name
        self.logger = logger

    def connect(self) -> None:
        self.client = MongoClient(self.mongo_url)
        database = self.client[self.database_name]

        self.identifiers = database["identifiers"]

        for name in ["quizzes", "places", "organizers", "albums", "photos", "markup"]:
            if self.identifiers.find_one({"_id": name}) is None:
                self.identifiers.insert_one({"_id": name, "value": 0})

        self.users = database["users"]
        self.users.create_index([("username", ASCENDING)], unique=True)

        self.quizzes = database["quizzes"]
        self.quizzes.create_index([("quiz_id", ASCENDING)], unique=True)

        self.places = database["places"]
        self.places.create_index([("place_id", ASCENDING)], unique=True)
        self.places.create_index([("name", ASCENDING)], unique=True)

        self.organizers = database["organizers"]
        self.organizers.create_index([("organizer_id", ASCENDING)], unique=True)
        self.organizers.create_index([("name", ASCENDING)], unique=True)

        self.albums = database["albums"]
        self.albums.create_index([("album_id", DESCENDING)], unique=True)
        self.albums.create_index([("name", ASCENDING)])

        self.photos = database["photos"]
        self.photos.create_index([("photo_id", DESCENDING)], unique=True)
        self.photos.create_index([("album_id", DESCENDING)])

        self.markup = database["markup"]
        self.markup.create_index([("markup_id", DESCENDING)], unique=True)
        self.markup.create_index([("photo_id", DESCENDING)])

        self.paid_dates = database["paid_dates"]
        self.metro_stations = database["metro_stations"]

        self.history = database["history"]
        self.history.create_index([("username", ASCENDING)])
        self.history.create_index([("timestamp", ASCENDING)])

    def get_user(self, username: str) -> Optional[User]:
        if not username:
            return None

        user: dict = self.users.find_one({"username": {"$regex": f"^{re.escape(username)}$", "$options": "i"}})
        return User.from_dict(user) if user else None

    def get_identifier(self, collection_name: str) -> int:
        identifier = self.identifiers.find_one_and_update({"_id": collection_name}, {"$inc": {"value": 1}}, return_document=True)
        return identifier["value"]

    def sign_up(self, user: User) -> None:
        action = SignUpAction(username=user.username, timestamp=datetime.now())
        self.users.insert_one(user.to_dict())
        self.history.insert_one(action.to_dict())
        self.logger.info(f'Sign up user "{user.username}" ({user.full_name})')

    def drop(self) -> None:
        self.client.drop_database(self.database_name)

    def close(self) -> None:
        self.client.close()
