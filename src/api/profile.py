from typing import Optional

from fastapi import APIRouter, Depends
from fastapi.encoders import jsonable_encoder
from fastapi.responses import HTMLResponse, JSONResponse, Response

from src import achievement_database
from src.api import authorized_action, login_redirect, templates
from src.entities.user import User
from src.query_params.page_query import PageQuery
from src.utils.auth import get_user
from src.utils.common import get_static_hash

router = APIRouter()


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
