function GetParams() {
    let period = document.getElementById("period").value

    return {period: period}
}

function UpdateAnalytics() {
    for (let loader of loaders) {
        loader.Reset()
        loader.Load()
    }
}

function LoadTeamActivity(response, block) {
    let yearGrid = new YearGrid(block, response.team_activity, {})
}

function LoadGamesResult(response, block) {
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
