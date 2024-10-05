from typing import List

from src.entities.achievements.achievement import Achievement
from src.entities.quiz import Quiz
from src.utils.common import get_word_form


class PositionCountAchievement(Achievement):
    def __init__(self, title: str, description: str, image: str, target_count: int, max_position: int) -> None:
        self.title = title
        self.description = description
        self.image_url = f"/images/achievements/{image}"
        self.target_count = target_count
        self.max_position = max_position
        self.words = ["игра", "игры", "игр"]

        if max_position == 3:
            self.words = ["призовая игра", "призовых игры", "призовых игр"]
        elif max_position == 1:
            self.words = ["победа", "победы", "побед"]

    def analyze(self, quizzes: List[Quiz]) -> None:
        count = 0

        for quiz in quizzes:
            if quiz.result.position > self.max_position:
                continue

            count += 1

            if count == self.target_count:
                self.increment(quiz.datetime)
                count = 0

        if self.count == 0 and count < self.target_count:
            self.label_date = f"ещё {get_word_form(self.target_count - count, self.words)}"
