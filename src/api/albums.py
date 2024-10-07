import json
import os
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from fastapi.encoders import jsonable_encoder
from fastapi.responses import HTMLResponse, JSONResponse, Response

from src import album_database, database
from src.api import admin_action, login_redirect, send_error, templates
from src.entities.album import Album
from src.entities.photo import Photo
from src.entities.user import User
from src.query_params.album_photos import AlbumPhotos
from src.query_params.album_search import AlbumSearch, AlbumSearchQuery
from src.query_params.cover_photo import CoverPhoto
from src.query_params.remove_photo import RemovePhoto
from src.query_params.upload_photo import UploadPhoto
from src.utils.auth import get_user
from src.utils.common import get_extension, get_static_hash, save_file
from src.utils.image import make_preview

router = APIRouter()


@router.get("/albums")
def get_albums(user: Optional[User] = Depends(get_user), params: AlbumSearchQuery = Depends()) -> HTMLResponse:
    template = templates.get_template("photos/albums.html")
    content = template.render(
        version=get_static_hash(),
        user=user,
        search_params=params.to_search_params()
    )

    return HTMLResponse(content=content)


def album_response(album: Album, user: User, album_type: str = "", **kwargs) -> HTMLResponse:
    if not album:
        return send_error(title="Альбом не найден", text="Не удалось найти запрашиваемый альбом. Возможно, он был удалён", user=user)

    users = album_database.get_users()
    template = templates.get_template("photos/album.html")
    content = template.render(
        version=get_static_hash(),
        user=user,
        album=jsonable_encoder(album),
        album_type=album_type,
        users=users,
        **kwargs
    )

    return HTMLResponse(content=content)


@router.get("/albums/{album_id}")
def get_album(album_id: int, user: Optional[User] = Depends(get_user)) -> HTMLResponse:
    album = album_database.get_album(album_id=album_id)
    return album_response(album=album, user=user)


@router.get("/photos")
def get_photos(user: Optional[User] = Depends(get_user)) -> HTMLResponse:
    album = album_database.get_album(album_id=json.dumps({"type": "all_photos"}))
    return album_response(album=album, user=user, album_type="all_photos")


@router.get("/photos-with-me")
def get_photos_with_me(user: Optional[User] = Depends(get_user), only: bool = Query(False)) -> Response:
    if not user:
        return login_redirect(back_url="/photos-with-me")

    album = album_database.get_album(album_id=json.dumps({"type": "photos_with_me", "username": user.username, "only": only}))
    return album_response(album=album, user=user, album_type="photos_with_me", only=only)


@router.get("/photos-with-users")
def get_photos_with_users(user: Optional[User] = Depends(get_user), usernames: List[str] = Query([]), only: bool = Query(False)) -> Response:
    album = album_database.get_album(album_id=json.dumps({"type": "user_photos", "usernames": usernames, "only": only}))
    return album_response(album=album, user=user, album_type="user_photos", usernames=usernames, only=only)


@router.post("/search-albums")
def search_albums(params: AlbumSearch) -> JSONResponse:
    total, albums = album_database.search_albums(params=params)
    photo_id2photo = album_database.get_photos(photo_ids=[album.cover_id for album in albums])
    return JSONResponse({"status": "success", "total": total, "albums": jsonable_encoder(albums), "photo_id2photo": jsonable_encoder(photo_id2photo)})


@router.post("/album-photos")
def album_photos(params: AlbumPhotos) -> JSONResponse:
    album = album_database.get_album(album_id=params.album_id)
    if not album:
        return JSONResponse({"status": "error", "message": "не удалось найти запрашиваемый альбом, возможно он был удалён"})

    total, photos = album_database.get_album_photos(album=album, params=params)
    return JSONResponse({
        "status": "success",
        "total": total,
        "photos": jsonable_encoder(photos),
        "album": jsonable_encoder(album)
    })


@router.post("/upload-photo")
def upload_photo(params: UploadPhoto = Depends(), user: Optional[User] = Depends(get_user)) -> JSONResponse:
    if response := admin_action(user=user):
        return response

    album = album_database.get_album(album_id=params.album_id)
    if not album:
        return JSONResponse({"status": "error", "message": "не удалось найти запрашиваемый альбом, возможно, он был удалён"})

    photo_id = database.get_identifier("photos")
    photo_name = f"{photo_id}.{get_extension(filename=params.image.filename)}"
    preview_name = f"{photo_id}_preview.webp"

    photo = Photo(
        photo_id=photo_id,
        album_id=params.album_id,
        url=f"/images/albums/{album.album_id}/{photo_name}",
        preview_url=f"/images/albums/{album.album_id}/{preview_name}",
        markup_ids=[],
        timestamp=datetime.now()
    )

    album_path = os.path.join("web", "images", "albums", f"{params.album_id}")
    os.makedirs(album_path, exist_ok=True)

    save_file(params.image, os.path.join(album_path, photo_name))
    make_preview(os.path.join(album_path, photo_name), os.path.join(album_path, preview_name))
    album_database.add_photo(photo=photo, username=user.username)

    album_update = {}
    if album.cover_id is None:
        album_update["cover_id"] = photo_id

    if quiz := database.quizzes.find_one({"album_id": album.album_id}):
        album_update["date"] = quiz["datetime"]
    else:
        album_update["date"] = photo.timestamp

    album_database.update_album(album_id=album.album_id, diff=album.get_diff(album_update), username=user.username)
    return JSONResponse({"status": "success", "photo": jsonable_encoder(album_database.get_photo(photo_id=photo_id))})


@router.post("/remove-photo")
def remove_photo(params: RemovePhoto, user: Optional[User] = Depends(get_user)) -> JSONResponse:
    if response := admin_action(user=user):
        return response

    photo = album_database.get_photo(photo_id=params.photo_id)
    if not photo:
        return JSONResponse({"status": "error", "message": "не удалось найти запрашиваемое фото, возможно, оно было удалено"})

    album_database.remove_photo(photo_id=params.photo_id, username=user.username)
    return JSONResponse({"status": "success"})


@router.post("/set-cover-photo")
def set_cover_photo(params: CoverPhoto, user: Optional[User] = Depends(get_user)) -> JSONResponse:
    if response := admin_action(user=user):
        return response

    album = album_database.get_album(album_id=params.album_id)
    if not album:
        return JSONResponse({"status": "error", "message": "не удалось найти запрашиваемый альбом, возможно, он был удалён"})

    photo = album_database.get_photo(photo_id=params.photo_id)
    if not photo:
        return JSONResponse({"status": "error", "message": "не удалось найти запрашиваемое фото, возможно, оно было удалено"})

    album_database.update_album(album_id=params.album_id, diff=album.get_diff({"cover_id": params.photo_id}), username=user.username)
    return JSONResponse({"status": "success"})
