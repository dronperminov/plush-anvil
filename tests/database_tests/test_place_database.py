from src.entities.place import Place
from tests.database_tests.abstract_database_test import AbstractDatabaseTest


class TestPlaceDatabaseReal(AbstractDatabaseTest):
    def test_1_insert_place(self) -> None:
        self.assertEqual(self.place_database.get_count(), 0)
        self.assertIsNone(self.place_database.get_place(place_id=1))

        place_id = self.database.get_identifier("places")
        place = Place(
            place_id=place_id,
            name="Золберг",
            address="1-й Люсиновский пер., 3Б",
            yandex_map_link="https://yandex.ru/maps/org/zolberg/24466940993/",
            metro_station="Добрынинская",
            color="#ff00f0"
        )

        self.place_database.add_place(place=place, username="user")

        self.assertEqual(self.place_database.get_count(), 1)
        inserted_place = self.place_database.get_place(place_id=1)
        self.assertIsNotNone(inserted_place)
        self.assertEqual(place, inserted_place)

    def test_2_update_place(self) -> None:
        place = self.place_database.get_place(place_id=1)
        self.place_database.update_place(place_id=1, diff=place.get_diff({"name": "Золберг 2.0", "color": "#fff"}), username="user")

        updated_place = self.place_database.get_place(place_id=1)
        self.assertIsNotNone(updated_place)

        self.assertEqual(place.name, "Золберг")
        self.assertEqual(updated_place.name, "Золберг 2.0")

        self.assertEqual(place.color, "#ff00f0")
        self.assertEqual(updated_place.color, "#fff")
