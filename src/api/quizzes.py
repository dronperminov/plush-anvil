from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

from src import album_database, database, place_database, quiz_database
from src.api import admin_action
from src.entities.album import Album
from src.entities.quiz import Quiz
from src.entities.user import User
from src.query_params.quiz_identifier import QuizIdentifier
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


@router.post("/album-quiz")
def album_quiz(params: QuizIdentifier, user: Optional[User] = Depends(get_user)) -> JSONResponse:
    quiz = quiz_database.get_quiz(quiz_id=params.quiz_id)
    if not quiz:
        return JSONResponse({"status": "error", "message": "не удалось найти квиз, возможно он уже удалён"})

    if quiz.album_id:
        return JSONResponse({"status": "success", "link": f"/albums/{quiz.album_id}"})

    if response := admin_action(user=user):
        return response

    place = place_database.get_place(place_id=quiz.place_id)
    title = quiz.get_album_title(place=place.name)
    album = Album(album_id=database.get_identifier("albums"), title=title, photo_ids=[], date=datetime.now(), cover_id=None)

    album_database.add_album(album=album, username=user.username)
    quiz_database.update_quiz(quiz_id=quiz.quiz_id, diff=quiz.get_diff({"album_id": album.album_id}), username=user.username)

    return JSONResponse({"status": "success", "link": f"/albums/{album.album_id}"})


@router.post("/remove-quiz")
def remove_quiz(params: QuizIdentifier, user: Optional[User] = Depends(get_user)) -> JSONResponse:
    if response := admin_action(user=user):
        return response

    if not quiz_database.get_quiz(quiz_id=params.quiz_id):
        return JSONResponse({"status": "error", "message": "не удалось найти квиз, возможно он уже удалён"})

    quiz_database.remove_quiz(quiz_id=params.quiz_id, username=user.username)
    return JSONResponse({"status": "success"})
