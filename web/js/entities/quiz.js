function Quiz(quiz) {
    this.quizId = quiz.quiz_id
    this.name = quiz.name
    this.shortName = quiz.short_name
    this.description = quiz.description
    this.datetime = new Date(quiz.datetime)
    this.cost = quiz.cost
    this.placeId = quiz.place_id
    this.organizerId = quiz.organizer_id
    this.category = new Category(quiz.category)

    this.albumId = quiz.album_id
    this.participants = quiz.participants
    this.result = quiz.result
}

Quiz.prototype.FormatDatetime = function() {
    return FormatDatetime(this.datetime)
}

Quiz.prototype.FormatTime = function() {
    return FormatTime(this.datetime)
}

Quiz.prototype.FormatCost = function() {
    return `${this.cost} руб.`
}

Quiz.prototype.HaveDescription = function() {
    return this.description.length > 0
}

Quiz.prototype.HavePosition = function() {
    return this.result !== null && this.result.teams > 0
}

Quiz.prototype.HavePlayers = function() {
    return this.result !== null && this.result.players > 0
}

Quiz.prototype.FormatPosition = function() {
    return this.HavePosition() ? `${this.result.position} место из ${this.result.teams}` : ""
}

Quiz.prototype.FormatPlayers = function() {
    return this.HavePlayers() ? GetWordForm(this.result.players, ["игрок", "игрока", "игроков"]) : ""
}

Quiz.prototype.Remove = function() {
    return SendRequest("/remove-quiz", {quiz_id: this.quizId}).then(response => {
        if (response.status != SUCCESS_STATUS) {
            ShowNotification(`Не удалось удалить квиз "${this.name}".<br><b>Причина</b>: ${response.message}`, "error-notification")
            return false
        }

        ShowNotification("Квиз успешно обновлён", "success-notification")
        return true
    })
}
