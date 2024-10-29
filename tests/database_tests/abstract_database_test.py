import os
from unittest import TestCase

from src import Database, logger
from src.databases.album_database import AlbumDatabase
from src.databases.organizer_database import OrganizerDatabase
from src.databases.place_database import PlaceDatabase
from src.databases.quiz_database import QuizDatabase


class AbstractDatabaseTest(TestCase):
    database: Database
    place_database: PlaceDatabase
    organizer_database: OrganizerDatabase
    album_database: AlbumDatabase
    quiz_database: QuizDatabase
    data_path = os.path.join(os.path.dirname(__file__), "..", "data")

    @classmethod
    def setUpClass(cls: "AbstractDatabaseTest") -> None:
        cls.database = Database("mongodb://localhost:27017/", database_name="test_plush_anvil_db", logger=logger)
        cls.database.connect()
        cls.place_database = PlaceDatabase(database=cls.database, logger=logger)
        cls.organizer_database = OrganizerDatabase(database=cls.database, logger=logger)
        cls.album_database = AlbumDatabase(database=cls.database, logger=logger)
        cls.quiz_database = QuizDatabase(database=cls.database, place_database=cls.place_database, organizer_database=cls.organizer_database, logger=logger)

    @classmethod
    def tearDownClass(cls: "AbstractDatabaseTest") -> None:
        cls.database.drop()
        cls.database.close()
