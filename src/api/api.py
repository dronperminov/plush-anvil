from typing import Optional

from fastapi import APIRouter, Depends
from fastapi.responses import HTMLResponse

from src import quiz_database, smuzi_rating
from src.api import templates
from src.entities.user import User
from src.utils.auth import get_user
from src.utils.common import get_static_hash, get_word_form

router = APIRouter()


@router.get("/")
def index(user: Optional[User] = Depends(get_user)) -> HTMLResponse:
    rating_info = smuzi_rating.get_info(quiz_database.get_rating_quizzes())

    template = templates.get_template("index.html")
    content = template.render(
        version=get_static_hash(),
        user=user,
        rating_info=rating_info,
        get_word_form=get_word_form
    )

    return HTMLResponse(content=content)
