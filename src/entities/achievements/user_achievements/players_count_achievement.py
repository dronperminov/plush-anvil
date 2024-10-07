from typing import List

from src.entities.achievements.achievement import Achievement
from src.entities.quiz import Quiz


class PlayersCountAchievement(Achievement):
    def __init__(self, title: str, description: str, image: str, min_count: int, max_count: int) -> None:
        self.title = title
        self.description = description
        self.image_url = f"/images/achievements/{image}"
        self.min_count = min_count
        self.max_count = max_count

    def analyze(self, quizzes: List[Quiz]) -> None:
        for quiz in quizzes:
            if self.min_count <= quiz.result.players <= self.max_count:
                self.increment(quiz.datetime)
