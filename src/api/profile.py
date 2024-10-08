from typing import Optional

from fastapi import APIRouter, Depends
from fastapi.encoders import jsonable_encoder
from fastapi.responses import HTMLResponse, JSONResponse, Response

from src import achievement_database, database, quiz_database
from src.api import authorized_action, login_redirect, templates
from src.entities.user import User
from src.query_params.page_query import PageQuery
from src.query_params.password_change import PasswordChange
from src.utils.auth import get_password_hash, get_user, validate_password
from src.utils.common import get_static_hash, get_word_form

router = APIRouter()


@router.get("/my-achievements")
def get_achievements(user: Optional[User] = Depends(get_user)) -> Response:
    if not user:
        return login_redirect(back_url="/my-achievements")

    template = templates.get_template("profile/achievements.html")
    content = template.render(version=get_static_hash(), user=user)
    return HTMLResponse(content=content)


@router.get("/my-stickers")
def get_stickers(user: Optional[User] = Depends(get_user)) -> Response:
    if not user:
        return login_redirect(back_url="/my-stickers")

    paid_games, stickers = quiz_database.get_user_stickers(username=user.username)
    template = templates.get_template("profile/stickers.html")
    content = template.render(version=get_static_hash(), user=user, paid_games=paid_games, stickers=stickers, get_word_form=get_word_form)
    return HTMLResponse(content=content)


@router.post("/user-achievements")
def user_achievements(params: PageQuery, user: Optional[User] = Depends(get_user)) -> JSONResponse:
    if response := authorized_action(user=user):
        return response

    total, achievements = achievement_database.get_user_achievements(params=params, username=user.username)
    return JSONResponse({"status": "success", "total": total, "achievements": jsonable_encoder(achievements)})


@router.get("/change-password")
def get_change_password(user: Optional[User] = Depends(get_user)) -> Response:
    if not user:
        return login_redirect(back_url="/change-password")

    template = templates.get_template("profile/change_password.html")
    return HTMLResponse(content=template.render(version=get_static_hash(), user=user))


@router.post("/change-password")
def change_password(params: PasswordChange, user: Optional[User] = Depends(get_user)) -> JSONResponse:
    if response := authorized_action(user):
        return response

    if not validate_password(params.curr_password, user.password_hash):
        return JSONResponse({"status": "error", "message": "Текущий пароль введён неверно"})

    if params.curr_password == params.password:
        return JSONResponse({"status": "error", "message": "Текущий пароль совпадает с новым"})

    database.users.update_one({"username": user.username}, {"$set": {"password_hash": get_password_hash(params.password)}})
    return JSONResponse({"status": "success"})
