function Chart(config = null) {
    if (config === null)
        config = {}

    this.radius = config.radius || 60
    this.size = config.size || 60
    this.initAngle = config.initAngle || 90
    this.gap = config.gap || 2
    this.dividerColor = config.dividerColor || "#ffffff"

    this.labelColor = config.labelColor || "#222222"
    this.labelSize = config.labelSize || 14
    this.valueSize = config.valueSize || 42
}

Chart.prototype.GetAngles = function(data) {
    let sum = 0

    for (let value of data)
        sum += value.value

    let angles = []
    for (let i = 0; i < data.length; i++)
        angles.push((i > 0 ? angles[i - 1] : 0) + data[i].value / sum * 2 * Math.PI)

    return angles
}

Chart.prototype.AppendLabel = function(svg, x, y, labelText, labelSize, fontWeight, baseline = "middle") {
    let label = document.createElementNS('http://www.w3.org/2000/svg', "text")
    label.textContent = labelText
    label.setAttribute("x", x)
    label.setAttribute("y", y)
    label.setAttribute("dominant-baseline", baseline)
    label.setAttribute("text-anchor", "middle")
    label.setAttribute("fill", this.labelColor)
    label.setAttribute("font-size", labelSize)
    label.setAttribute("font-weight", fontWeight)
    svg.appendChild(label)
}

Chart.prototype.MakeSegment = function(svg, x, y, startAngle, endAngle, color) {
    let circle = document.createElementNS('http://www.w3.org/2000/svg', "circle")
    let radius = this.radius + this.size / 2

    circle.setAttribute("cx", 0)
    circle.setAttribute("cy", 0)
    circle.setAttribute("r", radius)

    circle.setAttribute("stroke", color)
    circle.setAttribute("stroke-width", this.size)
    circle.setAttribute("fill", "none")
    circle.setAttribute("stroke-dasharray", `${radius * (endAngle - startAngle)}, ${radius * 2 * Math.PI}`)
    circle.setAttribute("transform", `translate(${x} ${y}) rotate(${(startAngle) / Math.PI * 180 + this.initAngle})`)
    svg.appendChild(circle)
}

Chart.prototype.MakeDivider = function(svg, x, y, startAngle, endAngle) {
    if (endAngle >= Math.PI * 2)
        endAngle = 0

    if (startAngle == endAngle)
        return

    let path = document.createElementNS('http://www.w3.org/2000/svg', "path")
    let angle = endAngle + this.initAngle / 180 * Math.PI

    let x1 = x + this.radius * Math.cos(angle)
    let y1 = y + this.radius * Math.sin(angle)

    let x2 = x + (this.radius + this.size) * Math.cos(angle)
    let y2 = y + (this.radius + this.size) * Math.sin(angle)

    path.setAttribute("stroke", this.dividerColor)
    path.setAttribute("stroke-width", this.gap)
    path.setAttribute("d", `M${x1} ${y1} L${x2} ${y2}`)
    svg.appendChild(path)
}

Chart.prototype.Plot = function(svg, data, label, value) {
    let x = svg.clientWidth / 2
    let y = svg.clientHeight / 2
    let angles = this.GetAngles(data)

    this.AppendLabel(svg, x, y - this.labelSize / 3, value, this.valueSize, "bold")
    this.AppendLabel(svg, x, y + this.valueSize / 2, label, this.labelSize, "normal")

    for (let i = 0; i < angles.length; i++)
        this.MakeSegment(svg, x, y, i > 0 ? angles[i - 1] : 0, angles[i], data[i].color)

    for (let i = 0; i < angles.length; i++)
        if (data[i].value > 0)
            this.MakeDivider(svg, x, y, i > 0 ? angles[i - 1] : 0, angles[i])
}
