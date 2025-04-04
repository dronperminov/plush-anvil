from typing import Optional

from fastapi import APIRouter, Depends, Query
from fastapi.encoders import jsonable_encoder
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse, Response

from src import achievement_database, album_database, database
from src.api import authorized_action, login_redirect, templates
from src.entities.user import User
from src.query_params.avatar_change import AvatarChange
from src.query_params.full_name_change import FullNameChange
from src.query_params.page_query import PageQuery
from src.query_params.password_change import PasswordChange
from src.utils.auth import get_password_hash, get_user, validate_password
from src.utils.common import get_static_hash

router = APIRouter()


@router.get("/profile")
def get_profile(user: Optional[User] = Depends(get_user), username: str = Query("")) -> Response:
    if not user:
        return login_redirect(back_url="/profile")

    show_user = database.get_user(username=username) if username else user

    if show_user is None or username.lower() == user.username.lower():
        return RedirectResponse(url="/profile")

    if show_user != user and show_user.username != username:
        return RedirectResponse(url=f"/profile?username={show_user.username}")

    user_photos = album_database.get_user_photos(username=show_user.username)
    template = templates.get_template("profile/profile.html")
    content = template.render(version=get_static_hash(), user=user, show_user=show_user, user_photos=user_photos, jsonable_encoder=jsonable_encoder)
    return HTMLResponse(content=content)


@router.get("/my-achievements")
def get_achievements(user: Optional[User] = Depends(get_user)) -> Response:
    if not user:
        return login_redirect(back_url="/my-achievements")

    template = templates.get_template("profile/achievements.html")
    content = template.render(version=get_static_hash(), user=user)
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
        return JSONResponse({"status": "error", "message": "текущий пароль введён неверно"})

    if params.curr_password == params.password:
        return JSONResponse({"status": "error", "message": "текущий пароль совпадает с новым"})

    database.users.update_one({"username": user.username}, {"$set": {"password_hash": get_password_hash(params.password)}})
    return JSONResponse({"status": "success"})


@router.post("/change-full-name")
def change_full_name(params: FullNameChange, user: Optional[User] = Depends(get_user)) -> JSONResponse:
    if response := authorized_action(user):
        return response

    if not params.full_name:
        return JSONResponse({"status": "error", "message": "имя пользователя не может быть пустым"})

    database.users.update_one({"username": user.username}, {"$set": {"full_name": params.full_name}})
    return JSONResponse({"status": "success"})


@router.post("/change-avatar")
def change_avatar(params: AvatarChange = Depends(), user: Optional[User] = Depends(get_user)) -> JSONResponse:
    if response := authorized_action(user):
        return response

    avatar_url = user.save_avatar(image=params.image, x=params.x, y=params.y, size=params.size)
    database.users.update_one({"username": user.username}, {"$set": {"avatar_url": avatar_url}})
    return JSONResponse({"status": "success", "avatar_url": avatar_url})
