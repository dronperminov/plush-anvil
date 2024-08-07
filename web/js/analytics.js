function PlotAnalyticsChart() {
    let svg = document.getElementById("analytics-info-chart")
    let chart = new Chart()
    chart.Plot(svg, chart_data)
}

function PlotCategoriesChart() {
    let svg = document.getElementById("analytics-categories-chart")
    let chart = new Chart()
    chart.Plot(svg, categories_data)

    let radar = new RadarChart(window.innerWidth <= 767 ? {labelSize: 10} : {labelSize: 14})
    radar.Plot("analytics-categories-radar", categories_data.filter(row => row.value > 0).sort((a, b) => Math.random() < 0.5 ? 1 : -1))
}

function PlotPositionsChart(svgId, positions, color) {
    let svg = document.getElementById(svgId)
    svg.clientHeight = 300

    let chart = new BarChart({barColor: color, minRectWidth: 32, maxRectWidth: 45, bottomPadding: 12})
    let data = []

    for (let position = 1; position <= 16; position++)
        data.push({"position": position, "position-label": position <= 15 ? `${position}` : "ниже", "count": positions[position]})

    chart.Plot(svg, data, "position-label", "count")
}

function PlotMonthData() {
    for (let key of ["wins", "prizes", "top3", "games"]) {
        let svg = document.getElementById(`analytics-months-info-${key}-chart`)
        let chart = new BarChart({barColor: colors[key]})
        chart.Plot(svg, months_data, "date", key)
    }

    for (let key of ["mean_position", "mean_players"]) {
        let svg = document.getElementById(`analytics-months-info-${key}-chart`)
        let chart = new PlotChart({markerColor: colors[key]})
        chart.Plot(svg, months_data, "date", key)
    }

    if (+months_data[months_data.length - 1]["date"].split("\n")[1] < 2024)
        return

    let start = months_data.map(data => data["date"]).indexOf("декабрь\n2023") + 1
    let svg = document.getElementById(`analytics-months-info-rating-chart`)
    let chart = new BarChart({barColor: colors["rating"]})
    chart.Plot(svg, months_data, "date", "rating", start)
}
