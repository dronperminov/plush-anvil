from datetime import datetime

from src.entities.album import Album
from src.entities.markup import Markup
from src.entities.photo import Photo
from tests.database_tests.abstract_database_test import AbstractDatabaseTest


class TestPlaceDatabaseReal(AbstractDatabaseTest):
    def test_1_insert_album(self) -> None:
        self.assertEqual(self.album_database.get_albums_count(), 0)
        self.assertIsNone(self.album_database.get_album(album_id=1))

        album_id = self.database.get_identifier("albums")
        album = Album(
            album_id=album_id,
            title="Album title",
            photo_ids=[],
            date=datetime(2024, 9, 29, 15, 34, 7),
            cover_id=None
        )

        self.album_database.add_album(album=album, username="user")

        self.assertEqual(self.album_database.get_albums_count(), 1)
        inserted_album = self.album_database.get_album(album_id=1)
        self.assertIsNotNone(inserted_album)
        self.assertEqual(album, inserted_album)
        self.assertIsNone(inserted_album.cover_id)

    def test_2_insert_photos(self) -> None:
        photos_count = 5

        for i in range(photos_count):
            photo_id = self.database.get_identifier("photos")
            photo = Photo(
                photo_id=photo_id,
                album_id=1,
                url=f"url {i}",
                preview_url=f"preview url {i}",
                markup_ids=[],
                timestamp=datetime.now()
            )
            self.album_database.add_photo(photo=photo, username="user")

        album = self.album_database.get_album(album_id=1)
        self.assertEqual(len(album.photo_ids), photos_count)
        self.assertEqual(album.photo_ids[0], 1)
        self.assertEqual(album.photo_ids[-1], photos_count)
        self.assertEqual(album.cover_id, 1)

    def test_3_insert_markups(self) -> None:
        markups_count = 3
        photo_id = 3

        for i in range(markups_count):
            markup_id = self.database.get_identifier("markup")
            markup = Markup(
                markup_id=markup_id,
                photo_id=photo_id,
                username=f"user{i}",
                x=0.1 * i,
                y=0.3 * i,
                width=0.5,
                height=0.5
            )
            self.album_database.add_markup(markup=markup, username="user")

        photo = self.album_database.get_photo(photo_id=photo_id)
        self.assertEqual(len(photo.markup_ids), markups_count)
        self.assertEqual(photo.markup_ids[0], 1)
        self.assertEqual(photo.markup_ids[-1], markups_count)

        photo = self.album_database.get_photo(photo_id=1)
        self.assertEqual(len(photo.markup_ids), 0)

    def test_4_remove_markup(self) -> None:
        self.album_database.remove_markup(markup_id=2, username="user")

        photo = self.album_database.get_photo(photo_id=3)
        self.assertEqual(len(photo.markup_ids), 2)
        self.assertEqual(photo.markup_ids[0], 1)
        self.assertEqual(photo.markup_ids[-1], 3)

    def test_5_remove_photo(self) -> None:
        self.album_database.remove_photo(photo_id=4, username="user")
        self.assertIsNone(self.album_database.get_photo(photo_id=4))
        album = self.album_database.get_album(album_id=1)
        self.assertEqual(len(album.photo_ids), 4)

        self.album_database.remove_photo(photo_id=3, username="user")
        self.assertIsNone(self.album_database.get_photo(photo_id=3))
        album = self.album_database.get_album(album_id=1)
        self.assertEqual(len(album.photo_ids), 3)

        for markup_id in range(3):
            self.assertIsNone(self.album_database.get_markup(markup_id=markup_id + 1))

    def test_6_remove_album(self) -> None:
        self.album_database.remove_album(album_id=1, username="user")
        self.assertIsNone(self.album_database.get_album(album_id=1))
        self.assertEqual(self.album_database.get_albums_count(), 0)
