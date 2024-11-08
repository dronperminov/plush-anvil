function Schedule(schedule) {
    this.month = schedule.month
    this.year = schedule.year

    this.places = schedule.places
    this.organizers = schedule.organizers
    this.username2avatar = schedule.username2avatar
    this.analytics = schedule.analytics
    this.day2quizzes = schedule.day2quizzes

    this.placeId2place = {}

    for (let place of this.places)
        this.placeId2place[place.place_id] = place

    this.organizerId2organizer = {}

    for (let organizer of this.organizers)
        this.organizerId2organizer[organizer.organizer_id] = organizer

    let body = document.querySelector("body")
    this.popups = MakeElement("schedule-popups", body)
    this.popups.addEventListener("click", (e) => {
        if (e.target === this.popups)
            this.ClosePopup()
    })
}

Schedule.prototype.Build = function(block) {
    this.BuildPlaces(block)
    this.BuildCalendar(block)
    this.BuildAnalytics(block)
}

Schedule.prototype.BuildPlaces = function(block) {
    let placesBlock = MakeElement("schedule-places", block)

    for (let place of this.places) {
        let placeBlock = MakeElement("schedule-place", placesBlock)
        MakeElement("schedule-place-color", placeBlock, {style: `background-color: ${place.color}`}, "span")
        MakeElement("schedule-place-name", placeBlock, {innerText: place.name}, "span")
    }
}

Schedule.prototype.BuildCalendarWeekdays = function(block) {
    for (let day of ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"]) {
        MakeElement("schedule-calendar-weekday", block, {innerText: day})
    }
}

Schedule.prototype.BuildQuizPopupIcon = function(popup, url, text) {
    let icon = MakeElement("schedule-popup-icon", popup)
    MakeElement("", icon, {src: url}, "img")
    return MakeElement("", icon, {innerHTML: text})
}

Schedule.prototype.BuildQuizPopupParticipants = function(popup, quiz) {
    if (quiz.participants.length === 0)
        return

    let participants = MakeElement("schedule-popup-participants", popup)

    for (let participant of quiz.participants) {
        let link = MakeElement("", participants, {href: `/profile?username=${participant.username}`}, "a")
        MakeElement("", link, {src: this.username2avatar[participant.username]}, "img")
    }
}

Schedule.prototype.BuildQuizPopup = function(quiz, block) {
    let popup = MakeElement("schedule-popup", this.popups)
    let place = new Place(this.placeId2place[quiz.place_id])
    let organizer = new Organizer(this.organizerId2organizer[quiz.organizer_id])
    let category = new Category(quiz.category)

    let closeIcon = MakeElement("close-icon", popup, {title: "Закрыть"})

    category.Build(MakeElement("schedule-popup-category", popup))
    MakeElement("schedule-popup-name", popup, {innerText: quiz.name})

    if (quiz.description.length > 0)
        MakeElement("schedule-popup-description", popup, {innerText: quiz.description})

    this.BuildQuizPopupIcon(popup, "/images/icons/schedule/calendar.svg", FormatDatetime(new Date(quiz.datetime)))
    this.BuildQuizPopupIcon(popup, "/images/icons/schedule/location.svg", place.GetLocationText())
    this.BuildQuizPopupIcon(popup, "/images/icons/schedule/cost.svg", `${quiz.cost} руб.`)
    this.BuildQuizPopupIcon(popup, organizer.imageUrl, organizer.name)

    if (quiz.result !== null && quiz.result.position > 0)
        this.BuildQuizPopupIcon(popup, "/images/icons/schedule/position.svg", `${quiz.result.position} место из ${quiz.result.teams}`)

    if (quiz.result !== null && quiz.result.players > 0) {
        this.BuildQuizPopupIcon(popup, "/images/icons/schedule/players.svg", GetWordForm(quiz.result.players, ["игрок", "игрока", "игроков"]))
        this.BuildQuizPopupParticipants(popup, quiz)
    }

    closeIcon.addEventListener("click", () => this.ClosePopup())
    block.addEventListener("click", () => this.OpenPopup(popup))
}

Schedule.prototype.OpenPopup = function(popup) {
    let body = document.querySelector("body")
    body.classList.add("no-overflow")

    popup.classList.add("schedule-popup-open")
    this.popups.classList.add("schedule-popups-open")
}

Schedule.prototype.ClosePopup = function() {
    this.popups.classList.remove("schedule-popups-open")

    for (let popup of document.getElementsByClassName("schedule-popup-open"))
        popup.classList.remove("schedule-popup-open")

    let body = document.querySelector("body")
    body.classList.remove("no-overflow")
}

Schedule.prototype.BuildCalendarCell = function(block, day) {
    let cell = MakeElement("schedule-calendar-cell", block)
    MakeElement("schedule-calendar-cell-day", cell, {innerText: day})

    if (!(day in this.day2quizzes))
        return

    let quizzes = MakeElement("schedule-calendar-quizzes", cell)
    for (let quiz of this.day2quizzes[day]) {
        let place = this.placeId2place[quiz.place_id]
        let color = place.color

        let text = quiz.short_name
        if (quiz.result)
            text += ` ${quiz.result.position} / ${quiz.result.teams}`

        let quizBlock = MakeElement("schedule-calendar-quiz", quizzes, {innerText: text, style: `background-color: ${color};`})
        this.BuildQuizPopup(quiz, quizBlock)
    }
}

Schedule.prototype.BuildCalendar = function(block) {
    let calendar = MakeElement("schedule-calendar", block)

    this.popups.innerHTML = ""
    this.BuildCalendarWeekdays(calendar)

    let startDate = new Date(this.year, this.month - 1, 1)
    let endDate = new Date(this.year, this.month, 0)

    for (let i = 0; i < (startDate.getDay() + 6) % 7; i++)
        MakeElement("schedule-calendar-cell", calendar)

    for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1))
        this.BuildCalendarCell(calendar, date.getDate())
}

Schedule.prototype.BuildAnalyticsItem = function(block, value, label) {
    let item = MakeElement("schedule-analytics-item", block)
    MakeElement("schedule-analytics-item-value", item, {innerText: value})
    MakeElement("schedule-analytics-item-label", item, {innerText: label})
}

Schedule.prototype.BuildAnalytics = function(block) {
    if (this.analytics.games === 0)
        return

    let analyticsBlock = MakeElement("schedule-analytics", block)
    MakeElement("schedule-analytics-header", analyticsBlock, {innerText: "СТАТИСТИКА ЗА МЕСЯЦ"})

    let analyticsItemsBlock = MakeElement("schedule-analytics-items", analyticsBlock)

    this.BuildAnalyticsItem(analyticsItemsBlock, this.analytics.games, GetWordForm(this.analytics.games, ["игру сыграли", "игры сыграли", "игр сыграли"], true))

    if (this.analytics.wins > 0)
        this.BuildAnalyticsItem(analyticsItemsBlock, this.analytics.wins, GetWordForm(this.analytics.wins, ["раз победили", "раза победили", "раз победили"], true))

    if (this.analytics.top3 > 0)
        this.BuildAnalyticsItem(analyticsItemsBlock, this.analytics.top3, GetWordForm(this.analytics.top3, ["раз вошли в тройку", "раза вошли в тройку", "раз вошли в тройку"], true))

    this.BuildAnalyticsItem(analyticsItemsBlock, Round(this.analytics.mean_position, 10), "средняя позиция")
}
