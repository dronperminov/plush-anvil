from typing import Optional

from fastapi import APIRouter, Depends
from fastapi.encoders import jsonable_encoder
from fastapi.responses import HTMLResponse, JSONResponse

from src import album_database
from src.api import templates
from src.entities.user import User
from src.query_params.album_search import AlbumSearch, AlbumSearchQuery
from src.utils.auth import get_user
from src.utils.common import get_static_hash

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


@router.post("/search-albums")
def search_albums(params: AlbumSearch) -> JSONResponse:
    total, albums = album_database.search_albums(params=params)
    photo_id2photo = album_database.get_photos(photo_ids=[album.cover_id for album in albums])
    return JSONResponse({"status": "success", "total": total, "albums": jsonable_encoder(albums), "photo_id2photo": jsonable_encoder(photo_id2photo)})
