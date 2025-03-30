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
from src.entities.achievements.user_achievements.games_count_achievement import GamesCountAchievement
from src.entities.achievements.user_achievements.players_count_achievement import PlayersCountAchievement
from src.entities.history_action import AddAchievementAction, RemoveAchievementAction
from src.entities.quiz import Quiz
from src.entities.user import User
from src.enums import HandleAchievementType
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

    def get_user_achievements(self, params: PageQuery, username: str) -> Tuple[int, List[Achievement]]:
        achievements = [
            *self.__get_user_automatic_achievements(username=username),
            *self.__get_user_handle_achievements(username=username),
            self.__get_user_photos_achievement(username=username)
        ]

        for achievement in achievements:
            achievement.set_label_date()

        achievements = sorted(achievements, key=lambda achievement: achievement.count == 0)
        return len(achievements), achievements[params.skip:params.skip + params.page_size]

    def __get_user_handle_achievements(self, username: str) -> List[Achievement]:
        type2achievements = {achievement_type: [] for achievement_type in HandleAchievementType}

        for achievement in self.database.achievements.find({"username": username}):
            achievement = HandleAchievement.from_dict(achievement)
            type2achievements[achievement.achievement_type].append(achievement)

        handle_achievements = []

        for achievement_type, type_achievements in type2achievements.items():
            handle_achievements.append(Achievement(
                title=achievement_type.to_title(),
                description=achievement_type.to_description(),
                image_url=f"/images/achievements/{len(handle_achievements) + 1}.png",
                count=len(type_achievements),
                first_date=min([achievement.date for achievement in type_achievements], default=None)
            ))

        return handle_achievements

    def __get_user_automatic_achievements(self, username: str) -> List[Achievement]:
        quizzes = [Quiz.from_dict(quiz) for quiz in self.database.quizzes.find({"result.position": {"$gt": 0}, "participants": username}).sort("datetime")]
        achievements = [
            SoloAchievement(title="Одиночка", description="участвовать в соло", image="1.png"),
            GamesCountAchievement(title="Частый гость", description="посетить 100 игр", image="2.png", target_count=100),
            GamesCountAchievement(title="Преданный фанат", description="посетить 1000 игр", image="3.png", target_count=1000),
            PlayersCountAchievement(title="Суперкоманда", description="участвовать в команде, состоящей из 10 и более игроков", image="4.png", min_count=10, max_count=12),
            PlayersCountAchievement(title="Узким кругом", description="участвовать в команде, состоящей из 5 и менее игроков", image="5.png", min_count=1, max_count=5),
            HardyAchievement(title="Выносливый", description="участвовать в двух играх в один день", image="6.png", min_count=2, max_count=2),
            HardyAchievement(title="Очень выносливый", description="участвовать в трёх и более играх в один день", image="7.png", min_count=3, max_count=100),
            PositionDaysAchievement(title="7 дней игр", description="участвовать в играх 7 дней подряд", image="8.png", target_count=7, max_position=100),
            PositionDaysAchievement(title="14 дней игр", description="участвовать в играх 14 дней подряд", image="9.png", target_count=14, max_position=100),

            PositionCountAchievement(title="Призёр", description="посетить игру и войти в тройку", image="10.png", target_count=1, max_position=3),
            PositionCountAchievement(title="Призёр-50", description="посетить 50 игр и войти в тройку", image="11.png", target_count=50, max_position=3),
            PositionCountAchievement(title="Победитель", description="посетить победную игру", image="12.png", target_count=1, max_position=1),
            PositionCountAchievement(title="Победитель-50", description="посетить 50 победных игр", image="13.png", target_count=50, max_position=1)
        ]

        for achievement in achievements:
            achievement.analyze(quizzes=quizzes)

        return achievements

    def __get_user_photos_achievement(self, username: str) -> Achievement:
        achievement = Achievement(title="Невидимка", description="не попасть на фото с игры", image_url="/images/achievements/1.png", count=0, first_date=None)
        album_ids = [quiz["album_id"] for quiz in self.database.quizzes.find({"participants": username, "album_id": {"$ne": None}}, {"album_id": 1})]

        for album in self.database.albums.find({"album_id": {"$in": album_ids}}):
            if not self.database.markup.find_one({"photo_id": {"$in": album["photo_ids"]}, "username": username}):
                achievement.increment(album["date"])

        return achievement
