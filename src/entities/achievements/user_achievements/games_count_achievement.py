from typing import List

from src.entities.achievements.achievement import Achievement
from src.entities.quiz import Quiz
from src.utils.common import get_word_form


class GamesCountAchievement(Achievement):
    def __init__(self, title: str, description: str, image: str, target_count: int) -> None:
        self.title = title
        self.description = description
        self.target_count = target_count
        self.image_url = f"/images/achievements/{image}"

    def analyze(self, quizzes: List[Quiz]) -> None:
        if len(quizzes) < self.target_count:
            self.label_date = f'ещё {get_word_form(self.target_count - len(quizzes), ["игра", "игры", "игр"])}'
            return

        self.count = len(quizzes) // self.target_count
        self.first_date = quizzes[self.target_count - 1].datetime
