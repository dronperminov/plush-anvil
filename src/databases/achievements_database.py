import logging
from collections import defaultdict
from datetime import datetime
from typing import Dict, List, Optional, Tuple

from src import Database
from src.entities.achievements.achievement import Achievement
from src.entities.achievements.handle_achievement import HandleAchievement
from src.entities.achievements.hardy_achievement import HardyAchievement
from src.entities.achievements.position_count_achievement import PositionCountAchievement
from src.entities.achievements.position_days_achievement import PositionDaysAchievement
from src.entities.achievements.solo_achievement import SoloAchievement
from src.entities.achievements.team_achievements.diversity_month_achievement import DiversityMonthAchievement
from src.entities.achievements.team_achievements.narrow_circle_achievement import NarrowCircleAchievement
from src.entities.achievements.team_achievements.there_here_achievement import ThereHereAchievement
from src.entities.history_action import AddAchievementAction, RemoveAchievementAction
from src.entities.quiz import Quiz
from src.entities.user import User
from src.query_params.page_query import PageQuery


class AchievementDatabase:
    def __init__(self, database: Database, logger: logging.Logger) -> None:
        self.database = database
        self.logger = logger

    def get_count(self) -> int:
        return self.database.achievements.count_documents({})

    def add_achievement(self, achievement: HandleAchievement, username: str) -> None:
        action = AddAchievementAction(username=username, timestamp=datetime.now(), achievement_id=achievement.achievement_id)
        self.database.achievements.insert_one(achievement.to_dict())
        self.database.history.insert_one(action.to_dict())
        self.logger.info(f'Added achievement "{achievement.achievement_type}" for {achievement.username} by @{username}')

    def remove_achievement(self, achievement_id: int, username: str) -> None:
        achievement = self.get_achievement(achievement_id=achievement_id)
        assert achievement

        action = RemoveAchievementAction(username=username, timestamp=datetime.now(), achievement_id=achievement.achievement_id)
        self.database.achievements.delete_one({"achievement_id": achievement_id})
        self.database.history.insert_one(action.to_dict())
        self.logger.info(f'Removed achievement "{achievement.achievement_type}" from {achievement.username} by @{username}')

    def get_achievement(self, achievement_id: int) -> Optional[HandleAchievement]:
        achievement = self.database.achievements.find_one({"achievement_id": achievement_id})
        return HandleAchievement.from_dict(achievement) if achievement else None

    def get_user_achievements(self, username: str) -> List[HandleAchievement]:
        return [HandleAchievement.from_dict(achievement) for achievement in self.database.achievements.find({"username": username})]

    def get_achievement_users(self, params: PageQuery) -> Tuple[int, List[User], Dict[str, List[HandleAchievement]]]:
        username2achievements = defaultdict(list)

        for achievement in self.database.achievements.find({}):
            username2achievements[achievement["username"]].append(HandleAchievement.from_dict(achievement))

        username2date = dict()

        for username, achievements in username2achievements.items():
            username2date[username] = max([achievement.date for achievement in achievements])
            username2achievements[username] = sorted(achievements, key=lambda achievement: achievement.date, reverse=True)

        users = [User.from_dict(user) for user in self.database.users.find({"username": {"$in": list(username2achievements)}})]
        users = sorted(users, key=lambda user: username2date[user.username], reverse=True)
        return len(users), users[params.skip:params.skip + params.page_size], username2achievements

    def get_team_achievements(self, params: PageQuery) -> Tuple[int, List[Achievement]]:
        quizzes = [Quiz.from_dict(quiz) for quiz in self.database.quizzes.find({"result.position": {"$gt": 0}}).sort("datetime")]
        achievements = [
            ThereHereAchievement(image="1.png"),
            HardyAchievement(title="Выносливые", description="посетить две и более игры в один день", image="2.png", min_count=2, max_count=100),
            SoloAchievement(title="Соло", description="сыграть командой из одного человека", image="3.png"),
            DiversityMonthAchievement(image="4.png"),
            NarrowCircleAchievement(image="5.png"),

            PositionDaysAchievement(title="7 дней призов", description="7 дней подряд входить в тройку", image="6.png", target_count=7, max_position=3),
            PositionDaysAchievement(title="7 дней побед", description="7 дней подряд одержать победу", image="7.png", target_count=7, max_position=1),
            PositionDaysAchievement(title="7 дней игр", description="7 дней подряд ходить на квизы", image="8.png", target_count=7, max_position=100),
            PositionDaysAchievement(title="15 дней игр", description="15 дней подряд ходить на квизы", image="9.png", target_count=15, max_position=100),
            PositionDaysAchievement(title="30 дней игр", description="30 дней подряд ходить на квизы", image="10.png", target_count=30, max_position=100),

            PositionCountAchievement(title="50 призов", description="войти в тройку в 50 квизах", image="11.png", target_count=50, max_position=3),
            PositionCountAchievement(title="100 призов", description="войти в тройку в 100 квизах", image="12.png", target_count=100, max_position=3),
            PositionCountAchievement(title="250 призов", description="войти в тройку в 250 квизах", image="13.png", target_count=250, max_position=3),

            PositionCountAchievement(title="50 побед", description="победить в 50 квизах", image="14.png", target_count=50, max_position=1),
            PositionCountAchievement(title="100 побед", description="победить в 100 квизах", image="15.png", target_count=100, max_position=1),
            PositionCountAchievement(title="250 побед", description="победить в 250 квизах", image="16.png", target_count=250, max_position=1)
        ]

        for achievement in achievements:
            achievement.analyze(quizzes=quizzes)
            achievement.set_label_date()

        achievements = sorted(achievements, key=lambda achievement: achievement.count == 0)
        return len(achievements), achievements[params.skip:params.skip + params.page_size]
