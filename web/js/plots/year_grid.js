function YearGrid(block, date2count, config) {
    this.date2count = date2count
    this.years = this.GetYears()
    this.colors = config.colors || ["#f1f1f1", "#ebc5e3", "#ea97d9", "#ea50ca"]

    this.Build(block)

    if (this.years.length > 0)
        this.ShowYear(this.years[0])
}

YearGrid.prototype.GetYears = function() {
    let years = new Set()

    for (let [date, count] of Object.entries(this.date2count))
        years.add(+date.split(".")[2])

    return Array.from(years).sort().reverse()
}

YearGrid.prototype.Date2Key = function(date) {
    let month = `${date.getMonth() + 1}`.padStart(2, '0')
    let day = `${date.getDate()}`.padStart(2, '0')
    let year = date.getFullYear()
    return `${day}.${month}.${year}`
}

YearGrid.prototype.FilterDates = function(startDate, endDate) {
    let date2count = {}

    for (let [key, count] of Object.entries(this.date2count)) {
        let [day, month, year] = key.split(".")
        let date = new Date(+year, +month - 1, +day)

        if (startDate <= date && date <= endDate)
            date2count[key] = count
    }

    return date2count
}

YearGrid.prototype.Build = function(parent) {
    let grid = MakeElement("year-grid", parent)

    this.buttons = this.BuildButtons(MakeElement("year-grid-scrollable", grid))
    this.cells = MakeElement("year-grid-cells", MakeElement("year-grid-scrollable", grid))
}

YearGrid.prototype.BuildButtons = function(grid) {
    let buttons = MakeElement("year-grid-buttons", grid)

    for (let year of this.years) {
        let button = MakeElement("year-grid-button", buttons, {innerText: year}, "button")
        button.addEventListener("click", () => this.ShowYear(year))
    }

    return buttons
}

YearGrid.prototype.UpdateButtons = function(year) {
    for (let button of this.buttons.children) {
        if (button.innerText == year)
            button.classList.add("year-grid-selected-button")
        else
            button.classList.remove("year-grid-selected-button")
    }
}

YearGrid.prototype.ShowYear = function(year) {
    this.UpdateButtons(year)
    this.cells.innerHTML = ""

    let startDate = new Date(year, 0, 1)
    let endDate = new Date(year, 11, 31)

    let startSkip = (startDate.getDay() + 6) % 7
    let endSkip = (7 - endDate.getDay()) % 7

    let date2count = this.FilterDates(startDate, endDate)
    let maxCount = Math.max(...Object.values(date2count))

    let months = this.GetMonths(startDate, endDate, startSkip)
    let monthIndex = 0

    this.AddWeekdayCells()
    this.AddMonthCell(months[monthIndex++])
    this.AddSkipCells(startSkip)

    let lastMonth = startDate.getMonth()
    let weekCount = 0
    let weekCells = []
    let week2count = [0, 0, 0, 0, 0, 0, 0]

    for (let date = new Date(startDate), index = startSkip; date <= endDate; date.setDate(date.getDate() + 1), index++) {
        if (date.getMonth() != lastMonth && index % 7 == 0) {
            this.AddMonthCell(months[monthIndex++])
            lastMonth = date.getMonth()
        }

        let dateKey = this.Date2Key(date)
        let count = dateKey in date2count ? date2count[dateKey] : 0
        MakeElement("year-grid-day-cell", this.cells, {title: `${dateKey}: ${count}`, style: `background: ${this.GetColor(count, maxCount)}`})

        weekCount += count
        week2count[index % 7] += count

        if (index % 7 == 6) {
            weekCells.push(this.AddWeekCell(weekCount))
            weekCount = 0
        }
    }

    this.AddSkipCells(endSkip)

    if (endSkip > 0)
        weekCells.push(this.AddWeekCell(weekCount))

    this.AddWeekCountCells(week2count)
    this.UpdateWeekCells(weekCells)
}

YearGrid.prototype.AddWeekdayCells = function() {
    for (let day of ["", "пн", "вт", "ср", "чт", "пт", "сб", "вс", "", "нед"])
        MakeElement("year-grid-weekday-cell", this.cells, {innerText: day})
}

YearGrid.prototype.AddSkipCells = function(skip) {
    for (let i = 0; i < skip; i++)
        MakeElement("year-grid-skip-cell", this.cells)
}

YearGrid.prototype.AddMonthCell = function(month) {
    MakeElement("year-grid-month-cell", this.cells, {innerText: month.name, style: `grid-column-end: span ${month.span}`})
}

YearGrid.prototype.AddWeekCell = function(count) {
    MakeElement("year-grid-week-cell", this.cells, {innerText: count > 0 ? count : ""})
    let cell = MakeElement("year-grid-day-cell", this.cells, {title: count})

    return {cell, count}
}

YearGrid.prototype.AddWeekCountCell = function(count) {
    MakeElement("year-grid-week-count-cell", this.cells, {innerText: count > 0 ? count : ""})
}

YearGrid.prototype.GetMonths = function(startDate, endDate, skip) {
    let lastMonth = startDate.getMonth() - 1
    let monthNames = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"]
    let months = []
    let indices = []
    let index = skip

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1), index++) {
        let month = date.getMonth()

        if (month != lastMonth && (index == skip || index % 7 == 0)) {
            months.push({name: monthNames[month], span: 0})
            lastMonth = month
            indices.push(Math.floor(index / 7))
        }
    }

    indices.push(Math.floor((index - 1) / 7) + 1)

    for (let i = 1; i < indices.length; i++)
        months[i - 1].span = indices[i] - indices[i - 1]

    return months
}

YearGrid.prototype.GetColor = function(count, max) {
    if (count == 0)
        return this.colors[0]

    if (max == 1)
        return this.colors[1]

    return this.colors[1 + Math.floor(count / max * (this.colors.length - 2))]
}

YearGrid.prototype.UpdateWeekCells = function(weekCells) {
    let max = Math.max(...weekCells.map(v => v.count))

    for (let cell of weekCells)
        cell.cell.style.background = this.GetColor(cell.count, max)
}

YearGrid.prototype.AddWeekCountCells = function(week2count) {
    let maxCount = Math.max(...week2count)

    this.AddSkipCells(1)
    for (let i = 0; i < 7; i++)
        this.AddWeekCountCell(week2count[i])

    this.AddSkipCells(3)
    for (let i = 0; i < 7; i++)
        MakeElement("year-grid-day-cell", this.cells, {style: `background: ${this.GetColor(week2count[i], maxCount)}`})
}