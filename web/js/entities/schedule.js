class Schedule {
    constructor(month, year) {
        this.month = month
        this.year = year

        this.monthSpan = document.getElementById("schedule-date-month")
        this.yearSpan = document.getElementById("schedule-date-year")

        this.InitPopups()
        this.UpdateDate()
    }

    ParseQuizzes(day2quizzes) {
        this.day2quizzes = new Map()

        for (let [day, quizzes] of Object.entries(day2quizzes))
            this.day2quizzes.set(+day, quizzes.map(quiz => new Quiz(quiz)))
    }

    ParsePlaces(places) {
        this.places = places.map(place => new Place(place))
        this.placeId2place = new Map()

        for (let place of this.places)
            this.placeId2place.set(place.placeId, place)
    }

    ParseOrganizers(organizers) {
        this.organizers = organizers.map(organizer => new Organizer(organizer))
        this.organizerId2organizer = new Map()

        for (let organizer of this.organizers)
            this.organizerId2organizer.set(organizer.organizerId, organizer)
    }

    InitPopups() {
        this.popups = document.querySelector(".schedule-popups")

        if (!this.popups) {
            let body = document.querySelector("body")
            this.popups = MakeElement("schedule-popups", body)
        }

        this.popups.addEventListener("click", (e) => {
            if (e.target === this.popups)
                this.ClosePopups()
        })

        this.popups.innerHTML = ""
    }

    UpdateDate() {
        this.monthSpan.innerText = GetRusMonth(this.month).toUpperCase()
        this.yearSpan.innerText = this.year
    }

    GetDate(step = 0) {
        this.month += step

        if (this.month > 12) {
            this.month = 1
            this.year++
        }
        else if (this.month < 1) {
            this.month = 12
            this.year--
        }

        return {month: this.month, year: this.year}
    }

    Build(parent, schedule) {
        this.month = schedule.month
        this.year = schedule.year

        this.username2avatar = schedule.username2avatar
        this.analytics = schedule.analytics

        this.UpdateDate()
        this.ParseQuizzes(schedule.day2quizzes)
        this.ParsePlaces(schedule.places)
        this.ParseOrganizers(schedule.organizers)

        this.BuildPlaces(parent)
        this.BuildCalendar(parent)
        this.BuildAnalytics(parent)
        this.Resize()
    }

    BuildPlaces(parent) {
        let places = MakeElement("schedule-places", parent)

        for (let place of this.places) {
            let block = MakeElement("schedule-place", places)
            MakeElement("schedule-place-color", block, {style: `background-color: ${place.color}`}, "span")
            MakeElement("schedule-place-name", block, {innerText: place.name}, "span")
        }
    }

    BuildCalendar(parent) {
        let calendar = MakeElement("schedule-calendar", parent)
        let events = MakeElement("schedule-events", parent)

        this.BuildWeekDays(calendar)
        this.BuildCalendarCells(calendar, events)
    }

    BuildWeekDays(parent) {
        for (let day of ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"])
            MakeElement("schedule-calendar-weekday", parent, {innerText: day})
    }

    BuildCalendarCells(calendar, events) {
        let start = new Date(this.year, this.month - 1, 1)
        let end = new Date(this.year, this.month, 0)

        for (let i = 0; i < (start.getDay() + 6) % 7; i++)
            MakeElement("schedule-calendar-cell", calendar)

        for (let date = start; date <= end; date.setDate(date.getDate() + 1))
            this.BuildCalendarCell(calendar, events, date.getDate())
    }

    BuildCalendarCell(calendar, events, day) {
        let cell = MakeElement("schedule-calendar-cell", calendar)
        let cellDay = MakeElement("schedule-calendar-day", cell, {innerText: day})

        if (!this.day2quizzes.has(day))
            return

        let calendarQuizzes = MakeElement("schedule-calendar-quizzes", cell)
        let eventsQuizzes = MakeElement("schedule-events-quizzes", events)

        for (let quiz of this.day2quizzes.get(day)) {
            this.BuildCalendarQuiz(calendarQuizzes, quiz)
            this.BuildEventsQuiz(eventsQuizzes, quiz)
            this.BuildPopupQuiz(quiz)
        }

        cellDay.addEventListener("click", () => this.ToggleEvents(cellDay, eventsQuizzes))
    }

    BuildCalendarQuiz(parent, quiz) {
        let place = this.placeId2place.get(quiz.placeId)
        let organizer = this.organizerId2organizer.get(quiz.organizerId)

        let block = MakeElement("schedule-calendar-quiz", parent, {id: `schedule-calendar-quiz-${quiz.quizId}`, style: `background-color: ${place.color}`})
        MakeElement("schedule-calendar-quiz-name", block, {innerText: quiz.shortName})
        MakeElement("schedule-calendar-quiz-icon", block, {src: organizer.imageUrl}, "img")
        MakeElement("schedule-calendar-quiz-time", block, {innerText: quiz.FormatTime()})

        block.addEventListener("click", () => this.OpenPopup(quiz.quizId))
    }

    BuildEventsQuiz(parent, quiz) {
        let place = this.placeId2place.get(quiz.placeId)
        let organizer = this.organizerId2organizer.get(quiz.organizerId)

        let block = MakeElement("schedule-events-quiz", parent, {id: `schedule-events-quiz-${quiz.quizId}`, style: `background-color: ${place.color}`})
        MakeElement("schedule-events-quiz-icon", block, {src: organizer.imageUrl}, "img")

        let info = MakeElement("schedule-events-quiz-info", block)        
        let time = MakeElement("schedule-events-quiz-time", info)
        MakeElement("", time, {src: "/images/icons/schedule/time.svg"}, "img")
        MakeElement("", time, {innerText: ` ${quiz.FormatTime()}`}, "span")
        MakeElement("schedule-events-quiz-name", info, {innerText: quiz.shortName})

        let circle = MakeElement("circle-link", block)
        MakeElement("", circle, {src: "/images/icons/arrow-right.svg"}, "img")

        block.addEventListener("click", () => this.OpenPopup(quiz.quizId))
    }

    BuildPopupQuiz(quiz) {
        let place = this.placeId2place.get(quiz.placeId)
        let organizer = this.organizerId2organizer.get(quiz.organizerId)

        let popup = MakeElement("schedule-popup", this.popups, {id: `schedule-popup-${quiz.quizId}`})

        let close = MakeElement("schedule-popup-close", popup)
        let closeIcon = MakeElement("", close, {src: "/images/icons/schedule/close.svg"}, "img")
        closeIcon.addEventListener("click", () => this.ClosePopups())

        let category = MakeElement("schedule-popup-category", popup)
        MakeElement("schedule-popup-category-color", category, {style: `background-color: ${quiz.category.ToColor()}`}, "span")
        MakeElement("schedule-popup-category-name", category, {innerText: quiz.category.ToRus()}, "span")

        MakeElement("schedule-popup-name", popup, {innerText: quiz.name}, "h2")

        if (quiz.HaveDescription())
            MakeElement("schedule-popup-description", popup, {innerText: quiz.description})

        let icons = MakeElement("schedule-popup-icons", popup)

        this.BuildPopupQuizIcon(icons, "/images/icons/schedule/calendar.svg", quiz.FormatDatetime())
        this.BuildPopupQuizIcon(icons, "/images/icons/schedule/location.svg", place.GetLocationText())
        this.BuildPopupQuizIcon(icons, "/images/icons/schedule/cost.svg", quiz.FormatCost())
        this.BuildPopupQuizIcon(icons, organizer.imageUrl, organizer.name)

        if (!quiz.result)
            return

        this.BuildPopupQuizIcon(icons, "/images/icons/schedule/position.svg", quiz.FormatPosition())
        let players = this.BuildPopupQuizIcon(icons, "/images/icons/schedule/players.svg", quiz.FormatPlayers())
        this.BuildPopupQuizParticipants(players, quiz)
    }

    BuildPopupQuizIcon(parent, icon, text) {
        MakeElement("schedule-popup-icons-icon", parent, {src: icon}, "img")
        let block = MakeElement("schedule-popup-icons-text", parent)
        MakeElement("", block, {innerHTML: text})
        return block
    }

    BuildPopupQuizParticipants(parent, quiz) {
        let participants = MakeElement("schedule-popup-participants", parent)

        for (let username of quiz.participants) {
            let link = MakeElement("", participants, {href: `/profile?username=${username}`}, "a")
            MakeElement("", link, {src: this.username2avatar[username]}, "img")
        }
    }

    BuildAnalytics(parent) {
        if (this.analytics.games === 0)
            return

        let analytics = MakeElement("schedule-analytics", parent)
        MakeElement("schedule-analytics-header", analytics, {innerText: "СТАТИСТИКА ЗА МЕСЯЦ"}, "h2")

        let items = MakeElement("schedule-analytics-items", analytics)

        this.BuildAnalyticsItem(items, this.analytics.games, GetWordForm(this.analytics.games, ["игру сыграли", "игры сыграли", "игр сыграли"], true))

        if (this.analytics.wins > 0)
            this.BuildAnalyticsItem(items, this.analytics.wins, GetWordForm(this.analytics.wins, ["раз победили", "раза победили", "раз победили"], true))

        if (this.analytics.top3 > 0)
            this.BuildAnalyticsItem(items, this.analytics.top3, GetWordForm(this.analytics.top3, ["раз вошли в тройку", "раза вошли в тройку", "раз вошли в тройку"], true))

        this.BuildAnalyticsItem(items, Round(this.analytics.mean_position, 10), "средняя позиция")
    }

    BuildAnalyticsItem(parent, value, label) {
        let item = MakeElement("schedule-analytics-item", parent)
        MakeElement("schedule-analytics-value", item, {innerText: value})
        MakeElement("schedule-analytics-label", item, {innerText: label})
    }

    OpenPopup(quizId) {
        let popup = document.getElementById(`schedule-popup-${quizId}`)
        popup.classList.add("schedule-popup-open")
        this.popups.classList.add("schedule-popups-open")
    }

    ClosePopups() {
        this.popups.classList.remove("schedule-popups-open")

        for (let popup of document.querySelectorAll(".schedule-popup-open"))
            popup.classList.remove("schedule-popup-open")
    }

    ToggleEvents(day, quizzes) {
        for (let node of document.querySelectorAll(".schedule-calendar-day"))
            if (node != day)
                node.classList.remove("schedule-calendar-day-selected")

        for (let node of document.querySelectorAll(".schedule-events-quizzes"))
            node.classList.remove("schedule-events-quizzes-open")

        day.classList.toggle("schedule-calendar-day-selected")

        if (day.classList.contains("schedule-calendar-day-selected"))
            quizzes.classList.add("schedule-events-quizzes-open")
        else
            quizzes.classList.remove("schedule-events-quizzes-open")
    }

    Resize() {
        for (let cell of document.querySelectorAll(".schedule-calendar-quizzes")) {
            cell.setAttribute("style", "font-size: 1em;")

            for (let fontSize = 1; this.CheckMaxSize(cell) && fontSize > 0.1; fontSize *= 0.9)
                cell.setAttribute("style", `font-size: ${fontSize}em;`)
        }
    }

    CheckMaxSize(block) {
        let bbox = block.getBoundingClientRect()
        let size = bbox.height

        if (block.children.length > 1)
            for (let child of block.querySelectorAll(".schedule-calendar-quiz-name"))
                size = Math.max(size, child.getBoundingClientRect().width)

        return size >= bbox.width + 1
    }
}
