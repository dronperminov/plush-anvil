from typing import Optional

from fastapi import APIRouter, Depends
from fastapi.encoders import jsonable_encoder
from fastapi.responses import HTMLResponse, JSONResponse, Response

from src import achievement_database, database, quiz_database
from src.api import admin_action, admin_redirect, templates
from src.entities.achievements.handle_achievement import HandleAchievement
from src.entities.user import User
from src.query_params.achievements_modification import AchievementsModification
from src.query_params.page_query import PageQuery
from src.utils.auth import get_user
from src.utils.common import get_static_hash

router = APIRouter()


@router.get("/handle-achievements")
def handle_achievements(user: Optional[User] = Depends(get_user)) -> Response:
    if response := admin_redirect(back_url="/achievements", user=user):
        return response

    users = quiz_database.get_users()
    template = templates.get_template("admin/achievements.html")
    content = template.render(version=get_static_hash(), user=user, users=users)
    return HTMLResponse(content=content)


@router.post("/handle-achievements")
def get_achievement_users(params: PageQuery) -> JSONResponse:
    total, users, username2achievements = achievement_database.get_achievement_users(params=params)
    return JSONResponse({"status": "success", "total": total, "users": jsonable_encoder(users), "username2achievements": jsonable_encoder(username2achievements)})


@router.post("/modify-achievements")
def modify_achievements(params: AchievementsModification, user: Optional[User] = Depends(get_user)) -> JSONResponse:
    if response := admin_action(user=user):
        return response

    if params.action not in ["add", "remove"]:
        return JSONResponse({"status": "error", "message": f'использовано некорректное действие "{params.action}"'})

    usernames = {user["username"] for user in database.users.find({"username": {"$in": params.usernames}}, {"username": 1})}
    if len(usernames) != len(params.usernames):
        return JSONResponse({"status": "error", "message": f'не удалось найти некоторых пользователей ({", ".join(sorted(set(params.usernames) - usernames))})'})

    for achievement_user in params.users:
        for _ in range(achievement_user.count):
            if params.action == "add":
                achievement_id = database.get_identifier("achievements")
                achievement = HandleAchievement(achievement_id=achievement_id, username=achievement_user.username, date=params.date, achievement_type=params.achievement_type)
                achievement_database.add_achievement(achievement=achievement, username=user.username)
            else:
                achievement = database.achievements.find_one({"date": params.date, "achievement_type": params.achievement_type.value, "username": achievement_user.username})
                if achievement:
                    achievement_database.remove_achievement(achievement_id=achievement["achievement_id"], username=user.username)

    return JSONResponse({"status": "success"})


@router.get("/achievements")
def get_achievements(user: Optional[User] = Depends(get_user)) -> Response:
    template = templates.get_template("about/achievements.html")
    content = template.render(version=get_static_hash(), user=user)
    return HTMLResponse(content=content)


@router.post("/team-achievements")
def team_achievements(params: PageQuery) -> JSONResponse:
    total, achievements = achievement_database.get_team_achievements(params=params)
    return JSONResponse({"status": "success", "total": total, "achievements": jsonable_encoder(achievements)})
