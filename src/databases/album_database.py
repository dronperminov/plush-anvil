import json
import logging
from collections import defaultdict
from datetime import datetime
from typing import Dict, List, Optional, Tuple, Union

from src import Database
from src.entities.album import Album
from src.entities.history_action import AddAlbumAction, AddMarkupAction, AddPhotoAction, EditAlbumAction, EditPhotoAction, EditQuizAction, RemoveAlbumAction, \
    RemoveMarkupAction, RemovePhotoAction
from src.entities.markup import Markup
from src.entities.photo import Photo
from src.entities.quiz import Quiz
from src.entities.user import User
from src.query_params.album_photos import AlbumPhotos
from src.query_params.album_search import AlbumSearch


class AlbumDatabase:
    def __init__(self, database: Database, logger: logging.Logger) -> None:
        self.database = database
        self.logger = logger
        self.markup_score_alpha = 0.98

    def get_albums_count(self) -> int:
        return self.database.albums.count_documents({})

    def add_album(self, album: Album, username: str) -> None:
        action = AddAlbumAction(username=username, timestamp=datetime.now(), album_id=album.album_id)
        self.database.albums.insert_one(album.to_dict())
        self.database.history.insert_one(action.to_dict())
        self.logger.info(f'Added album "{album.title}" ({album.album_id}) by @{username}')

    def update_album(self, album_id: int, diff: dict, username: str) -> None:
        if not diff:
            return

        album = self.database.albums.find_one({"album_id": album_id}, {"title": 1})
        assert album is not None

        action = EditAlbumAction(username=username, timestamp=datetime.now(), album_id=album_id, diff=diff)
        self.database.albums.update_one({"album_id": album_id}, {"$set": {key: key_diff["new"] for key, key_diff in diff.items()}})
        self.database.history.insert_one(action.to_dict())
        self.logger.info(f'Updated album "{album["title"]}" ({album_id}) by @{username} (keys: {[key for key in diff]})')

    def remove_album(self, album_id: int, username: str) -> None:
        album = self.get_album(album_id=album_id)
        assert album is not None

        action = RemoveAlbumAction(username=username, timestamp=datetime.now(), album_id=album_id)
        self.database.albums.delete_one({"album_id": album_id})

        for photo_id in album.photo_ids:
            self.remove_photo(photo_id=photo_id, username=username, only_remove=True)

        for quiz in self.database.quizzes.find({"album_id": album_id}):
            quiz = Quiz.from_dict(quiz)
            self.update_quiz(quiz_id=quiz.quiz_id, diff=quiz.get_diff({"album_id": None}), username=username)

        self.database.history.insert_one(action.to_dict())
        self.logger.info(f'Removed album "{album.title}" ({album_id}) by @{username}')

    def get_album(self, album_id: Union[int, str]) -> Optional[Album]:
        if isinstance(album_id, int):
            album = self.database.albums.find_one({"album_id": album_id})
            return Album.from_dict(album) if album else None

        album_data = json.loads(album_id)
        if album_data["type"] == "all_photos":
            return self.__get_all_photos_album()

        if album_data["type"] == "user_photos":
            return self.__get_users_photos_album(usernames=album_data["usernames"], only=album_data["only"])

        if album_data["type"] == "photos_with_me":
            album = self.__get_users_photos_album(usernames=[album_data["username"]], only=album_data["only"])
            album.title = "Фото со мной"
            album.album_id = album_id
            return album

        return None

    def __get_all_photos_album(self) -> Album:
        photo_ids = [photo_id for album in self.database.albums.find({}).sort({"date": -1}) for photo_id in album["photo_ids"]]
        photo_id2photo = self.get_photos(photo_ids=photo_ids)
        photo_ids = sorted(photo_ids, key=lambda photo_id: photo_id2photo[photo_id].timestamp)
        return Album(album_id=json.dumps({"type": "all_photos"}), title="Все фото", photo_ids=photo_ids, date=datetime.now(), cover_id=None)

    def __get_users_photos_album(self, usernames: List[str], only: bool) -> Album:
        if not usernames:
            return self.__get_no_users_photos_album()

        photo_ids = {markup["photo_id"] for markup in self.database.markup.find({"username": {"$in": usernames}})}
        photo_id2users: Dict[int, set] = defaultdict(set)

        for markup in self.database.markup.find({"photo_id": {"$in": list(photo_ids)}}):
            photo_id2users[markup["photo_id"]].add(markup["username"])

        if only:
            photo_ids = [photo_id for photo_id, photo_usernames in photo_id2users.items() if photo_usernames == set(usernames)]
        else:
            photo_ids = [photo_id for photo_id, photo_usernames in photo_id2users.items() if set(usernames).issubset(photo_usernames)]

        photo_id2photo = self.get_photos(photo_ids=photo_ids)
        photo_ids = sorted(photo_ids, key=lambda photo_id: photo_id2photo[photo_id].timestamp)
        album_id = json.dumps({"type": "user_photos", "usernames": usernames, "only": only})
        return Album(album_id=album_id, title=f'Фото c {", ".join(usernames)}', photo_ids=photo_ids, date=datetime.now(), cover_id=None)

    def __get_no_users_photos_album(self) -> Album:
        photo_ids = [photo["photo_id"] for photo in self.database.photos.find({"markup_ids": []}).sort({"timestamp": 1})]
        album_id = json.dumps({"type": "user_photos", "usernames": [], "only": False})
        return Album(album_id=album_id, title="Фото без отметок", photo_ids=photo_ids, date=datetime.now(), cover_id=None)

    def add_photo(self, photo: Photo, username: str) -> None:
        action = AddPhotoAction(username=username, timestamp=datetime.now(), photo_id=photo.photo_id)
        self.database.photos.insert_one(photo.to_dict())

        album = self.get_album(album_id=photo.album_id)
        album_data = {"photo_ids": album.photo_ids + [photo.photo_id], "cover_id": photo.photo_id if album.cover_id is None else album.cover_id}
        self.update_album(album_id=photo.album_id, diff=album.get_diff(album_data), username=username)

        self.database.history.insert_one(action.to_dict())
        self.logger.info(f"Added photo {photo.photo_id} by @{username}")

    def update_photo(self, photo_id: int, diff: dict, username: str) -> None:
        if not diff:
            return

        photo = self.database.photos.find_one({"photo_id": photo_id}, {"photo_id": 1})
        assert photo is not None

        action = EditPhotoAction(username=username, timestamp=datetime.now(), photo_id=photo_id, diff=diff)
        self.database.photos.update_one({"photo_id": photo_id}, {"$set": {key: key_diff["new"] for key, key_diff in diff.items()}})
        self.database.history.insert_one(action.to_dict())
        self.logger.info(f"Updated photo {photo_id} by @{username} (keys: {[key for key in diff]})")

    def remove_photo(self, photo_id: int, username: str, only_remove: bool = False) -> None:
        photo = self.get_photo(photo_id=photo_id)
        assert photo is not None

        action = RemovePhotoAction(username=username, timestamp=datetime.now(), photo_id=photo_id)
        self.database.photos.delete_one({"photo_id": photo_id})

        for markup_id in photo.markup_ids:
            self.remove_markup(markup_id=markup_id, username=username, only_remove=True)

        if not only_remove:
            album = self.get_album(album_id=photo.album_id)
            album_update = {"photo_ids": [album_photo_id for album_photo_id in album.photo_ids if album_photo_id != photo_id]}
            if album.cover_id == photo_id:
                album_update["cover_id"] = None

            self.update_album(album_id=album.album_id, diff=album.get_diff(album_update), username=username)

        self.database.history.insert_one(action.to_dict())
        self.logger.info(f"Removed photo {photo.photo_id} by @{username}")

    def get_photo(self, photo_id: int) -> Optional[Photo]:
        photo = self.database.photos.find_one({"photo_id": photo_id})
        return Photo.from_dict(photo) if photo else None

    def get_photos(self, photo_ids: List[int]) -> Dict[int, Photo]:
        return {photo["photo_id"]: Photo.from_dict(photo) for photo in self.database.photos.find({"photo_id": {"$in": photo_ids}})}

    def get_album_photos(self, album: Album, params: AlbumPhotos) -> Tuple[int, List[Photo]]:
        photo_ids = album.photo_ids[::-1][params.skip:params.skip + params.page_size]
        photo_id2photo = self.get_photos(photo_ids=photo_ids)
        return len(album.photo_ids), [photo_id2photo[photo_id] for photo_id in photo_ids]

    def get_album_titles(self, album_ids: List[int]) -> Dict[int, str]:
        album_id2title = {album_id: "" for album_id in album_ids}
        for album in self.database.albums.find({"album_id": {"$in": album_ids}}, {"album_id": 1, "title": 1}):
            album_id2title[album["album_id"]] = album["title"]

        return album_id2title

    def add_markup(self, markup: Markup, username: str) -> None:
        action = AddMarkupAction(username=username, timestamp=datetime.now(), markup_id=markup.markup_id)
        self.database.markup.insert_one(markup.to_dict())

        photo = self.get_photo(photo_id=markup.photo_id)
        self.update_photo(photo_id=markup.photo_id, diff=photo.get_diff({"markup_ids": photo.markup_ids + [markup.markup_id]}), username=username)

        self.database.history.insert_one(action.to_dict())
        self.logger.info(f"Added markup {markup.markup_id} by @{username}")

    def remove_markup(self, markup_id: int, username: str, only_remove: bool = False) -> None:
        markup = self.get_markup(markup_id=markup_id)
        assert markup is not None

        action = RemoveMarkupAction(username=username, timestamp=datetime.now(), markup_id=markup_id)
        self.database.markup.delete_one({"markup_id": markup_id})

        if not only_remove:
            photo = self.get_photo(photo_id=markup.photo_id)
            diff = photo.get_diff({"markup_ids": [photo_markup_id for photo_markup_id in photo.markup_ids if photo_markup_id != markup_id]})
            self.update_photo(photo_id=photo.photo_id, diff=diff, username=username)

        self.database.history.insert_one(action.to_dict())
        self.logger.info(f"Removed markup {markup_id} by @{username}")

    def get_markup(self, markup_id: int) -> Optional[Markup]:
        markup = self.database.markup.find_one({"markup_id": markup_id})
        return Markup.from_dict(markup) if markup else None

    def get_photo_markup(self, photo_ids: List[int]) -> Dict[int, List[Markup]]:
        photo_id2markup = {photo_id: [] for photo_id in photo_ids}

        for markup in self.database.markup.find({"photo_id": {"$in": photo_ids}}):
            photo_id2markup[markup["photo_id"]].append(Markup.from_dict(markup))

        return photo_id2markup

    def update_quiz(self, quiz_id: int, diff: dict, username: str) -> None:
        if not diff:
            return

        quiz = self.database.quizzes.find_one({"quiz_id": quiz_id}, {"name": 1})
        assert quiz is not None

        action = EditQuizAction(username=username, timestamp=datetime.now(), quiz_id=quiz_id, diff=diff)
        self.database.quizzes.update_one({"quiz_id": quiz_id}, {"$set": {key: key_diff["new"] for key, key_diff in diff.items()}})
        self.database.history.insert_one(action.to_dict())
        self.logger.info(f'Updated quiz "{quiz["name"]}" ({quiz_id}) by @{username} (keys: {[key for key in diff]})')

    def get_last_albums(self, top_count: int = 13) -> List[Album]:
        album_ids = [quiz["album_id"] for quiz in self.database.quizzes.find({"album_id": {"$ne": None}}, {"album_id"})]
        query = {"photo_ids.2": {"$exists": True}, "album_id": {"$in": album_ids}}
        return [Album.from_dict(album) for album in self.database.albums.find(query).sort({"date": -1}).limit(top_count)]

    def search_albums(self, params: AlbumSearch) -> Tuple[int, List[Album]]:
        total = self.database.albums.count_documents(params.to_query())
        albums = self.database.albums.find(params.to_query()).sort({params.order: params.order_type, "_id": 1}).skip(params.skip).limit(params.page_size)
        return total, [Album.from_dict(album) for album in albums]

    def get_users(self) -> List[User]:
        username2score = defaultdict(float)

        quizzes = list(self.database.quizzes.find({"album_id": {"$ne": None}}))
        end_date = max([quiz["datetime"] for quiz in quizzes], default=datetime.now())

        album_id2quiz = {quiz["album_id"]: quiz for quiz in quizzes}
        photo_id2album_id = {photo_id: album["album_id"] for album in self.database.albums.find({"album_id": {"$in": list(album_id2quiz)}}) for photo_id in album["photo_ids"]}

        for markup in self.database.markup.find({"photo_id": {"$in": list(photo_id2album_id)}}):
            quiz = album_id2quiz[photo_id2album_id[markup["photo_id"]]]
            username2score[markup["username"]] += self.markup_score_alpha ** (end_date - quiz["datetime"]).days

        users = sorted([User.from_dict(user) for user in self.database.users.find({})], key=lambda user: -username2score[user.username])
        return users

    def get_user_photos(self, username: str, max_count: int = 10) -> List[Photo]:
        photo_ids = [markup["photo_id"] for markup in self.database.markup.find({"username": username}, {"photo_id": 1})]
        photos = [Photo.from_dict(photo) for photo in self.database.photos.find({"photo_id": {"$in": photo_ids}}).sort({"timestamp": -1}).limit(max_count)]
        return photos
