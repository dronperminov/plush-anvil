from typing import Optional

from fastapi import APIRouter, Depends
from fastapi.responses import HTMLResponse

from src import album_database
from src.api import templates
from src.entities.user import User
from src.utils.auth import get_user
from src.utils.common import get_static_hash

router = APIRouter()


@router.get("/albums")
def get_albums(user: Optional[User] = Depends(get_user)) -> HTMLResponse:
    albums = album_database.get_all_albums()
    photo_id2photo = album_database.get_photos(photo_ids=[album.cover_id for album in albums])

    template = templates.get_template("photos/albums.html")
    content = template.render(
        version=get_static_hash(),
        user=user,
        albums=albums,
        photo_id2photo=photo_id2photo
    )

    return HTMLResponse(content=content)
