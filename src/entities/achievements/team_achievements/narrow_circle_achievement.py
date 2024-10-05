from typing import List

from src.entities.achievements.achievement import Achievement
from src.entities.quiz import Quiz


class NarrowCircleAchievement(Achievement):
    def __init__(self, image: str) -> None:
        self.title = "Узким кругом"
        self.description = "участвовать в квизе с количеством команд не более 5"
        self.image_url = f"/images/achievements/{image}"

    def analyze(self, quizzes: List[Quiz]) -> None:
        for quiz in quizzes:
            if quiz.result.teams <= 5:
                self.increment(quiz.datetime)
