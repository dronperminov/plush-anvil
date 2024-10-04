import logging
from collections import defaultdict
from datetime import datetime
from typing import Dict, List, Optional, Tuple

from src import Database
from src.entities.achievements.handle_achievement import HandleAchievement
from src.entities.history_action import AddAchievementAction, RemoveAchievementAction
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
