function ColorInput(parent, color, onchange = null) {
    this.onchange = onchange
    this.colors = this.GetInitialColors(10)
    this.color = color === "" ? this.colors[0] : color

    this.Build(parent)
    this.SetColor(this.color)
}

ColorInput.prototype.GetColor = function() {
    return this.color
}

ColorInput.prototype.SetColor = function(color, change = false) {
    this.color = color
    this.value.setAttribute("style", `background-color: ${this.color}`)
    this.text.innerText = this.color

    if (change && this.onchange !== null)
        this.onchange()
}

ColorInput.prototype.GetInitialColors = function(count) {
    let colors = []

    for (let i = 0; i < count; i++)
        colors.push(this.HSLtoHEX(i / count, 0.69, 0.77))

    for (let i = 0; i < count; i++)
        colors.push(this.HSLtoHEX(i / count, 1.0, 0.82))

    for (let i = 0; i < count; i++)
        colors.push(this.HSLtoHEX(i / count, 0.97, 0.75))

    colors.push("#000000")
    colors.push("#444444")
    colors.push("#888888")
    colors.push("#bbbbbb")
    colors.push("#ffffff")

    return colors
}

ColorInput.prototype.Build = function(parent) {
    let block = MakeElement("color-input", parent)

    let valueBlock = MakeElement("color-input-value", block)
    this.value = MakeElement("color-value", valueBlock)
    this.text = MakeElement("color-text", valueBlock)

    let inputBlock = MakeElement("color-input-inputs hidden", block)
    let colors = MakeElement("color-input-colors", inputBlock)

    for (let color of this.colors) {
        let colorBlock = MakeElement("color-input-color", colors, {style: `background-color: ${color}`})
        colorBlock.addEventListener("click", () => this.SelectColor(colors, colorBlock, color))

        if (color === this.color)
            colorBlock.classList.add("color-input-selected-color")
    }

    this.value.addEventListener("click", () => inputBlock.classList.toggle("hidden"))
    this.text.addEventListener("click", () => inputBlock.classList.toggle("hidden"))
}

ColorInput.prototype.SelectColor = function(colors, target, color) {
    for (let block of colors.children)
        block.classList.remove("color-input-selected-color")

    this.SetColor(color, true)
    target.classList.add("color-input-selected-color")
}

ColorInput.prototype.HSLtoRGB = function(h, s, l) {
    let r, g, b

    if (s === 0) {
        r = g = b = l
    } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s
        const p = 2 * l - q

        r = this.HueToRGB(p, q, h + 1 / 3)
        g = this.HueToRGB(p, q, h)
        b = this.HueToRGB(p, q, h - 1 / 3)
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

ColorInput.prototype.HSLtoHEX = function(h, s, l) {
    let [r, g, b] = this.HSLtoRGB(h, s, l)
    return this.RGBtoHEX(r, g, b)
}

ColorInput.prototype.HueToRGB = function(p, q, t) {
    if (t < 0)
        t += 1

    if (t > 1)
        t -= 1

    if (t < 1 / 6)
        return p + (q - p) * 6 * t

    if (t < 1 / 2)
        return q

    if (t < 2 / 3)
        return p + (q - p) * (2/3 - t) * 6

    return p;
}

ColorInput.prototype.ByteToHEX = function(value) {
    const hex = "0123456789abcdef"
    value = Math.max(0, Math.min(255, Math.round(value)))

    return `${hex[value >> 4]}${hex[value % 16]}`
}

ColorInput.prototype.RGBtoHEX = function(r, g, b) {
    r = this.ByteToHEX(r)
    g = this.ByteToHEX(g)
    b = this.ByteToHEX(b)
    return `#${r}${g}${b}`
}
