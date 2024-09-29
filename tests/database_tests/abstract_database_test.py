import os
from unittest import TestCase

from src import Database, logger
from src.databases.organizer_database import OrganizerDatabase
from src.databases.place_database import PlaceDatabase
from src.databases.quiz_database import QuizDatabase


class AbstractDatabaseTest(TestCase):
    database: Database
    place_database: PlaceDatabase
    organizer_database: OrganizerDatabase
    quiz_database: QuizDatabase
    data_path = os.path.join(os.path.dirname(__file__), "..", "data")

    @classmethod
    def setUpClass(cls: "AbstractDatabaseTest") -> None:
        cls.database = Database("mongodb://localhost:27017/", database_name="test_plush_anvil_db", logger=logger)
        cls.database.connect()
        cls.place_database = PlaceDatabase(database=cls.database, logger=logger)
        cls.organizer_database = OrganizerDatabase(database=cls.database, logger=logger)
        cls.quiz_database = QuizDatabase(database=cls.database, logger=logger)

    @classmethod
    def tearDownClass(cls: "AbstractDatabaseTest") -> None:
        cls.database.drop()
        cls.database.close()
