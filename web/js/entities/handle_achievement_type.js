function HandleAchievementType(value) {
    this.value = value
    this.values = ["topographer", "out-of-time", "forgetful", "appeal-master", "employee", "author", "honest"]

    this.value2title = {
        "topographer": "топограф",
        "out-of-time": "вне времени",
        "forgetful": "забывчивый",
        "appeal-master": "мастер апелляций",
        "employee": "сотрудник",
        "author": "автор",
        "honest": "честный"
    }

    this.value2description = {
        "topographer": "перепутать место проведения квиза",
        "out-of-time": "перепутать время проведения квиза",
        "forgetful": "забыть про квиз",
        "appeal-master": "убедить организаторов в правильности своего не совсем верного ответа",
        "employee": "поработать на квизе",
        "author": "написать пакет вопросов для квиза",
        "honest": "сообщить о некорректно посчитанных баллах в пользу команды"
    }
}

HandleAchievementType.prototype.ToTitle = function() {
    return this.value2title[this.value]
}

HandleAchievementType.prototype.ToDescription = function() {
    return this.value2description[this.value]
}
