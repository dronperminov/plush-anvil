from typing import Optional

from fastapi import APIRouter, Depends
from fastapi.responses import HTMLResponse, JSONResponse

from src import analytics_database
from src.api import templates
from src.entities.user import User
from src.query_params.analytics.period import Period
from src.utils.auth import get_user
from src.utils.common import get_static_hash

router = APIRouter()


@router.get("/analytics")
def get_analytics(user: Optional[User] = Depends(get_user)) -> HTMLResponse:
    template = templates.get_template("about/analytics.html")
    content = template.render(version=get_static_hash(), user=user)
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
    return JSONResponse({"status": "success", "top_players": [player.to_dict() for player in top_players]})
