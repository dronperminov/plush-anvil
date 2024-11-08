from dataclasses import dataclass
from typing import Dict, List

from src.entities.analytics.team_analytics import TeamAnalytics
from src.entities.organizer import Organizer
from src.entities.place import Place
from src.entities.quiz import Quiz


@dataclass
class Schedule:
    month: int
    year: int
    places: List[Place]
    organizers: List[Organizer]
    username2avatar: Dict[str, str]
    analytics: TeamAnalytics
    day2quizzes: Dict[int, List[Quiz]]
