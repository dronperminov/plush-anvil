function GetParams() {
    return {}
}

function LoadTeamActivity(response, block) {
    let yearGrid = new YearGrid(block, response.team_activity, {})
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
