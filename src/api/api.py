from typing import Optional

from fastapi import APIRouter, Depends
from fastapi.encoders import jsonable_encoder
from fastapi.responses import HTMLResponse, JSONResponse, Response

from src import album_database, database, organizer_database, place_database, quiz_database, smuzi_rating
from src.api import admin_redirect, templates
from src.entities.user import User
from src.query_params.page_query import PageQuery
from src.utils.auth import get_user
from src.utils.common import get_static_hash, get_word_form

router = APIRouter()


@router.get("/")
def index(user: Optional[User] = Depends(get_user)) -> HTMLResponse:
    rating_info = smuzi_rating.get_info(quiz_database.get_rating_quizzes())
    nearest_quizzes = quiz_database.get_nearest_quizzes()
    team_analytics = quiz_database.get_team_analytics()
    last_albums = album_database.get_last_albums(top_count=13)

    place_id2place = place_database.get_places(place_ids=list({quiz.place_id for quiz in nearest_quizzes}))
    organizer_id2organizer = organizer_database.get_organizers(organizer_ids=list({quiz.organizer_id for quiz in nearest_quizzes}))
    photo_id2photo = album_database.get_photos(photo_ids=[album.cover_id for album in last_albums])

    template = templates.get_template("index.html")
    content = template.render(
        version=get_static_hash(),
        user=user,
        rating_info=rating_info,
        nearest_quizzes=nearest_quizzes,
        team_analytics=team_analytics,
        last_albums=last_albums,
        place_id2place=place_id2place,
        organizer_id2organizer=organizer_id2organizer,
        photo_id2photo=photo_id2photo,
        get_word_form=get_word_form
    )

    return HTMLResponse(content=content)


@router.get("/birthdays")
def get_birthdays(user: Optional[User] = Depends(get_user)) -> Response:
    if response := admin_redirect(back_url="/birthdays", user=user):
        return response

    template = templates.get_template("admin/birthdays.html")
    content = template.render(
        version=get_static_hash(),
        user=user
    )

    return HTMLResponse(content=content)


@router.post("/birthdays")
def get_birthday_users(params: PageQuery) -> JSONResponse:
    total, users = database.get_birthday_users(params=params)
    username2days = {user.username: user.birth_date.get_days() for user in users}
    return JSONResponse({"status": "success", "total": total, "users": jsonable_encoder(users), "username2days": username2days})
