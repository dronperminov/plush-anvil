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
