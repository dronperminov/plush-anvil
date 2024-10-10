from typing import Optional

from fastapi import APIRouter, Depends, Query
from fastapi.encoders import jsonable_encoder
from fastapi.responses import HTMLResponse, JSONResponse

from src import analytics_database, organizer_database, place_database
from src.api import templates
from src.entities.user import User
from src.query_params.analytics.period import Period
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
def get_team_activity_analytics(params: Period) -> JSONResponse:
    team_activity = analytics_database.get_team_activity(params)
    return JSONResponse({"status": "success", "team_activity": {date.strftime("%d.%m.%Y"): count for date, count in team_activity.items()}})


@router.post("/games-result-analytics")
def get_games_result(params: Period) -> JSONResponse:
    analytics = analytics_database.get_games_result(params)
    return JSONResponse({"status": "success", "wins": analytics.wins, "top3": analytics.top3, "top10": analytics.top10, "games": analytics.games})


@router.post("/position-distribution-analytics")
def get_position_distribution_analytics(params: Period) -> JSONResponse:
    positions, mean_position = analytics_database.get_positions(params)
    return JSONResponse({"status": "success", "positions": positions, "mean_position": mean_position})


@router.post("/top-players-analytics")
def get_top_players(params: Period) -> JSONResponse:
    top_players = analytics_database.get_top_players(params)
    return JSONResponse({"status": "success", "top_players": jsonable_encoder(top_players)})


@router.post("/games-analytics")
def get_games(params: Period) -> JSONResponse:
    games = analytics_database.get_games(params)
    organizer_id2organizer = organizer_database.get_organizers(organizer_ids=list({game.organizer_id for game in games}))
    place_id2place = place_database.get_places(place_ids=list({game.place_id for game in games}))

    return JSONResponse({
        "status": "success",
        "games": [jsonable_encoder(quiz) for quiz in games],
        "organizer_id2organizer": jsonable_encoder(organizer_id2organizer),
        "place_id2place": jsonable_encoder(place_id2place)
    })


@router.post("/month-analytics")
def get_month_analytics(params: Period, user: Optional[User] = Depends(get_user)) -> JSONResponse:
    month_analytics = analytics_database.get_month_analytics(params)
    return JSONResponse({"status": "success", "month_analytics": jsonable_encoder(month_analytics), "username": user.username if user else None})
