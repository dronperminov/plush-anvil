from typing import Optional

from fastapi import APIRouter, Depends
from fastapi.encoders import jsonable_encoder
from fastapi.responses import HTMLResponse, JSONResponse, Response

from src import database, organizer_database
from src.api import admin_action, admin_redirect, templates
from src.entities.organizer import Organizer
from src.entities.user import User
from src.query_params.organizer_remove import OrganizerRemove
from src.query_params.page_query import PageQuery
from src.utils.auth import get_user
from src.utils.common import get_static_hash

router = APIRouter()


@router.get("/organizers")
def get_organizers(user: Optional[User] = Depends(get_user)) -> Response:
    if response := admin_redirect(back_url="/organizers", user=user):
        return response

    template = templates.get_template("admin/organizers.html")
    content = template.render(
        version=get_static_hash(),
        user=user
    )

    return HTMLResponse(content=content)


@router.post("/organizers")
def post_organizers(params: PageQuery) -> JSONResponse:
    organizers = organizer_database.get_all_organizers()
    total = len(organizers)
    return JSONResponse({"status": "success", "total": total, "organizers": jsonable_encoder(organizers[params.skip:params.skip + params.page_size])})


@router.post("/update-organizer")
def update_organizer(organizer: Organizer, user: Optional[User] = Depends(get_user)) -> JSONResponse:
    if response := admin_action(user=user):
        return response

    original_organizer = organizer_database.get_organizer(organizer_id=organizer.organizer_id)
    if not original_organizer:
        return JSONResponse({"status": "error", "message": "не удалось найти организатора, возможно он уже удалён"})

    organizer_database.update_organizer(organizer_id=organizer.organizer_id, diff=original_organizer.get_diff(organizer.to_dict()), username=user.username)
    return JSONResponse({"status": "success", "organizer": jsonable_encoder(organizer_database.get_organizer(organizer_id=organizer.organizer_id))})


@router.post("/remove-organizer")
def remove_organizer(params: OrganizerRemove, user: Optional[User] = Depends(get_user)) -> JSONResponse:
    if response := admin_action(user=user):
        return response

    if not organizer_database.get_organizer(organizer_id=params.organizer_id):
        return JSONResponse({"status": "error", "message": "не удалось найти организатора, возможно он уже удалён"})

    if database.quizzes.find_one({"organizer_id": params.organizer_id}):
        return JSONResponse({"status": "error", "message": "данный организатор используется в квизах"})

    organizer_database.remove_organizer(organizer_id=params.organizer_id, username=user.username)
    return JSONResponse({"status": "success"})


@router.post("/add-organizer")
def add_organizer(organizer: Organizer, user: Optional[User] = Depends(get_user)) -> JSONResponse:
    if response := admin_action(user=user):
        return response

    organizer.organizer_id = database.get_identifier("organizers")
    organizer_database.add_organizer(organizer=organizer, username=user.username)
    return JSONResponse({"status": "success", "organizer": jsonable_encoder(organizer_database.get_organizer(organizer_id=organizer.organizer_id))})
