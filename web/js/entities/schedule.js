function Schedule(schedule) {
    this.month = schedule.month
    this.year = schedule.year

    this.places = schedule.places
    this.organizers = schedule.organizers
    this.analytics = schedule.analytics
    this.day2quizzes = schedule.day2quizzes

    this.placeId2place = {}

    for (let place of this.places)
        this.placeId2place[place.place_id] = place
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

        MakeElement("schedule-calendar-quiz", quizzes, {innerText: text, style: `background-color: ${color};`})
    }
}

Schedule.prototype.BuildCalendar = function(block) {
    let calendar = MakeElement("schedule-calendar", block)

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
