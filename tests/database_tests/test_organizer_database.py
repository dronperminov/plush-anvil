from src.entities.organizer import Organizer
from tests.database_tests.abstract_database_test import AbstractDatabaseTest


class TestOrganizerDatabaseReal(AbstractDatabaseTest):
    def test_1_insert_organizer(self) -> None:
        self.assertEqual(self.organizer_database.get_count(), 0)
        self.assertIsNone(self.organizer_database.get_organizer(organizer_id=1))

        organizer_id = self.database.get_identifier("organizers")
        organizer = Organizer(
            organizer_id=organizer_id,
            name="Смузи",
            image_url="/images/organizers/1.png"
        )

        self.organizer_database.add_organizer(organizer=organizer, username="user")

        self.assertEqual(self.organizer_database.get_count(), 1)
        inserted_organizer = self.organizer_database.get_organizer(organizer_id=1)
        self.assertIsNotNone(inserted_organizer)
        self.assertEqual(organizer, inserted_organizer)

    def test_2_update_organizer(self) -> None:
        organizer = self.organizer_database.get_organizer(organizer_id=1)
        self.organizer_database.update_organizer(organizer_id=1, diff=organizer.get_diff({"name": "Новые СМУЗИ"}), username="user")

        updated_organizer = self.organizer_database.get_organizer(organizer_id=1)
        self.assertIsNotNone(updated_organizer)

        self.assertEqual(organizer.name, "Смузи")
        self.assertEqual(updated_organizer.name, "Новые СМУЗИ")
