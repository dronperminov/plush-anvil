from typing import Optional

from fastapi import APIRouter, Depends
from fastapi.encoders import jsonable_encoder
from fastapi.responses import HTMLResponse, JSONResponse, Response

from src import database, quiz_database
from src.api import admin_action, admin_redirect, templates
from src.entities.user import User
from src.query_params.page_query import PageQuery
from src.query_params.stickers_modification import StickersModification
from src.utils.auth import get_user
from src.utils.common import get_static_hash

router = APIRouter()


@router.get("/stickers")
def get_stickers(user: Optional[User] = Depends(get_user)) -> Response:
    if response := admin_redirect(back_url="/stickers", user=user):
        return response

    users = quiz_database.get_users()
    template = templates.get_template("admin/stickers.html")
    content = template.render(version=get_static_hash(), user=user, users=users)
    return HTMLResponse(content=content)


@router.post("/stickers")
def get_sticker_users(params: PageQuery) -> JSONResponse:
    total, users, username2sticker = quiz_database.get_sticker_users(params=params)
    return JSONResponse({"status": "success", "total": total, "users": jsonable_encoder(users), "username2sticker": jsonable_encoder(username2sticker)})


@router.post("/modify-stickers")
def modify_stickers(params: StickersModification, user: Optional[User] = Depends(get_user)) -> JSONResponse:
    if response := admin_action(user=user):
        return response

    if params.action not in ["add", "remove"]:
        return JSONResponse({"status": "error", "message": f'использовано некорректное действие "{params.action}"'})

    usernames = {user["username"] for user in database.users.find({"username": {"$in": params.usernames}}, {"username": 1})}
    if len(usernames) != len(params.usernames):
        return JSONResponse({"status": "error", "message": f'не удалось найти некоторых пользователей ({", ".join(sorted(set(params.usernames) - usernames))})'})

    for paid_date in params.to_paid_dates():
        if params.action == "add":
            quiz_database.add_paid_date(paid_date=paid_date, username=user.username)
        else:
            quiz_database.remove_paid_date(paid_date=paid_date, username=user.username)

    return JSONResponse({"status": "success"})
