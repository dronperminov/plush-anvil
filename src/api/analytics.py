from typing import Optional

from fastapi import APIRouter, Depends, Query
from fastapi.encoders import jsonable_encoder
from fastapi.responses import HTMLResponse, JSONResponse

from src import analytics_database, database, organizer_database, place_database, quiz_database
from src.api import templates
from src.entities.user import User
from src.query_params.analytics.user_period import UserPeriod
from src.utils.auth import get_user
from src.utils.common import get_static_hash
from src.utils.date import parse_period

router = APIRouter()


@router.get("/analytics")
def get_analytics(period: str = Query(""), user: Optional[User] = Depends(get_user)) -> HTMLResponse:
    dates = parse_period(period=period)
    template = templates.get_template("about/analytics.html")
    content = template.render(version=get_static_hash(), user=user, period=period, dates=dates)
    return HTMLResponse(content=content)


@router.post("/team-activity-analytics")
def get_team_activity_analytics(params: UserPeriod) -> JSONResponse:
    team_activity = analytics_database.get_team_activity(params)
    return JSONResponse({"status": "success", "team_activity": {date.strftime("%d.%m.%Y"): count for date, count in team_activity.items()}})


@router.post("/games-result-analytics")
def get_games_result(params: UserPeriod) -> JSONResponse:
    analytics = analytics_database.get_games_result(params)
    return JSONResponse({"status": "success", "wins": analytics.wins, "top3": analytics.top3, "top10": analytics.top10, "games": analytics.games})


@router.post("/position-distribution-analytics")
def get_position_distribution_analytics(params: UserPeriod) -> JSONResponse:
    positions, mean_position = analytics_database.get_positions(params)
    return JSONResponse({"status": "success", "positions": positions, "mean_position": mean_position})


@router.post("/games-categories-analytics")
def get_games_categories_analytics(params: UserPeriod) -> JSONResponse:
    categories = analytics_database.get_categories(params)
    return JSONResponse({"status": "success", "categories": jsonable_encoder(categories)})


@router.post("/top-players-analytics")
def get_top_players(params: UserPeriod) -> JSONResponse:
    top_players = analytics_database.get_top_players(params)
    return JSONResponse({"status": "success", "top_players": jsonable_encoder(top_players)})


@router.post("/games-analytics")
def get_games(params: UserPeriod) -> JSONResponse:
    games = analytics_database.get_games(params)
    categories = analytics_database.get_quiz_categories(quizzes=games)

    organizer_id2organizer = organizer_database.get_organizers(organizer_ids=list({game.organizer_id for game in games}))
    organizers = organizer_database.get_quiz_organizers(quizzes=games, only_used=True)

    place_id2place = place_database.get_places(place_ids=list({game.place_id for game in games}))
    places = place_database.get_quiz_places(quizzes=games, only_used=True)

    username2avatar_url = database.get_user_avatar_urls(usernames=list({participant for game in games for participant in game.participants}))
    username2score = quiz_database.get_activity_scores()

    return JSONResponse({
        "status": "success",
        "games": [jsonable_encoder(quiz) for quiz in games],
        "organizer_id2organizer": jsonable_encoder(organizer_id2organizer),
        "organizers": jsonable_encoder(organizers),
        "place_id2place": jsonable_encoder(place_id2place),
        "places": jsonable_encoder(places),
        "categories": jsonable_encoder(categories),
        "username2avatar_url": username2avatar_url,
        "username2score": username2score
    })


@router.post("/month-analytics")
def get_month_analytics(params: UserPeriod, user: Optional[User] = Depends(get_user)) -> JSONResponse:
    month_analytics = analytics_database.get_month_analytics(params)
    return JSONResponse({
        "status": "success",
        "profile": params.username,
        "month_analytics": jsonable_encoder(month_analytics),
        "username": user.username if user else None
    })
