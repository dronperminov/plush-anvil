import urllib.parse
from typing import Optional

from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse, Response
from jinja2 import Environment, FileSystemLoader

from src.entities.user import User
from src.enums import UserRole
from src.utils.common import get_static_hash

templates = Environment(loader=FileSystemLoader("web/templates"), cache_size=0)
templates.policies["json.dumps_kwargs"]["ensure_ascii"] = False


def send_error(title: str, text: str, user: Optional[User]) -> HTMLResponse:
    template = templates.get_template("components/error.html")
    content = template.render(user=user, version=get_static_hash(), error_title=title, error_text=text)
    return HTMLResponse(content=content)


def login_redirect(back_url: str) -> RedirectResponse:
    return RedirectResponse(url=f'/login?back_url={urllib.parse.quote(back_url, safe="")}')


def admin_redirect(back_url: str, user: Optional[User]) -> Optional[Response]:
    if not user:
        return login_redirect(back_url=back_url)

    if user.role == UserRole.USER:
        return send_error(title="Доступ запрещён", text="Эта страница доступна только администраторам.", user=user)

    return None


def admin_action(user: Optional[User]) -> Optional[JSONResponse]:
    if not user:
        return JSONResponse({"status": "error", "message": "пользователь не авторизован"})

    if user.role == UserRole.USER:
        return JSONResponse({"status": "error", "message": "данное действие доступно только администраторам"})

    return None
