from typing import Optional

from fastapi import APIRouter, Depends
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

from src import quiz_database
from src.api import admin_action
from src.entities.quiz import Quiz
from src.entities.user import User
from src.query_params.quiz_remove import QuizRemove
from src.utils.auth import get_user

router = APIRouter()


@router.post("/update-quiz")
def update_quiz(quiz: Quiz, user: Optional[User] = Depends(get_user)) -> JSONResponse:
    if response := admin_action(user=user):
        return response

    original_quiz = quiz_database.get_quiz(quiz_id=quiz.quiz_id)
    if not original_quiz:
        return JSONResponse({"status": "error", "message": "не удалось найти квиз, возможно он уже удалён"})

    quiz_database.update_quiz(quiz_id=quiz.quiz_id, diff=original_quiz.get_diff(quiz.to_dict()), username=user.username)
    return JSONResponse({"status": "success", "quiz": jsonable_encoder(quiz_database.get_quiz(quiz_id=quiz.quiz_id))})


@router.post("/remove-quiz")
def remove_quiz(params: QuizRemove, user: Optional[User] = Depends(get_user)) -> JSONResponse:
    if response := admin_action(user=user):
        return response

    if not quiz_database.get_quiz(quiz_id=params.quiz_id):
        return JSONResponse({"status": "error", "message": "не удалось найти квиз, возможно он уже удалён"})

    quiz_database.remove_quiz(quiz_id=params.quiz_id, username=user.username)
    return JSONResponse({"status": "success"})
