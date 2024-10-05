from collections import defaultdict
from typing import List

from src.entities.achievements.achievement import Achievement
from src.entities.quiz import Quiz


class ThereHereAchievement(Achievement):
    def __init__(self, image: str) -> None:
        self.title = "И там и тут"
        self.description = "посетить две и более игры в одно и то же время"
        self.image_url = f"/images/achievements/{image}"

    def analyze(self, quizzes: List[Quiz]) -> None:
        date2count = defaultdict(int)

        for quiz in quizzes:
            date2count[quiz.datetime] += 1

        for date, count in date2count.items():
            if count != 1:
                self.increment(date)
