function GetParams() {
    let period = document.getElementById("period-dates").value
    return {period: period}
}

function PushUrlParams(params) {
    let url = new URL(window.location.href)

    let keys = [...url.searchParams.keys()]
    for (let key of keys)
        url.searchParams.delete(key)

    if ("period" in params && params.period !== "")
        url.searchParams.set("period", params.period)

    window.history.pushState(null, '', url.toString())
}

function ChangePeriod() {
    let period = document.getElementById("period")
    let dates = document.getElementById("period-dates")

    if (period.value == "period") {
        dates.classList.remove("hidden")
        return
    }

    dates.classList.add("hidden")
    dates.value = period.value

    UpdateAnalytics()
}

function ChangeDates() {
    let period = document.getElementById("period")
    let dates = document.getElementById("period-dates")

    period.value = ["", "last-year", "curr-year", "last-month", "curr-month"].indexOf(dates.value) > -1 ? dates.value : "period"

    if (period.value == "period")
        dates.classList.remove("hidden")
    else
        dates.classList.add("hidden")

    UpdateAnalytics()
}

function UpdateAnalytics() {
    let params = GetParams()
    PushUrlParams(params)

    for (let loader of loaders) {
        loader.Reset()
        loader.Load()
    }
}

function LoadTeamActivity(response, block) {
    if (Object.keys(response.team_activity).length === 0) {
        MakeElement("description", block, {innerText: "Нет данных за указанный период"})
        return
    }

    let yearGrid = new YearGrid(block, response.team_activity, {})
}

function LoadGamesResult(response, block) {
    if (response.games === 0) {
        MakeElement("description", block, {innerText: "Нет данных за указанный период"})
        return
    }

    let results = MakeElement("games-result", block)
    let plot = MakeElement("analytics-chart", results)
    let svg = MakeElement("", plot, {}, "svg")

    let data = [
        {value: response.wins, color: "#ffa1a6"},
        {value: response.top3, color: "#fddc81"},
        {value: response.top10, color: "#ed9ddc"},
        {value: response.games - response.wins - response.top3 - response.top10, color: "#9cc2ff"},
    ]

    let chart = new Chart({})
    chart.Plot(svg, data, "Всего игр", response.games)

    let blocks = MakeElement("analytics-blocks", results)

    let items = [
        {label: "Победы", value: response.wins, part: response.wins / response.games, color: "#ffa1a6"},
        {label: "2-3 места", value: response.top3, part: response.top3 / response.games, color: "#fddc81"},
        {label: "4-10 места", value: response.top10, part: response.top10 / response.games, color: "#ed9ddc"},
    ]

    for (let item of items) {
        let resultBlock = MakeElement("analytics-block", blocks)
        let bar = MakeElement("analytics-block-bar", resultBlock, {style: `background-color: ${item.color}4d`})
        MakeElement("", bar, {style: `height: ${item.part * 100}%; background-color: ${item.color}`})

        let div = MakeElement("", resultBlock)
        MakeElement("analytics-block-value", div, {innerText: `${Round(item.part * 100, 10)}%`})
        MakeElement("analytics-block-label", div, {innerHTML: `<b>${item.label}</b>: ${item.value}`})
    }
}

function LoadPositions(response, block) {
    if (response.mean_position === 0) {
        MakeElement("description", block, {innerText: "Нет данных за указанный период"})
        return
    }

    let item = MakeElement("analytics-item", block)
    MakeElement("analytics-item-label", item, {innerText: "Средняя позиция: "}, "span")
    MakeElement("analytics-item-value", item, {innerText: Round(response.mean_position, 10)}, "span")

    let data = []
    for (let position = 1; position <= 16; position++)
        data.push({"position": position, "position-label": position <= 15 ? `${position}` : "ниже", "count": response.positions[position]})

    let plot = MakeElement("analytics-plot", block)
    let svg = MakeElement("", plot, {id: "positions-svg"}, "svg")
    let chart = new BarChart({barColor: "#ea97d9", minRectWidth: 35, maxRectWidth: 45, bottomPadding: 12, labelSize: 11})
    chart.Plot(svg, data, "position-label", "count")
}

function BuildGamesCategoriesChart(response, block) {
    let plot = MakeElement("analytics-chart", block)
    let svg = MakeElement("", plot, {}, "svg")
    let data = []

    for (let item of response.categories) {
        let category = new Category(item.category)
        data.push({value: item.games, color: category.ToColor()})
    }

    let chart = new Chart()
    chart.Plot(svg, data)
}

function BuildGamesCategoriesBars(response, block) {
    let maxGames = 0

    for (let item of response.categories)
        maxGames = Math.max(maxGames, item.games)

    MakeElement("description", block, {innerText: "Чтобы увидеть более подробную информацию, нажмите на интересующую категорию."}, "p")

    for (let item of response.categories) {
        let category = new Category(item.category)
        let color = category.ToColor()

        let bar = MakeElement("analytics-categories-bar", block, {style: `background-color: ${color}4d;`})
        let main = MakeElement("analytics-categories-bar-main", bar, {style: `background-color: ${color}; width: ${item.games / maxGames * 100}%;`}, "span")
        MakeElement("analytics-categories-bar-label", main, {innerText: category.ToRus()}, "span")
        MakeElement("analytics-categories-bar-value", bar, {innerText: item.games}, "span")

        let info = MakeElement("analytics-categories-info", block, {style: `background-color: ${color}20; border-color: ${color};`})
        bar.addEventListener("click", () => info.classList.toggle("analytics-categories-info-open"))

        // TODO
        MakeElement("", info, {innerText: "РЕЗУЛЬТАТЫ ИГР"}, "h2")
        LoadGamesResult(item, info)
        MakeElement("", info, {innerText: "РАСПРЕДЕЛЕНИЕ МЕСТ"}, "h2")
        LoadPositions(item, info)
    }
}

function LoadGamesCategories(response, block) {
    if (response.categories.length === 0) {
        MakeElement("", block, {innerText: "КАТЕГОРИИ ИГР"}, "h2")
        MakeElement("description", block, {innerText: "Нет данных за указанный период"})
        return
    }

    BuildGamesCategoriesChart(response, MakeElement("analytics-categories-chart", block))
    BuildGamesCategoriesBars(response, MakeElement("analytics-categories-bars", block))
}

function LoadTopPlayers(response, block) {
    if (response.top_players.length === 0) {
        MakeElement("description", block, {innerText: "Нет данных за указанный период"})
        return
    }

    let text = [
        "Топ считается с учётом активности игроков. Алгоритм сортировки игроков по активности учитывает не только общее количество игр, в которых участвовал каждый игрок, но и их давность.",
        "Чем больше времени прошло с момента последней игры, тем меньше её вес. Таким образом, игроки, которые ходили на квизы недавно, будут иметь больший показатель активности, чем те, кто ходил давно."
    ].join(" ")

    MakeElement("", block, {innerText: text}, "p")
    let players = MakeElement("top-players", block)

    for (let player of response.top_players) {
        let user = new User(player)
        players.appendChild(user.BuildTopPlayer(player))
    }
}

function BuildGamesOrganizer(organizer, cell) {
    let div = MakeElement("games-organizer", cell)
    MakeElement("", div, {src: organizer.image_url}, "img")
    MakeElement("", div, {innerText: organizer.name}, "span")
}

function BuildGamesFilter(block, values, name, onchange) {
    let select = MakeElement("basic-select", block, {}, "select")
    MakeElement("", select, {innerText: name, value: "all"}, "option")

    for (let value of values)
        MakeElement("", select, {innerText: value, value: value}, "option")

    select.addEventListener("change", onchange)
    return select
}

function LoadGames(response, block) {
    if (response.games.length === 0) {
        MakeElement("description", block, {innerText: "Нет данных за указанный период"})
        return
    }

    let gamesControls = MakeElement("games-controls", block)
    let detailedTable = MakeCheckbox("Подробно", "detailed-table", gamesControls)
    let positionFilter = BuildGamesFilter(gamesControls, ["победы", "2-3 места", "призовые места", "ниже тройки"], "Все места", () => table.Show())
    let categoryFilter = BuildGamesFilter(gamesControls, response.categories.map(category => new Category(category).ToRus()), "Все категории", () => table.Show())
    let placeFilter = BuildGamesFilter(gamesControls, response.places.map(place => place.name), "Все места проведения", () => table.Show())
    let organizerFilter = BuildGamesFilter(gamesControls, response.organizers.map(organizer => organizer.name), "Все организаторы", () => table.Show())

    let position2values = {
        "победы": {min: 1, max: 1},
        "2-3 места": {min: 2, max: 3},
        "призовые места": {min: 1, max: 3},
        "ниже тройки": {min: 4, max: Infinity},
    }

    let games = MakeElement("games", block)

    let columns = [
        {name: "Дата", build: (quiz, cell) => {cell.innerText = FormatDate(new Date(quiz.datetime))}, type: "date", visible: true, sortable: true, wrap: false},
        {name: "Место", build: (quiz, cell) => {cell.innerText = quiz.result.position}, type: "number", visible: true, sortable: true, wrap: false, filter: (value) => positionFilter.value === "all" || (position2values[positionFilter.value].min <= +value && +value <= position2values[positionFilter.value].max)},
        {name: "Название", build: (quiz, cell) => {cell.innerText = quiz.name}, type: "text", visible: true, sortable: true, align: "left", wrap: true},
        {name: "Категория", build: (quiz, cell) => {new Category(quiz.category).Build(cell)}, type: "text", visible: false, sortable: true, wrap: false, filter: (value) => categoryFilter.value === "all" || value.trim() == categoryFilter.value},
        {name: "Организатор", build: (quiz, cell) => {BuildGamesOrganizer(response.organizer_id2organizer[quiz.organizer_id], cell)}, type: "text", visible: false, sortable: true, "align": "left", wrap: false, filter: (value) => organizerFilter.value === "all" || value == organizerFilter.value},
        {name: "Игроки", build: (quiz, cell) => {cell.innerText = quiz.result.players}, type: "number", visible: false, sortable: true, wrap: false},
        {name: "Команды", build: (quiz, cell) => {cell.innerText = quiz.result.teams}, type: "number", visible: false, sortable: true, wrap: false},
        {name: "Место проведения", build: (quiz, cell) => {cell.innerText = response.place_id2place[quiz.place_id].name}, type: "text", visible: false, sortable: true, wrap: false, filter: (value) => placeFilter.value === "all" || value == placeFilter.value},
    ]

    let table = new FilterTable(games, columns)

    for (let game of response.games)
        table.AppendData(game)

    table.ShowNext()

    detailedTable.addEventListener("click", () => {
        let visible = detailedTable.checked
        table.UpdateColumnsVisibility({"Категория": visible, "Организатор": visible, "Игроки": visible, "Команды": visible, "Место проведения": visible})
    })
}

function BuildMonthDataPlot(block, name, data, color, metric, chartType) {
    let analytics = MakeElement("analytics", block)
    MakeElement("", analytics, {innerText: name}, "h2")

    let plot = MakeElement("analytics-plot", analytics)
    let svg = MakeElement("", plot, {id: `${metric}-svg`}, "svg")
    let chart = null

    if (chartType === "bar-chart")
        chart = new BarChart({barColor: color})
    else if (chartType === "plot-chart")
        chart = new PlotChart({markerColor: color})
    else
        return

    chart.Plot(svg, data, "label", metric)
}

function BuildMonthTopPlayers(block, data, username, topCount = 7) {
    let analytics = MakeElement("analytics", block)
    MakeElement("", analytics, {innerText: "ТОП АКТИВНЫХ ИГРОКОВ"}, "h2")

    let players = MakeElement("months-top-players", analytics)

    for (let item of data) {
        let profiles = MakeElement("months-top-players-profiles", players)

        for (let i = item.top_players.length; i < topCount; i++)
            MakeElement("", profiles)

        for (let i = 0; i < item.top_players.length && i < topCount; i++)
            MakeElement(item.top_players[i].username == username ? "months-top-players-profile-current" : "", profiles, {src: item.top_players[i].avatar_url}, "img")

        MakeElement("months-top-players-date", players, {innerHTML: item.label.replace("\n", "<br>")})
    }
}

function LoadMonthAnalytics(response, block) {
    if (response.month_analytics.length < 2) {
        block.parentNode.parentNode.classList.add("hidden")
        return
    }

    let months = ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"]

    for (let data of response.month_analytics)
        data.label = `${months[data.month - 1]}\n${data.year}`

    block.parentNode.parentNode.classList.remove("hidden")

    BuildMonthDataPlot(block, "ИГРЫ", response.month_analytics, "#9cc2ff", "games", "bar-chart")
    BuildMonthDataPlot(block, "ПОБЕДЫ", response.month_analytics, "#ffa1a6", "wins", "bar-chart")
    BuildMonthDataPlot(block, "2-3 МЕСТА", response.month_analytics, "#fddc81", "top3", "bar-chart")
    BuildMonthDataPlot(block, "ВХОЖДЕНИЕ В ТРОЙКУ", response.month_analytics, "#ed9ddc", "prizes", "bar-chart")
    BuildMonthDataPlot(block, "СРЕДНЯЯ ПОЗИЦИЯ", response.month_analytics, "#9cc2ff", "mean_position", "plot-chart")
    BuildMonthDataPlot(block, "СРЕДНЕЕ ЧИСЛО ИГРОКОВ", response.month_analytics, "#9cc2ff", "mean_players", "plot-chart")
    BuildMonthTopPlayers(block, response.month_analytics, response.username)

    if (response.month_analytics[0].year >= 2024)
        BuildMonthDataPlot(block, "СМУЗИ РЕЙТИНГ", response.month_analytics, "#fddc81", "smuzi_rating", "bar-chart")
}
