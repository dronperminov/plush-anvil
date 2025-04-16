function ImageCropper(input) {
    this.Build()

    this.onselect = null
    this.input = input
    this.input.addEventListener("change", () => this.Load())
}

ImageCropper.prototype.Build = function() {
    let body = document.querySelector("body")
    this.popup = MakeElement("image-cropper-popup", body)

    this.view = MakeElement("image-cropper-view", this.popup)
    this.image = MakeElement("image-cropper-image", this.view, {}, "img")
    this.cropper = MakeElement("image-cropper-cropper", this.view, {}, "svg")
    this.cropperPath = MakeElement("image-cropper-path", this.cropper, {}, "path")

    let buttons = MakeElement("image-cropper-buttons", this.popup)
    let closeButton = MakeArrowLink(buttons, "ОТМЕНИТЬ", "/images/icons/cancel.svg")
    let saveButton = MakeArrowLink(buttons, "СОХРАНИТЬ", "/images/icons/save.svg")

    this.image.addEventListener("load", () => this.Show())
    this.view.addEventListener("wheel", (e) => this.MouseWheel(e))

    this.view.addEventListener("mousedown", (e) => this.MouseDown(e))
    this.view.addEventListener("mousemove", (e) => this.MouseMove(e))
    this.view.addEventListener("mouseup", (e) => this.MouseUp())
    this.view.addEventListener("mouseleave", (e) => this.MouseUp())

    this.view.addEventListener("touchstart", (e) => this.TouchStart(e))
    this.view.addEventListener("touchmove", (e) => this.TouchMove(e))
    this.view.addEventListener("touchend", (e) => this.TouchEnd(e))
    this.view.addEventListener("touchleave", (e) => this.TouchEnd(e))

    closeButton.addEventListener("click", () => this.Close())
    saveButton.addEventListener("click", () => this.onselect([closeButton, saveButton]))
}

ImageCropper.prototype.Load = function() {
    this.file = this.input.files[0]
    this.image.src = URL.createObjectURL(this.file)
}

ImageCropper.prototype.Show = function() {
    let body = document.querySelector("body")
    body.classList.add("no-overflow")

    this.popup.classList.add("image-cropper-showed")

    this.size = Math.min(this.image.clientWidth, this.image.clientHeight)
    this.offsetX = (this.image.clientWidth - this.size) / 2
    this.offsetY = (this.image.clientHeight - this.size) / 2

    this.Update()
}

ImageCropper.prototype.Close = function() {
    let body = document.querySelector("body")
    body.classList.remove("no-overflow")

    this.popup.classList.remove("image-cropper-showed")
    this.image.removeAttribute("src")
    this.input.value = null
}

ImageCropper.prototype.Update = function() {
    this.size = Math.max(50, Math.min(this.size, Math.min(this.image.clientWidth, this.image.clientHeight)))
    this.offsetX = Math.max(0, Math.min(this.image.clientWidth - this.size, this.offsetX))
    this.offsetY = Math.max(0, Math.min(this.image.clientHeight - this.size, this.offsetY))

    let w = this.image.clientWidth
    let h = this.image.clientHeight
    let r = this.size / 2

    this.cropper.setAttribute("viewBox", `0 0 ${w} ${h}`)
    this.cropperPath.setAttribute("d", `M0 0 H${w} V${h} H${-w}z M ${this.offsetX} ${this.offsetY + r} a ${r},${r} 0 1,0 ${2*r},0 a ${r},${r} 0 1,0 ${-2*r},0z`)
}

ImageCropper.prototype.GetData = function() {
    let size = Math.min(this.image.clientWidth, this.image.clientHeight)

    console.log(this.file)
    let data = new FormData()
    data.append("image", this.file)
    data.append("x", this.offsetX / size)
    data.append("y", this.offsetY / size)
    data.append("size", this.size / size)

    return data
}

ImageCropper.prototype.IsInside = function(x, y) {
    let dx = x - (this.offsetX + this.size / 2)
    let dy = y - (this.offsetY + this.size / 2)

    return (dx * dx + dy * dy <= this.size * this.size / 4)
}

ImageCropper.prototype.MouseDown = function(e) {
    e.preventDefault()

    if (!this.IsInside(e.offsetX, e.offsetY))
        return

    this.isPressed = true
    this.pointX = e.offsetX
    this.pointY = e.offsetY

    this.Update()
}

ImageCropper.prototype.MouseMove = function(e) {
    if (!this.isPressed)
        return

    e.preventDefault()

    this.offsetX += e.offsetX - this.pointX
    this.offsetY += e.offsetY - this.pointY
    this.pointX = e.offsetX
    this.pointY = e.offsetY

    this.Update()
}

ImageCropper.prototype.MouseUp = function() {
    this.isPressed = false
}

ImageCropper.prototype.MouseWheel = function(e) {
    let size = Math.min(this.image.clientWidth, this.image.clientHeight)

    this.size -= size * 0.1 * Math.sign(e.deltaY)
    this.offsetX = e.offsetX  - this.size / 2
    this.offsetY = e.offsetY - this.size / 2
    this.Update()
}

ImageCropper.prototype.GetTouchPoint = function(point) {
    let rect = this.image.parentNode.getBoundingClientRect()
    let offsetX = point.clientX - rect.x
    let offsetY = point.clientY - rect.y
    return {offsetX, offsetY}
}

ImageCropper.prototype.TouchStart = function(e) {
    e.preventDefault()

    if (e.touches.length > 1)
        return

    this.isPressed = true

    let point = this.GetTouchPoint(e.touches[0])

    this.offsetX = point.offsetX - this.size / 2
    this.offsetY = point.offsetY - this.size / 2
    this.pointX = point.offsetX
    this.pointY = point.offsetY

    this.Update()
}

ImageCropper.prototype.TouchMove = function(e) {
    if (!this.isPressed)
        return

    e.preventDefault()

    if (e.touches.length > 2)
        return

    let point = this.GetTouchPoint(e.touches[0])

    if (e.touches.length == 2) {
        let point2 = this.GetTouchPoint(e.touches[1])
        this.offsetX = Math.min(point.offsetX, point2.offsetX)
        this.offsetY = Math.min(point.offsetY, point2.offsetY)
        this.size = this.GetDistance({x: point.offsetX, y: point.offsetY}, {x: point2.offsetX, y: point2.offsetY})
    }
    else {
        this.offsetX += point.offsetX - this.pointX
        this.offsetY += point.offsetY - this.pointY
        this.pointX = point.offsetX
        this.pointY = point.offsetY
    }

    this.Update()
}

ImageCropper.prototype.TouchEnd = function(e) {
    if (e.touches.length === 0)
        this.isPressed = false
}

ImageCropper.prototype.GetDistance = function(p1, p2) {
    let dx = p2.x - p1.x
    let dy = p2.y - p1.y
    return Math.sqrt(dx*dx + dy*dy)
}
