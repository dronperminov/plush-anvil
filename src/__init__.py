import logging
import sys

from src.database import Database
from src.databases.organizer_database import OrganizerDatabase
from src.databases.place_database import PlaceDatabase
from src.databases.quiz_database import QuizDatabase

logging.basicConfig(stream=sys.stdout, level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger()

database = Database(mongo_url="mongodb://localhost:27017/", database_name="plush_anvil_db", logger=logger)
place_database = PlaceDatabase(database=database, logger=logger)
organizer_database = OrganizerDatabase(database=database, logger=logger)
quiz_database = QuizDatabase(database=database, logger=logger)
