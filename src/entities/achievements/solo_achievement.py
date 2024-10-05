from typing import List

from src.entities.achievements.achievement import Achievement
from src.entities.quiz import Quiz


class SoloAchievement(Achievement):
    def __init__(self, title: str, description: str, image: str) -> None:
        self.title = title
        self.description = description
        self.image_url = f"/images/achievements/{image}"

    def analyze(self, quizzes: List[Quiz]) -> None:
        for quiz in quizzes:
            if quiz.result.players == 1:
                self.increment(quiz.datetime)
