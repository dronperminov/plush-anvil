from enum import Enum


class HandleAchievementType(Enum):
    TOPOGRAPHER = "topographer"
    OUT_OF_TIME = "out-of-time"
    FORGETFUL = "forgetful"
    APPEAL_MASTER = "appeal-master"
    EMPLOYEE = "employee"
    AUTHOR = "author"
    HONEST = "honest"

    def to_title(self) -> str:
        achievement_type2title = {
            HandleAchievementType.TOPOGRAPHER: "Топограф",
            HandleAchievementType.OUT_OF_TIME: "Вне времени",
            HandleAchievementType.FORGETFUL: "Забывчивый",
            HandleAchievementType.APPEAL_MASTER: "Мастер апелляций",
            HandleAchievementType.EMPLOYEE: "Сотрудник",
            HandleAchievementType.AUTHOR: "Автор",
            HandleAchievementType.HONEST: "Честный"
        }
        return achievement_type2title[self]

    def to_description(self) -> str:
        achievement_type2description = {
            HandleAchievementType.TOPOGRAPHER: "перепутать место проведения квиза",
            HandleAchievementType.OUT_OF_TIME: "перепутать время проведения квиза",
            HandleAchievementType.FORGETFUL: "забыть про квиз",
            HandleAchievementType.APPEAL_MASTER: "убедить организаторов в правильности своего не совсем верного ответа",
            HandleAchievementType.EMPLOYEE: "поработать на квизе",
            HandleAchievementType.AUTHOR: "написать пакет вопросов для квиза",
            HandleAchievementType.HONEST: "сообщить о некорректно посчитанных баллах в пользу команды"
        }
        return achievement_type2description[self]
