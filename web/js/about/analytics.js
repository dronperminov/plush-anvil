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
    let svg = MakeElement("", plot, {}, "svg")
    let chart = new BarChart({barColor: "#ea97d9", minRectWidth: 35, maxRectWidth: 45, bottomPadding: 12, labelSize: 11})
    chart.Plot(svg, data, "position-label", "count")
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

function LoadGames(response, block) {
    if (response.games.length === 0) {
        MakeElement("description", block, {innerText: "Нет данных за указанный период"})
        return
    }

    let columns = [
        {name: "Дата", build: (quiz, cell) => {cell.innerText = FormatDate(new Date(quiz.datetime))}, type: "date", visible: true, sortable: true, wrap: false},
        {name: "Место", build: (quiz, cell) => {cell.innerText = quiz.result.position}, type: "number", visible: true, sortable: true, wrap: false},
        {name: "Название", build: (quiz, cell) => {cell.innerText = quiz.name}, type: "text", visible: true, sortable: true, align: "left", wrap: true},
        {name: "Категория", build: (quiz, cell) => {new Category(quiz.category).Build(cell)}, type: "text", visible: false, sortable: true, wrap: false},
        {name: "Организатор", build: (quiz, cell) => {BuildGamesOrganizer(response.organizer_id2organizer[quiz.organizer_id], cell)}, type: "text", visible: false, sortable: true, "align": "left", wrap: false},
        {name: "Игроки", build: (quiz, cell) => {cell.innerText = quiz.result.players}, type: "number", visible: false, sortable: true, wrap: false},
        {name: "Команды", build: (quiz, cell) => {cell.innerText = quiz.result.teams}, type: "number", visible: false, sortable: true, wrap: false},
        {name: "Место проведения", build: (quiz, cell) => {cell.innerText = response.place_id2place[quiz.place_id].name}, type: "text", visible: false, sortable: true, wrap: false},
    ]

    let games = MakeElement("games", block)
    let table = new FilterTable(games, columns)

    for (let game of response.games)
        table.AppendData(game)

    table.ShowNext()
}
