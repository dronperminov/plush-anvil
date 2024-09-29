from typing import Optional

from fastapi import APIRouter, Depends, Query
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse, Response

from src import database
from src.api import templates
from src.entities.user import User
from src.query_params.sign_in import SignIn
from src.query_params.sign_up import SignUp
from src.utils.auth import COOKIE_NAME, create_access_token, get_user, validate_password
from src.utils.common import get_static_hash

router = APIRouter()


@router.get("/login")
def login(user: Optional[User] = Depends(get_user), back_url: str = Query("/")) -> Response:
    if user:
        return RedirectResponse(url=back_url, status_code=302)

    template = templates.get_template("login.html")
    return HTMLResponse(content=template.render(version=get_static_hash()))


@router.post("/sign-in")
def sign_in(params: SignIn) -> JSONResponse:
    user = database.get_user(username=params.username)

    if user is None:
        return JSONResponse({"status": "error", "message": f'Пользователя "{params.username}" не существует'})

    if not validate_password(params.password, user.password_hash):
        return JSONResponse({"status": "error", "message": "Имя пользователя или пароль введены неверно"})

    access_token = create_access_token(user.username)
    response = JSONResponse(content={"status": "success", "token": access_token})
    response.set_cookie(key=COOKIE_NAME, value=access_token, httponly=True)
    return response


@router.post("/sign-up")
def sign_up(params: SignUp) -> JSONResponse:
    user = database.get_user(username=params.username)
    if user is not None:
        return JSONResponse({"status": "error", "message": f'Пользователь "{params.username}" уже существует'})

    database.sign_up(user=params.to_user())

    access_token = create_access_token(params.username)
    response = JSONResponse(content={"status": "success", "token": access_token})
    response.set_cookie(key=COOKIE_NAME, value=access_token, httponly=True, samesite="strict")
    return response


@router.get("/logout")
def logout() -> Response:
    response = RedirectResponse("/login", status_code=302)
    response.delete_cookie(key=COOKIE_NAME)
    return response


@router.post("/validate")
def validate(user: Optional[User] = Depends(get_user)) -> JSONResponse:
    return JSONResponse({"status": "success", "valid": user is not None})
