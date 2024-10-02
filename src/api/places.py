from typing import Optional

from fastapi import APIRouter, Depends
from fastapi.encoders import jsonable_encoder
from fastapi.responses import HTMLResponse, JSONResponse, Response

from src import database, place_database
from src.api import admin_action, admin_redirect, templates
from src.entities.place import Place
from src.entities.user import User
from src.query_params.page_query import PageQuery
from src.query_params.place_remove import PlaceRemove
from src.utils.auth import get_user
from src.utils.common import get_static_hash

router = APIRouter()


@router.get("/places")
def get_places(user: Optional[User] = Depends(get_user)) -> Response:
    if response := admin_redirect(back_url="/places", user=user):
        return response

    template = templates.get_template("admin/places.html")
    content = template.render(
        version=get_static_hash(),
        user=user,
        metro_stations=database.get_metro_stations()
    )

    return HTMLResponse(content=content)


@router.post("/places")
def post_places(params: PageQuery) -> JSONResponse:
    places = place_database.get_all_places()
    total = len(places)
    return JSONResponse({"status": "success", "total": total, "places": jsonable_encoder(places[params.skip:params.skip + params.page_size])})


@router.post("/update-place")
def update_place(place: Place, user: Optional[User] = Depends(get_user)) -> JSONResponse:
    if response := admin_action(user=user):
        return response

    original_place = place_database.get_place(place_id=place.place_id)
    if not original_place:
        return JSONResponse({"status": "error", "message": "не удалось найти место, возможно оно уже удалено"})

    place_database.update_place(place_id=place.place_id, diff=original_place.get_diff(place.to_dict()), username=user.username)
    return JSONResponse({"status": "success", "place": jsonable_encoder(place_database.get_place(place_id=place.place_id))})


@router.post("/remove-place")
def remove_place(params: PlaceRemove, user: Optional[User] = Depends(get_user)) -> JSONResponse:
    if response := admin_action(user=user):
        return response

    if not place_database.get_place(place_id=params.place_id):
        return JSONResponse({"status": "error", "message": "не удалось найти место, возможно оно уже удалено"})

    if database.quizzes.find_one({"place_id": params.place_id}):
        return JSONResponse({"status": "error", "message": "данное место используется в квизах"})

    place_database.remove_place(place_id=params.place_id, username=user.username)
    return JSONResponse({"status": "success"})


@router.post("/add-place")
def add_place(place: Place, user: Optional[User] = Depends(get_user)) -> JSONResponse:
    if response := admin_action(user=user):
        return response

    place.place_id = database.get_identifier("places")
    place_database.add_place(place=place, username=user.username)
    return JSONResponse({"status": "success", "place": jsonable_encoder(place_database.get_place(place_id=place.place_id))})
