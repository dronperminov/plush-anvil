import logging
from collections import defaultdict
from datetime import datetime
from typing import Dict, List, Tuple

from src import Database
from src.entities.analytics.category_analytics import CategoryAnalytics
from src.entities.analytics.games_result import GamesResult
from src.entities.analytics.month_analytics import MonthAnalytics
from src.entities.analytics.top_player import TopPlayer
from src.entities.quiz import Quiz
from src.entities.user import User
from src.enums import Category
from src.query_params.analytics.user_period import UserPeriod


class AnalyticsDatabase:
    def __init__(self, database: Database, logger: logging.Logger) -> None:
        self.database = database
        self.logger = logger
        self.alpha = 0.98

    def get_team_activity(self, user_period: UserPeriod) -> Dict[datetime, int]:
        date2count = defaultdict(int)
        for quiz in self.database.quizzes.find(self.__quizzes_query(user_period=user_period), {"datetime": 1}):
            date2count[quiz["datetime"].date()] += 1

        return date2count

    def get_games_result(self, user_period: UserPeriod) -> GamesResult:
        wins, top3, top10, games = 0, 0, 0, 0

        for quiz in self.database.quizzes.find(self.__quizzes_query(user_period=user_period), {"result": 1}):
            position = quiz["result"]["position"]

            if position == 1:
                wins += 1
            elif position <= 3:
                top3 += 1
            elif position <= 10:
                top10 += 1

            games += 1

        return GamesResult(wins=wins, top3=top3, top10=top10, games=games)

    def get_positions(self, user_period: UserPeriod, max_position: int = 15) -> Tuple[Dict[int, int], float]:
        quizzes = self.database.quizzes.find(self.__quizzes_query(user_period=user_period), {"result": 1})
        positions, mean_position = self.__get_positions(quizzes=quizzes, max_position=max_position)
        return positions, mean_position

    def get_categories(self, user_period: UserPeriod) -> List[CategoryAnalytics]:
        category2quizzes: Dict[Category, list] = defaultdict(list)

        for quiz in self.database.quizzes.find(self.__quizzes_query(user_period=user_period), {"category": 1, "result": 1}):
            category2quizzes[Category(quiz["category"])].append(quiz)

        analytics = []

        for category, quizzes in category2quizzes.items():
            positions, mean_position = self.__get_positions(quizzes=quizzes)

            analytics.append(CategoryAnalytics(
                category=category,
                games=len(quizzes),
                wins=sum(1 for quiz in quizzes if quiz["result"]["position"] == 1),
                top3=sum(1 for quiz in quizzes if 2 <= quiz["result"]["position"] <= 3),
                top10=sum(1 for quiz in quizzes if 4 <= quiz["result"]["position"] <= 10),
                mean_position=mean_position,
                positions=positions
            ))

        return sorted(analytics, key=lambda item: (item.category == Category.OTHER, -item.games))

    def get_top_players(self, user_period: UserPeriod) -> List[TopPlayer]:
        return self.__get_top_players(quizzes=self.database.quizzes.find(self.__quizzes_query(user_period=user_period), {"participants": 1, "datetime": 1, "category": 1}))

    def get_games(self, user_period: UserPeriod) -> List[Quiz]:
        return [Quiz.from_dict(quiz) for quiz in self.database.quizzes.find(self.__quizzes_query(user_period=user_period)).sort({"datetime": -1})]

    def get_month_analytics(self, user_period: UserPeriod) -> List[MonthAnalytics]:
        month2quizzes: Dict[tuple, list] = defaultdict(list)

        for quiz in self.database.quizzes.find(self.__quizzes_query(user_period=user_period)):
            month2quizzes[(quiz["datetime"].year, quiz["datetime"].month)].append(quiz)

        month_analytics = []

        for (year, month), quizzes in month2quizzes.items():
            month_analytics.append(MonthAnalytics(
                month=month,
                year=year,
                games=len(quizzes),
                wins=sum(1 for quiz in quizzes if quiz["result"]["position"] == 1),
                prizes=sum(1 for quiz in quizzes if 1 <= quiz["result"]["position"] <= 3),
                top3=sum(1 for quiz in quizzes if 2 <= quiz["result"]["position"] <= 3),
                mean_position=round(sum(quiz["result"]["position"] for quiz in quizzes) / len(quizzes), 1),
                mean_players=round(sum(len(quiz["participants"]) for quiz in quizzes) / len(quizzes), 1),
                top_players=self.__get_top_players(quizzes=quizzes)
            ))

        return sorted(month_analytics, key=lambda data: (data.year, data.month), reverse=True)

    def get_quiz_categories(self, quizzes: List[Quiz]) -> List[Category]:
        today = datetime.now()
        category2score = defaultdict(float)

        for quiz in quizzes:
            category2score[quiz.category] += 0.98 ** (today - quiz.datetime).days

        return sorted(list(category2score), key=lambda category: -category2score[category])

    def __quizzes_query(self, user_period: UserPeriod) -> dict:
        return {**user_period.to_query(username_key="participants", period_key="datetime"), "result.position": {"$gt": 0}}

    def __get_top_players(self, quizzes: List[dict]) -> List[TopPlayer]:
        username2dates = defaultdict(list)
        username2categories = defaultdict(list)
        dates = []

        for quiz in quizzes:
            for participant in quiz["participants"]:
                username2dates[participant].append(quiz["datetime"])
                username2categories[participant].append(Category(quiz["category"]))

            dates.append(quiz["datetime"])

        max_date = max(dates, default=datetime.now())
        username2user = {user["username"]: User.from_dict(user) for user in self.database.users.find({"username": {"$in": list(username2dates)}})}
        top_players = []

        for username, dates in username2dates.items():
            user = username2user[username]
            category2count = defaultdict(int)

            for category in username2categories[username]:
                category2count[category] += 1

            top_players.append(TopPlayer(
                username=username,
                full_name=user.full_name,
                avatar_url=user.avatar_url,
                score=sum(self.alpha ** (max_date - date).days for date in dates),
                games=len(dates),
                category2count={category: count for category, count in category2count.items()}
            ))

        return sorted(top_players, key=lambda top_player: -top_player.score)

    def __get_positions(self, quizzes: List[dict], max_position: int = 15) -> Tuple[Dict[int, int], float]:
        position2count = {position + 1: 0 for position in range(max_position + 1)}
        positions = []

        for quiz in quizzes:
            position = quiz["result"]["position"]
            position2count[min(max_position + 1, position)] += 1
            positions.append(position)

        return position2count, sum(positions) / max(len(positions), 1)
