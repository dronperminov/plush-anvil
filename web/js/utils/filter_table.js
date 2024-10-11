function FilterTable(block, columns, showSize = 10) {
    this.columns = columns
    this.data = []
    this.showSize = showSize
    this.showCount = 0

    this.table = MakeElement("filter-table", MakeElement("filter-table-scrollable", block), {}, "table")
    this.buttons = MakeElement("filter-table-buttons", block)

    this.BuildHeader()
    this.BuildButtons()
}

FilterTable.prototype.BuildHeader = function() {
    let row = MakeElement("", this.table, {}, "tr")

    for (let column of this.columns) {
        column.cell = MakeElement(column.visible ? "" : "hidden", row, {innerText: column.name}, "th")

        if (column.sortable)
            column.cell.addEventListener("click", () => this.SortByColumn(column))
    }
}

FilterTable.prototype.BuildButtons = function() {
    this.collapseBtn = MakeElement("basic-button gradient-button", this.buttons, {innerText: "Свернуть"}, "button")
    this.collapseBtn.addEventListener("click", () => this.Collapse())

    this.showBtn = MakeElement("basic-button gradient-button", this.buttons, {innerText: "Показать ещё"}, "button")
    this.showBtn.addEventListener("click", () => this.ShowNext())
}

FilterTable.prototype.AppendCell = function(column, data, row) {
    let cell = MakeElement(column.visible ? "" : "hidden", row, {}, "td")

    if (column.align === "left")
        cell.classList.add("filter-table-left")

    if (!column.wrap)
        cell.classList.add("filter-table-no-wrap")

    column.build(data, cell)
    return cell
}

FilterTable.prototype.AppendData = function(data) {
    let row = MakeElement("hidden", this.table, {}, "tr")
    let name2cell = {}

    for (let column of this.columns)
        name2cell[column.name] = this.AppendCell(column, data, row)

    this.data.push({row: row, name2cell: name2cell, index: this.data.length})
}

FilterTable.prototype.GetValue = function(column, text) {
    if (column.type == "text")
        return text.toLowerCase()

    if (column.type == "number")
        return +text

    if (column.type == "date") {
        let [day, month, year] = text.split(".")
        return new Date(+year, +month - 1, +day)
    }

    return text
}

FilterTable.prototype.CompareRows = function(column, row1, row2, sign) {
    let value1 = this.GetValue(column, row1.name2cell[column.name].innerText)
    let value2 = this.GetValue(column, row2.name2cell[column.name].innerText)
    
    if (value1 < value2)
        return -sign

    if (value1 > value2)
        return sign

    return row1.index - row2.index
}

FilterTable.prototype.SortByColumn = function(targetColumn) {
    for (let column of this.columns) {
        if (column != targetColumn) {
            column.cell.classList.remove("order-asc")
            column.cell.classList.remove("order-desc")
        }
    }

    let cell = targetColumn.cell
    if (cell.classList.contains("order-asc") || cell.classList.contains("order-desc")) {
        cell.classList.toggle("order-asc")
        cell.classList.toggle("order-desc")
    }
    else {
        cell.classList.add("order-asc")
    }

    while (this.table.children.length > 1)
        this.table.removeChild(this.table.children[1])

    let sign = cell.classList.contains("order-asc") ? 1 : -1
    this.data.sort((row1, row2) => this.CompareRows(targetColumn, row1, row2, sign))

    for (let data of this.data)
        this.table.appendChild(data.row)

    this.Show()
}

FilterTable.prototype.GetTotalRows = function() {
    return this.data.length
}

FilterTable.prototype.UpdateButtons = function() {
    let total = this.GetTotal()
    this.showCount = Math.min(Math.max(this.showCount, this.showSize), total)

    this.UpdateVisibility(this.showBtn, this.showCount != total)
    this.UpdateVisibility(this.collapseBtn, this.showCount > this.showSize)
}

FilterTable.prototype.GetTotal = function() {
    let total = 0

    for (let data of this.data)
        if (this.FilterRow(data))
            total++

    return total
}

FilterTable.prototype.Show = function() {
    this.UpdateButtons()

    let total = 0

    for (let data of this.data) {
        if (!this.FilterRow(data)) {
            this.UpdateVisibility(data.row, false)
            continue
        }

        this.UpdateVisibility(data.row, total < this.showCount)

        for (let column of this.columns) {
            this.UpdateVisibility(data.name2cell[column.name], column.visible)
            this.UpdateVisibility(column.cell, column.visible)
        }

        total++
    }
}

FilterTable.prototype.UpdateVisibility = function(node, condition) {
    if (condition)
        node.classList.remove("hidden")
    else
        node.classList.add("hidden")
}

FilterTable.prototype.ShowNext = function() {
    this.showCount += this.showSize
    this.Show()
}

FilterTable.prototype.Collapse = function() {
    this.showCount = this.showSize
    this.Show()
    this.table.scrollIntoView({behavior: "smooth", block: "start"})
}

FilterTable.prototype.UpdateColumnsVisibility = function(columns) {
    for (let column of this.columns)
        if (column.name in columns)
            column.visible = columns[column.name]

    this.Show()
}

FilterTable.prototype.FilterRow = function(row) {
    for (let column of this.columns)
        if (column.filter && !column.filter(row.name2cell[column.name].innerText))
            return false

    return true
}
