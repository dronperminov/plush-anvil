from dataclasses import asdict
from typing import Optional

from fastapi import APIRouter, Body, Depends, Query
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse, Response

from src import constants
from src.api import templates
from src.database import database
from src.dataclasses.user import User
from src.utils import auth
from src.utils.common import get_static_hash

router = APIRouter()


@router.get("/login")
def login(user: Optional[dict] = Depends(auth.get_current_user), back_url: str = Query("/")) -> Response:
    if user:
        return RedirectResponse(url=back_url, status_code=302)

    template = templates.get_template("pages/login.html")
    return HTMLResponse(content=template.render(page="login", version=get_static_hash()))


@router.get("/change-password")
def get_change_password(user: Optional[dict] = Depends(auth.get_current_user)) -> Response:
    if not user:
        return RedirectResponse(url="/login?back_url=/change-password")

    template = templates.get_template("pages/change_password.html")
    return HTMLResponse(content=template.render(user=user, page="change_password", version=get_static_hash()))


@router.post("/sign-in")
def sign_in(username: str = Body(..., embed=True), password: str = Body(..., embed=True)) -> JSONResponse:
    user = database.users.find_one({"username": {"$regex": f"^{username}$", "$options": "i"}})

    if user is None:
        return JSONResponse({"status": "error", "message": f'Пользователя "{username}" не существует'})

    if not auth.validate_password(password, user["password_hash"]):
        return JSONResponse({"status": "error", "message": "Имя пользователя или пароль введены неверно"})

    access_token = auth.create_access_token(user["username"])
    response = JSONResponse(content={"status": "success", "token": access_token})
    response.set_cookie(key=auth.COOKIE_NAME, value=access_token, httponly=True)
    return response


@router.post("/sign-up")
def sign_up(username: str = Body(..., embed=True), password: str = Body(..., embed=True), fullname: str = Body(..., embed=True)) -> JSONResponse:
    user = database.users.find_one({"username": {"$regex": f"^{username}$", "$options": "i"}})

    if user is not None:
        return JSONResponse({"status": "error", "message": f'Пользователь "{username}" уже существует'})

    user = User(username=username, password_hash=auth.get_password_hash(password), fullname=fullname)
    database.users.insert_one(asdict(user))

    access_token = auth.create_access_token(username)
    response = JSONResponse(content={"status": "success", "token": access_token})
    response.set_cookie(key=auth.COOKIE_NAME, value=access_token, httponly=True, samesite="strict")
    return response


@router.get("/logout")
def logout() -> Response:
    response = RedirectResponse("/login", status_code=302)
    response.delete_cookie(auth.COOKIE_NAME)
    return response


@router.post("/validate")
def validate(user: Optional[dict] = Depends(auth.get_current_user)) -> JSONResponse:
    return JSONResponse({"status": constants.SUCCESS, "valid": user is not None})


@router.post("/change-password")
def change_password(user: Optional[dict] = Depends(auth.get_current_user), curr_password: str = Body(..., embed=True), password: str = Body(..., embed=True)) -> JSONResponse:
    if not user:
        return JSONResponse({"status": constants.ERROR, "message": "Пользователь не залогинен"})

    if not auth.validate_password(curr_password, user["password_hash"]):
        return JSONResponse({"status": "error", "message": "Текущий пароль введён неверно"})

    if curr_password == password:
        return JSONResponse({"status": "error", "message": "Текущий пароль совпадает с новым"})

    database.users.update_one({"username": user["username"]}, {"$set": {"password_hash": auth.get_password_hash(password)}})
    return JSONResponse({"status": constants.SUCCESS})
