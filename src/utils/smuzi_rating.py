from datetime import datetime
from typing import List

from src.entities.quiz import Quiz
from src.entities.smuzi_rating.next_level_info import NextLevelInfo
from src.entities.smuzi_rating.smuzi_level import SmuziLevel
from src.entities.smuzi_rating.smuzi_rating import RatingInfo


class SmuziRating:
    def __init__(self) -> None:
        self.levels = [
            SmuziLevel(score=300, name="новички", level=1, color_name="зелёный"),
            SmuziLevel(score=600, name="любители", level=2, color_name="жёлтый"),
            SmuziLevel(score=1200, name="мастера", level=3, color_name="оранжевый"),
            SmuziLevel(score=2500, name="профи", level=4, color_name="красный"),
            SmuziLevel(score=5000, name="эксперты", level=5, color_name="фиолетовый"),
            SmuziLevel(score=10000, name="гуру", level=6, color_name="бронзовый"),
            SmuziLevel(score=15000, name="виртуозы", level=7, color_name="серебряный"),
            SmuziLevel(score=20000, name="чемпионы", level=8, color_name="золотой"),
            SmuziLevel(score=30000, name="титаны", level=9, color_name="чёрный"),
            SmuziLevel(score=50000, name="динозавры", level=10, color_name="смузи")
        ]

        self.position2score = {
            1: 100, 2: 95, 3: 90, 4: 85, 5: 80, 6: 75, 7: 70, 8: 65,
            9: 60, 10: 58, 11: 56, 12: 54, 13: 53, 14: 52, 15: 51
        }

    def get_rating(self, position: int, date: datetime) -> int:
        return 0 if date < datetime(2024, 1, 1) else self.position2score.get(position, 50)

    def get_info(self, quizzes: List[Quiz]) -> RatingInfo:
        rating = 0
        level = -1

        for quiz in quizzes:
            rating += self.position2score.get(quiz.result.position, 50)

            if level < len(self.levels) - 1 and rating >= self.levels[level + 1].score:
                level += 1

        next_level = None

        if level < len(self.levels) - 1:
            next_level = NextLevelInfo.evaluate(rating=rating, games=len(quizzes), start_date=quizzes[0].datetime, next_level=self.levels[level + 1])

        return RatingInfo(
            rating=rating,
            mean_rating=rating / max(len(quizzes), 1),
            games=len(quizzes),
            curr_level=self.levels[level],
            next_level=next_level
        )
