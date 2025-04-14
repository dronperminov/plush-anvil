const GALLERY_VIEW_MODE = "view"
const GALLERY_MARKUP_MODE = "markup"

function Gallery(users) {
    this.Build()

    this.point = null
    this.swipeOffset = 0
    this.padding = 1
    this.mode = GALLERY_VIEW_MODE
    this.markup = new Markup(this.image, users)

    this.ResetScale()
    this.Clear()
}

Gallery.prototype.Build = function() {
    let body = document.querySelector("body")

    this.gallery = MakeElement("gallery", body)
    let view = MakeElement("gallery-view", this.gallery)

    this.BuildTopControls(view)
    this.BuildImageView(view)
    this.BuildBottomControls(view)

    window.addEventListener("resize", () => this.UpdateScale())
    document.addEventListener("keydown", (e) => this.KeyDown(e))
}

Gallery.prototype.BuildTopControls = function(view) {
    let controls = MakeElement("gallery-top-controls", view)
    let leftControls = MakeElement("gallery-top-controls-left", controls)

    let downloadIcon = MakeElement("gallery-icon", leftControls, {src: "/images/icons/gallery/download.svg", title: "Скачать"}, "img")
    this.downloadLink = MakeElement("", null, {download: ""}, "a")
    downloadIcon.addEventListener("click", () => this.Download())

    this.markupIcon = MakeElement("gallery-icon markup-icon admin-block", leftControls, {src: "/images/icons/gallery/markup.svg", title: "Отметить пользователя"}, "img")
    this.markupIcon.addEventListener("click", () => this.ToggleMarkupMode())

    let infoIcon = MakeElement("gallery-icon", leftControls, {src: "/images/icons/gallery/info.svg", title: "Информация"}, "img")
    infoIcon.addEventListener("click", () => this.ShowInfo())

    let closeIcon = MakeElement("gallery-icon", controls, {src: "/images/icons/gallery/close.svg", title: "Закрыть"}, "img")
    closeIcon.addEventListener("click", () => this.Close())
}

Gallery.prototype.BuildImageView = function(view) {
    this.imageView = MakeElement("gallery-image-view", view)

    this.leftImage = this.BuildImage()
    this.image = this.BuildImage(true)
    this.rightImage = this.BuildImage()

    let prev = MakeElement("gallery-icon gallery-prev-icon", this.imageView, {src: "/images/icons/gallery/arrow-left.svg"}, "img")
    let next = MakeElement("gallery-icon gallery-next-icon", this.imageView, {src: "/images/icons/gallery/arrow-right.svg"}, "img")

    prev.addEventListener("click", () => this.Prev())
    next.addEventListener("click", () => this.Next())
}

Gallery.prototype.BuildImage = function(addEvent = false) {
    let imageBlock = MakeElement("gallery-image", this.imageView)
    let image = MakeElement("", imageBlock, {}, "img")
    let loader = MakeElement("gallery-image-loader", imageBlock)
    MakeElement("", loader, {"src": "/images/loader.svg"}, "img")

    image.addEventListener("load", () => loader.classList.add("gallery-image-loader-hidden"))

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

        image.addEventListener("load", () => this.markup.Show(this.photos[this.showIndex].photoId))
    }

    return image
}

Gallery.prototype.BuildBottomControls = function(view) {
    let controls = MakeElement("gallery-bottom-controls", view)

    this.albumLink = MakeElement("arrow-link", controls, {target: "_blank"}, "a")
    MakeElement("text", this.albumLink, {innerText: "ПЕРЕЙТИ В АЛЬБОМ"})
    let arrow = MakeElement("arrow", this.albumLink, {})
    MakeElement("", arrow, {src: "/images/icons/arrow-right.svg"}, "img")
}

Gallery.prototype.Show = function() {
    if (this.photos.length == 0)
        return

    this.SetPhoto(this.image, this.showIndex)
    this.SetPhoto(this.leftImage, this.showIndex - 1)
    this.SetPhoto(this.rightImage, this.showIndex + 1)

    this.albumLink.setAttribute("href", `/albums/${this.photos[this.showIndex].albumId}`)
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

    if (this.mode != GALLERY_VIEW_MODE)
        this.ToggleMarkupMode()

    this.markup.Reset()
    this.ResetScale()
}

Gallery.prototype.ShowInfo = function() {
    if (this.showIndex < 0 || this.showIndex >= this.photos.length)
        return

    let info = [
        `<b>Альбом</b>: ${this.photos[this.showIndex].title}`,
        `<b>Размер изображения</b>: ${this.image.naturalWidth}x${this.image.naturalHeight}`
    ]

    ShowNotification(info.join("<br>"), "info-notification", 2500)
}

Gallery.prototype.AddPhoto = function(photo, markup) {
    this.photoId2index[photo.photoId] = this.photos.length
    this.photos.push(photo)
    this.markup.Add(photo.photoId, markup)
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
    this.markup.Clear()
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
    this.markup.UpdateScale(this.offsetX, this.offsetY, this.scale)
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

Gallery.prototype.Download = function() {
    if (!this.image.hasAttribute("src"))
        return

    this.downloadLink.setAttribute("href", this.image.getAttribute("src"))
    this.downloadLink.click()
}

Gallery.prototype.SetPhoto = function(image, index) {
    image.parentNode.classList.remove("gallery-image-animated")
    image.parentNode.removeAttribute("style")

    if (index < 0 || index >= this.photos.length) {
        image.removeAttribute("src")
        return
    }

    if (image.getAttribute("src") === this.photos[index].url)
        return

    let needLoader = true

    if (image === this.image)
        needLoader = !this.CheckLoader(this.leftImage, this.photos[index].url) && !this.CheckLoader(this.rightImage, this.photos[index].url)

    if (needLoader) {
        let loader = image.parentNode.querySelector(".gallery-image-loader")
        loader.classList.remove("gallery-image-loader-hidden")
    }

    image.setAttribute("src", this.photos[index].url)
}

Gallery.prototype.CheckLoader = function(image, url) {
    let loader = image.parentNode.querySelector(".gallery-image-loader")
    return loader.classList.contains("gallery-image-loader-hidden") && url === image.getAttribute("src")
}

Gallery.prototype.TranslatePhotos = function(dx) {
    let offset = -(dx + 1) * 100

    for (let image of [this.leftImage, this.image, this.rightImage]) {
        if (dx === -1 || dx === 0 || dx === 1)
            image.parentNode.classList.add("gallery-image-animated")

        image.parentNode.setAttribute("style", `transform: translateX(${offset}%)`)
    }

    if (dx === -1 || dx === 1)
        this.markup.Reset()

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

Gallery.prototype.GetRelativePoint = function(e, prevent) {
    let point = this.GetMousePoint(e, prevent)

    let cx = this.image.offsetLeft + this.image.clientWidth / 2
    let cy = this.image.offsetTop + this.image.clientHeight / 2

    let x = 0.5 + (point.x - cx - this.offsetX) / (this.image.clientWidth * this.scale)
    let y = 0.5 + (point.y - cy - this.offsetY) / (this.image.clientHeight * this.scale)
    return {x, y}
}

Gallery.prototype.IsPitch = function(e) {
    return e.touches && e.touches.length > 1
}

Gallery.prototype.MouseDownImageView = function(e) {
    if (!this.IsValidEvent(e))
        return

    if (this.mode == GALLERY_MARKUP_MODE && !this.IsPitch(e)) {
        this.markup.MouseDown(this.GetRelativePoint(e, false))
        return
    }

    this.point = this.GetMousePoint(e, false)

    if (this.mode == GALLERY_VIEW_MODE) {
        this.swipeOffset = 0
    }
}

Gallery.prototype.MouseMoveImageView = function(e) {
    if (!this.IsValidEvent(e))
        return

    if (this.mode == GALLERY_MARKUP_MODE && !this.IsPitch(e)) {
        this.markup.MouseMove(this.GetRelativePoint(e, true))
        return
    }

    if (this.point === null)
        return

    let point = this.GetMousePoint(e, true)

    if (e.touches && e.touches.length == 2) {
        this.ZoomOnPitch(point)
    }
    else if (this.mode == GALLERY_VIEW_MODE) {
        if (this.scale === 1) {
            this.Swipe(point)
        }
        else {
            this.Move(point)
        }
    }

    this.point = point
}

Gallery.prototype.MouseUpImageView = function() {
    if (this.mode == GALLERY_MARKUP_MODE) {
        this.markup.MouseUp()
        return
    }

    if (this.point === null)
        return

    this.point = null

    if (this.mode == GALLERY_VIEW_MODE) {
        if (this.scale === 1)
            this.SwipeEnd()
    }
}

Gallery.prototype.KeyDown = function(e) {
    if (!this.gallery.classList.contains("gallery-open"))
        return

    if (e.code == "Escape") {
        e.preventDefault()
        this.Close()
        return
    }

    if (this.mode != GALLERY_VIEW_MODE)
        return

    if (e.code == "ArrowLeft") {
        e.preventDefault()
        this.Prev()
    }
    else if (e.code == "ArrowRight") {
        e.preventDefault()
        this.Next()
    }
    else if (e.code == "KeyS" && e.ctrlKey) {
        e.preventDefault()
        this.Download()
    }
}

Gallery.prototype.ZoomOnPitch = function(point) {
    let prev = this.GetCenter(this.point.p1, this.point.p2)
    let p = this.GetCenter(point.p1, point.p2)
    let scale = this.GetDistance(point.p1, point.p2) / this.GetDistance(this.point.p1, this.point.p2)

    this.ScaleAt(p, this.scale * scale)

    this.offsetX += p.x - prev.x
    this.offsetY += p.y - prev.y
    this.UpdateScale()
}

Gallery.prototype.Move = function(point) {
    this.offsetX += point.x - this.point.x
    this.offsetY += point.y - this.point.y
    this.UpdateScale()
}

Gallery.prototype.Swipe = function(point) {
    this.swipeOffset -= (point.x - this.point.x) / this.image.parentNode.clientWidth
    this.TranslatePhotos(this.swipeOffset)
}

Gallery.prototype.SwipeEnd = function() {
    if (this.swipeOffset < -0.25 && this.showIndex > 0) {
        this.Prev()
    }
    else if (this.swipeOffset > 0.25 && this.showIndex < this.photos.length - 1) {
        this.Next()
    }
    else {
        this.TranslatePhotos(0)
    }
}

Gallery.prototype.MouseWheelImageView = function(e) {
    if (!this.IsValidEvent(e))
        return

    let point = this.GetMousePoint(e, true)
    let scale = this.scale * Math.pow(1.25, -Math.sign(e.deltaY))

    this.ScaleAt(point, scale)
    this.UpdateScale()
}

Gallery.prototype.IsValidEvent = function(e) {
    for (let node = e.target; node != this.image.parentNode; node = node.parentNode)
        if (node.classList.contains("markup-users") || node.classList.contains("markup-icon"))
            return false

    return true
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

Gallery.prototype.ToggleMarkupMode = function() {
    this.markupIcon.classList.toggle("gallery-icon-pressed")

    if (this.mode == GALLERY_VIEW_MODE) {
        this.mode = GALLERY_MARKUP_MODE
        this.image.parentNode.classList.add("markup-mode")
        return
    }

    this.mode = GALLERY_VIEW_MODE
    this.image.parentNode.classList.remove("markup-mode")
    this.markup.EndEdit()
}
