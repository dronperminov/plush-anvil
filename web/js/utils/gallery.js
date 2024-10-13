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

        imageBlock.addEventListener("mousedown", (e) => this.MouseDownImageView(this.GetMousePoint(e, false)))
        imageBlock.addEventListener("mousemove", (e) => this.MouseMoveImageView(this.GetMousePoint(e, true)))
        imageBlock.addEventListener("mouseup", (e) => this.MouseUpImageView())
        imageBlock.addEventListener("mouseleave", (e) => this.MouseUpImageView())

        imageBlock.addEventListener("touchstart", (e) => this.MouseDownImageView(this.GetMousePoint(e, false)))
        imageBlock.addEventListener("touchmove", (e) => this.MouseMoveImageView(this.GetMousePoint(e, true)))
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

Gallery.prototype.Prev = function() {
    if (this.showIndex <= 0)
        return

    this.showIndex--
    this.TranslatePhotos(-1)
}

Gallery.prototype.Next = function() {
    if (this.showIndex >= this.photos.length - 1)
        return

    this.showIndex++
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
}

Gallery.prototype.GetMousePoint = function(e, prevent) {
    if (prevent)
        e.preventDefault()

    if (e.touches)
        return {x: e.touches[0].clientX, y: e.touches[0].clientY}

    return {x: e.clientX, y: e.clientY}
}

Gallery.prototype.MouseDownImageView = function(point) {
    this.pressed = true
    this.point = point
    this.swipeOffset = 0
}

Gallery.prototype.MouseMoveImageView = function(point) {
    if (!this.pressed)
        return

    this.swipeOffset += -(point.x - this.point.x) / this.image.parentNode.clientWidth
    this.point = point

    this.TranslatePhotos(this.swipeOffset)
}

Gallery.prototype.MouseUpImageView = function() {
    if (!this.pressed)
        return

    this.pressed = false

    if (this.swipeOffset < -0.25 && this.showIndex > 0)
        this.Prev()
    else if (this.swipeOffset > 0.25 && this.showIndex < this.photos.length - 1)
        this.Next()
    else
        this.TranslatePhotos(0)
}
