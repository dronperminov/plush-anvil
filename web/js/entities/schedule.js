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

    this.cells = []
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
        let link = MakeElement("", participants, {href: `/profile?username=${participant}`}, "a")
        MakeElement("", link, {src: this.username2avatar[participant]}, "img")
    }
}

Schedule.prototype.BuildQuizPopup = function(quiz, place, organizer, block, arrow) {
    let popup = MakeElement("schedule-popup", this.popups)

    let closeIcon = MakeElement("close-icon", popup, {title: "Закрыть"})

    let adminIcons = MakeElement("admin-block icons", popup)
    let removeIcon = MakeElement("image-icon", adminIcons, {src: "/images/icons/trash.svg", title: "Удалить"}, "img")

    quiz.category.Build(MakeElement("schedule-popup-category", popup))
    MakeElement("schedule-popup-name", popup, {innerText: quiz.name})

    if (quiz.HaveDescription())
        MakeElement("schedule-popup-description", popup, {innerText: quiz.description})

    this.BuildQuizPopupIcon(popup, "/images/icons/schedule/calendar.svg", quiz.FormatDatetime())
    this.BuildQuizPopupIcon(popup, "/images/icons/schedule/location.svg", place.GetLocationText())
    this.BuildQuizPopupIcon(popup, "/images/icons/schedule/cost.svg", quiz.FormatCost())
    this.BuildQuizPopupIcon(popup, organizer.imageUrl, organizer.name)

    if (quiz.HavePosition())
        this.BuildQuizPopupIcon(popup, "/images/icons/schedule/position.svg", quiz.FormatPosition())

    if (quiz.HavePlayers()) {
        this.BuildQuizPopupIcon(popup, "/images/icons/schedule/players.svg", quiz.FormatPlayers())
        this.BuildQuizPopupParticipants(popup, quiz)
    }

    closeIcon.addEventListener("click", () => this.ClosePopup())
    removeIcon.addEventListener("click", () => this.RemoveQuiz(quiz, block, arrow.parentNode))

    block.addEventListener("click", () => this.OpenPopup(popup))
    arrow.addEventListener("click", () => this.OpenPopup(popup))
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

Schedule.prototype.RemoveQuiz = function(quiz, block, event) {
    if (!confirm(`Вы уверены, что хотите удалить квиз "${quiz.name}"?`))
        return

    quiz.Remove().then(result => {
        if (result) {
            this.ClosePopup()
            block.remove()
            event.remove()
        }
    })
}

Schedule.prototype.BuildQuizEvent = function(quiz, place, organizer, block) {
    let event = MakeElement("schedule-event", block, {style: `background-color: ${place.color}`})
    MakeElement("schedule-event-icon", event, {src: organizer.imageUrl, alt: `${organizer.name} logo`}, "img")
    let info = MakeElement("", event)

    let timeRow = MakeElement("schedule-event-time", info)
    MakeElement("", timeRow, {src: "/images/icons/time.svg", alt: "time icon"}, "img")
    MakeElement("", timeRow, {innerText: quiz.FormatTime()}, "span")

    MakeElement("", info, {innerText: quiz.name})

    let arrow = MakeElement("schedule-event-arrow", event, {})
    MakeElement("", arrow, {src: "/images/icons/arrow-right.svg"}, "img")
    return arrow
}

Schedule.prototype.BuildCalendarCell = function(block, eventsBlock, day) {
    let cell = MakeElement("schedule-calendar-cell", block)
    let cellDay = MakeElement("schedule-calendar-cell-day", cell, {innerText: day})

    if (!(day in this.day2quizzes))
        return

    let quizzes = MakeElement("schedule-calendar-quizzes", cell)
    let events = MakeElement("schedule-events hidden", eventsBlock)

    cellDay.addEventListener("click", () => {
        for (let node of block.querySelectorAll(".schedule-calendar-cell-day-selected"))
            node.classList.remove("schedule-calendar-cell-day-selected")

        for (let node of eventsBlock.children)
            node.classList.add("hidden")

        cellDay.classList.add("schedule-calendar-cell-day-selected")
        events.classList.remove("hidden")
    })

    for (let quiz of this.day2quizzes[day]) {
        quiz = new Quiz(quiz)

        let place = new Place(this.placeId2place[quiz.placeId])
        let organizer = new Organizer(this.organizerId2organizer[quiz.organizerId])

        let quizBlock = MakeElement("schedule-calendar-quiz", quizzes, {style: `background-color: ${place.color};`})
        MakeElement("schedule-calendar-quiz-name", quizBlock, {innerText: quiz.shortName})
        MakeElement("schedule-calendar-quiz-icon", quizBlock, {src: organizer.imageUrl}, "img")
        MakeElement("schedule-calendar-quiz-time", quizBlock, {innerText: quiz.FormatTime()})

        let arrow = this.BuildQuizEvent(quiz, place, organizer, events)
        this.BuildQuizPopup(quiz, place, organizer, quizBlock, arrow)
    }

    this.cells.push(quizzes)
}

Schedule.prototype.BuildCalendar = function(block) {
    let calendar = MakeElement("schedule-calendar", block)
    let events = MakeElement("schedule-all-events", block)

    this.popups.innerHTML = ""
    this.cells = []

    this.BuildCalendarWeekdays(calendar)

    let startDate = new Date(this.year, this.month - 1, 1)
    let endDate = new Date(this.year, this.month, 0)

    for (let i = 0; i < (startDate.getDay() + 6) % 7; i++)
        MakeElement("schedule-calendar-cell", calendar)

    for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1))
        this.BuildCalendarCell(calendar, events, date.getDate())

    this.Resize()
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

Schedule.prototype.Resize = function() {
    for (let cell of this.cells) {
        let bbox = cell.getBoundingClientRect()
        let last = cell.children[cell.children.length - 1].getBoundingClientRect()

        let fontSize = 1

        while (bbox.y + bbox.height < last.y + last.height && fontSize > 0.2) {
            fontSize *= 0.9
            cell.setAttribute("style", `font-size: ${fontSize}em;`)

            bbox = cell.getBoundingClientRect()
            last = cell.children[cell.children.length - 1].getBoundingClientRect()
        }
    }
}
