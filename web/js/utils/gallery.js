function Gallery() {
    this.Build()
    this.Clear()
}

Gallery.prototype.Build = function() {
    let body = document.querySelector("body")

    this.gallery = MakeElement("gallery", body)
    let view = MakeElement("gallery-view", this.gallery)

    this.BuildTopControls(view)
    this.BuildImageView(view)
    this.BuildBottomControls(view)

    this.pressed = false
    this.swipeOffset = 0
    this.padding = 1

    this.ResetScale()
}

Gallery.prototype.BuildTopControls = function(view) {
    let controls = MakeElement("gallery-top-controls", view)
    let leftControls = MakeElement("gallery-top-controls-left", controls)

    let downloadIcon = MakeElement("gallery-icon", leftControls, {src: "/images/icons/download.svg", title: "Скачать"}, "img")
    let downloadLink = MakeElement("", null, {download: ""}, "a")
    downloadIcon.addEventListener("click", () => this.Download(downloadLink))

    let closeIcon = MakeElement("gallery-icon", controls, {src: "/images/icons/close.svg", title: "Закрыть"}, "img")
    closeIcon.addEventListener("click", () => this.Close())
}

Gallery.prototype.BuildImageView = function(view) {
    this.imageView = MakeElement("gallery-image-view", view)

    this.leftImage = this.BuildImage()
    this.image = this.BuildImage(true)
    this.rightImage = this.BuildImage()

    let prev = MakeElement("gallery-icon gallery-prev-icon", this.imageView, {src: "/images/icons/arrow-left.svg"}, "img")
    let next = MakeElement("gallery-icon gallery-next-icon", this.imageView, {src: "/images/icons/arrow-right.svg"}, "img")

    prev.addEventListener("click", () => this.Prev())
    next.addEventListener("click", () => this.Next())
}

Gallery.prototype.BuildImage = function(addEvent = false) {
    let imageBlock = MakeElement("gallery-image", this.imageView)

    if (addEvent) {
        imageBlock.addEventListener("transitionend", () => this.Show())

        imageBlock.addEventListener("mousedown", (e) => this.MouseDownImageView(e))
        imageBlock.addEventListener("mousemove", (e) => this.MouseMoveImageView(e))
        imageBlock.addEventListener("mouseup", (e) => this.MouseUpImageView())
        imageBlock.addEventListener("mouseleave", (e) => this.MouseUpImageView())
        imageBlock.addEventListener("wheel", (e) => this.MouseWheelImageView(e))

        imageBlock.addEventListener("touchstart", (e) => this.MouseDownImageView(e))
        imageBlock.addEventListener("touchmove", (e) => this.MouseMoveImageView(e))
        imageBlock.addEventListener("touchend", (e) => this.MouseUpImageView())
        imageBlock.addEventListener("touchleave", (e) => this.MouseUpImageView())
    }

    return MakeElement("", imageBlock, {}, "img")
}

Gallery.prototype.BuildBottomControls = function(view) {
    let controls = MakeElement("gallery-bottom-controls", view)
}

Gallery.prototype.Show = function() {
    if (this.photos.length == 0)
        return

    this.SetPhoto(this.leftImage, this.showIndex - 1)
    this.SetPhoto(this.image, this.showIndex)
    this.SetPhoto(this.rightImage, this.showIndex + 1)
}

Gallery.prototype.Open = function() {
    let body = document.querySelector("body")
    body.classList.add("gallery-no-overflow")
    this.gallery.classList.add("gallery-open")
}

Gallery.prototype.Close = function() {
    let body = document.querySelector("body")
    body.classList.remove("gallery-no-overflow")
    this.gallery.classList.remove("gallery-open")

    for (let image of [this.leftImage, this.image, this.rightImage])
        image.removeAttribute("src")

    this.ResetScale()
}

Gallery.prototype.AddPhoto = function(photoId, photo) {
    this.photoId2index[photoId] = this.photos.length
    this.photos.push(photo)
}

Gallery.prototype.ShowPhoto = function(photoId) {
    this.showIndex = this.photoId2index[photoId]

    this.Show()
    this.Open()
}

Gallery.prototype.Clear = function() {
    this.photos = []
    this.photoId2index = {}
    this.showIndex = 0
}

Gallery.prototype.ResetScale = function() {
    this.offsetX = 0
    this.offsetY = 0
    this.scale = 1

    this.UpdateScale()
}

Gallery.prototype.UpdateScale = function() {
    let rect = this.image.parentNode.getBoundingClientRect()
    let width = this.image.clientWidth * this.scale
    let height = this.image.clientHeight * this.scale

    let x = Math.max(0, (width - rect.width) / 2 + this.padding)
    let y = Math.max(0, (height - rect.height) / 2 + this.padding)

    this.offsetX = Math.max(-x, Math.min(x, this.offsetX))
    this.offsetY = Math.max(-y, Math.min(y, this.offsetY))

    this.image.setAttribute("style", `transform: matrix(${this.scale},0,0,${this.scale},${this.offsetX},${this.offsetY})`)
}

Gallery.prototype.Prev = function() {
    if (this.showIndex <= 0)
        return

    this.showIndex--
    this.ResetScale()
    this.TranslatePhotos(-1)
}

Gallery.prototype.Next = function() {
    if (this.showIndex >= this.photos.length - 1)
        return

    this.showIndex++
    this.ResetScale()
    this.TranslatePhotos(1)
}

Gallery.prototype.Download = function(link) {
    if (!this.image.hasAttribute("src"))
        return

    link.setAttribute("href", this.image.getAttribute("src"))
    link.click()
}

Gallery.prototype.SetPhoto = function(image, index) {
    image.parentNode.classList.remove("gallery-image-animated")
    image.parentNode.removeAttribute("style")

    if (index < 0 || index >= this.photos.length) {
        image.removeAttribute("src")
        return
    }

    image.setAttribute("src", this.photos[index].url)
}

Gallery.prototype.TranslatePhotos = function(dx) {
    let offset = -(dx + 1) * 100

    for (let image of [this.leftImage, this.image, this.rightImage]) {
        if (dx === -1 || dx === 0 || dx === 1)
            image.parentNode.classList.add("gallery-image-animated")

        image.parentNode.setAttribute("style", `transform: translateX(${offset}%)`)
    }

    this.UpdateScale()
}

Gallery.prototype.GetMousePoint = function(e, prevent) {
    if (prevent)
        e.preventDefault()

    let rect = this.imageView.getBoundingClientRect()

    if (!e.touches)
        return {x: e.clientX - rect.left, y: e.clientY - rect.top}

    if (e.touches.length === 1)
        return {x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top}

    return {
        p1: {x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top},
        p2: {x: e.touches[1].clientX - rect.left, y: e.touches[1].clientY - rect.top}
    }
}

Gallery.prototype.MouseDownImageView = function(e) {
    this.pressed = true
    this.point = this.GetMousePoint(e, false)
    this.swipeOffset = 0
}

Gallery.prototype.MouseMoveImageView = function(e) {
    if (!this.pressed)
        return

    let point = this.GetMousePoint(e, true)

    if (e.touches && e.touches.length == 2) {
        let prev = this.GetCenter(this.point.p1, this.point.p2)
        let p = this.GetCenter(point.p1, point.p2)
        let scale = this.GetDistance(point.p1, point.p2) / this.GetDistance(this.point.p1, this.point.p2)

        this.ScaleAt(p, this.scale * scale)

        this.offsetX += p.x - prev.x
        this.offsetY += p.y - prev.y
        this.UpdateScale()
    }
    else if (this.scale !== 1) {
        this.offsetX += point.x - this.point.x
        this.offsetY += point.y - this.point.y
        this.UpdateScale()
    }
    else {
        this.swipeOffset -= (point.x - this.point.x) / this.image.parentNode.clientWidth
        this.TranslatePhotos(this.swipeOffset)
    }

    this.point = point
}

Gallery.prototype.MouseUpImageView = function() {
    if (!this.pressed)
        return

    this.pressed = false

    if (this.scale !== 1)
        return

    if (this.swipeOffset < -0.25 && this.showIndex > 0)
        this.Prev()
    else if (this.swipeOffset > 0.25 && this.showIndex < this.photos.length - 1)
        this.Next()
    else
        this.TranslatePhotos(0)
}

Gallery.prototype.MouseWheelImageView = function(e) {
    let point = this.GetMousePoint(e, true)
    let scale = this.scale * Math.pow(1.25, -Math.sign(e.deltaY))

    this.ScaleAt(point, scale)
    this.UpdateScale()
}

Gallery.prototype.ScaleAt = function(point, scale) {
    scale = Math.max(1, Math.min(32, scale))

    let x = point.x - (this.image.offsetLeft + this.image.clientWidth / 2)
    let y = point.y - (this.image.offsetTop + this.image.clientHeight / 2)
    let scaleDelta = scale / this.scale

    this.scale *= scaleDelta
    this.offsetX = x - (x - this.offsetX) * scaleDelta
    this.offsetY = y - (y - this.offsetY) * scaleDelta
}

Gallery.prototype.GetCenter = function(p1, p2) {
    return {x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2}
}

Gallery.prototype.GetDistance = function(p1, p2) {
    let dx = p1.x - p2.x
    let dy = p1.y - p2.y

    return Math.sqrt(dx*dx + dy*dy)
}
