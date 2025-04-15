function Markup(image, users) {
    this.image = image
    this.block = image.parentNode
    this.username2user = {}
    this.markup = null

    this.usersView = MakeElement("markup-users markup-hidden", this.block)
    this.userSelect = new UserSelect(users, {multiple: false})
    this.userSelect.Build(this.usersView)
    this.userSelect.onchange = () => this.AddMarkup()

    for (let user of users)
        this.username2user[user.username] = user

    this.Clear()
}

Markup.prototype.Add = function(photoId, markup) {
    this.photoId2markup[photoId] = markup
}

Markup.prototype.Clear = function() {
    this.photoId2markup = {}
    this.photoId = null
    this.Reset()
}

Markup.prototype.BuildMarkup = function(markup) {
    markup.block = MakeElement("markup", this.block)

    if (markup.username !== null) {
        markup.block.classList.add("markup-finished")
        MakeElement("markup-name", markup.block, {innerText: `${this.username2user[markup.username].fullname}`})

        let icon = MakeElement("markup-icon", markup.block, {src: "/images/icons/gallery/close.svg"}, "img")
        icon.addEventListener("click", () => this.RemoveMarkup(markup))
    }
    else {
        markup.block.classList.add("markup-editing")
    }

    this.UpdateMarkup(markup)
    return markup
}

Markup.prototype.Reset = function() {
    this.EndEdit()

    for (let markup of this.block.querySelectorAll(".markup"))
        markup.remove()
}

Markup.prototype.EndEdit = function() {
    if (this.markup !== null) {
        this.markup.block.remove()
        this.markup = null
    }

    this.usersView.classList.add("markup-hidden")
    this.block.style.cursor = "default"
    this.userSelect.Clear()
}

Markup.prototype.Show = function(photoId) {
    this.photoId = photoId

    if (!(photoId in this.photoId2markup) || this.photoId2markup[photoId].length === 0)
        return

    for (let markup of this.photoId2markup[this.photoId])
        this.BuildMarkup(markup)
}

Markup.prototype.UpdateScale = function(offsetX, offsetY, scale) {
    this.offsetX = offsetX
    this.offsetY = offsetY
    this.scale = scale

    this.Update()
}

Markup.prototype.Update = function() {
    if (this.photoId === null)
        return

    for (let markup of this.photoId2markup[this.photoId])
        this.UpdateMarkup(markup)

    if (this.markup === null)
        return

    this.UpdateMarkup(this.markup)
    this.UpdateUserSelect()
}

Markup.prototype.UpdateMarkup = function(markup) {
    let cx = this.image.offsetLeft + this.image.clientWidth / 2
    let cy = this.image.offsetTop + this.image.clientHeight / 2

    let ox = this.image.offsetLeft + markup.x * this.image.clientWidth
    let oy = this.image.offsetTop + markup.y * this.image.clientHeight

    let x = this.offsetX + (ox - cx) * this.scale + cx
    let y = this.offsetY + (oy - cy) * this.scale + cy
    let width = markup.width * this.image.clientWidth * this.scale
    let height = markup.height * this.image.clientHeight * this.scale

    markup.offsetLeft = x
    markup.offsetTop = y
    markup.clientWidth = width
    markup.clientHeight = height
    markup.block.setAttribute("style", `left: ${x}px; top: ${y}px; width: ${width}px; height: ${height}px;`)
}

Markup.prototype.MouseDown = function(point) {
    this.pressed = true
    this.point = point
    this.usersView.classList.add("markup-hidden")

    if (this.markup !== null && !this.IsInside(point, this.markup)) {
        this.EndEdit()
    }

    if (point.x < 0 || point.x > 1 || point.y < 0 || point.y > 1)
        return

    if (this.markup === null) {
        this.markup = this.BuildMarkup({x: point.x, y: point.y, width: 0, height: 0, username: null, mode: "default"})
        return
    }

    let cursor = this.GetCursor(point)
    this.block.style.cursor = cursor
    this.markup.mode = cursor
}

Markup.prototype.MouseMove = function(point) {
    if (!this.pressed || this.markup === null) {
        this.block.style.cursor = this.GetCursor(point)
        return
    }

    if (this.markup.mode === "default") {
        this.Create(point)
    }
    else if (this.markup.mode == "move") {
        this.Move(point)
    }
    else {
        this.Resize(point)
    }

    this.UpdateMarkup(this.markup)
}

Markup.prototype.MouseUp = function() {
    if (this.markup === null || !this.pressed)
        return

    this.pressed = false

    if (this.markup.width < 0.05 || this.markup.height < 0.05) {
        this.EndEdit()
        return
    }

    this.usersView.classList.remove("markup-hidden")
    this.UpdateUserSelect()
}

Markup.prototype.UpdateUserSelect = function() {
    let x = this.markup.offsetLeft

    if (x + this.usersView.clientWidth > this.block.clientWidth)
        x = this.block.clientWidth - this.usersView.clientWidth
    else if (x < 0)
        x = 0

    let y = this.markup.offsetTop + this.markup.clientHeight

    if (y + this.usersView.clientHeight > this.block.clientHeight)
        y = this.markup.offsetTop - this.usersView.clientHeight
    else if (y < 0)
        y = 0

    this.usersView.setAttribute("style", `left: ${x}px; top: ${y}px;`)
}

Markup.prototype.IsInside = function(point, markup, offset = 20) {
    let dx = offset / this.image.clientWidth / this.scale
    let dy = offset / this.image.clientHeight / this.scale

    let horizontal = markup.x - dx <= point.x && point.x <= markup.x + markup.width + dx
    let vertical = markup.y - dy <= point.y && point.y <= markup.y + markup.height + dy
    return horizontal && vertical
}

Markup.prototype.GetCursor = function(point, offset = 20) {
    if (this.markup === null)
        return "default"

    let offsetX = offset / this.image.clientWidth / this.scale
    let offsetY = offset / this.image.clientHeight / this.scale
    let directions = []

    if (Math.abs(this.markup.y - point.y) < offsetY)
        directions.push("n")

    if (Math.abs(this.markup.y + this.markup.height - point.y) < offsetY)
        directions.push("s")

    if (Math.abs(this.markup.x - point.x) < offsetX)
        directions.push("w")

    if (Math.abs(this.markup.x + this.markup.width - point.x) < offsetX)
        directions.push("e")

    if (directions.length > 0)
        return `${directions.join("")}-resize`

    if (this.IsInside(point, this.markup))
        return "move"

    return "default"
}

Markup.prototype.Create = function(point) {
    this.markup.x = Math.min(point.x, this.point.x)
    this.markup.y = Math.min(point.y, this.point.y)
    this.markup.width = Math.abs(point.x - this.point.x)
    this.markup.height = Math.abs(point.y - this.point.y)
}

Markup.prototype.Move = function(point) {
    this.markup.x = Math.max(0, Math.min(1 - this.markup.width, this.markup.x + point.x - this.point.x))
    this.markup.y = Math.max(0, Math.min(1 - this.markup.height, this.markup.y + point.y - this.point.y))
    this.point = point
}

Markup.prototype.Resize = function(point) {
    let dx = point.x - this.point.x
    let dy = point.y - this.point.y

    if (this.markup.mode == "nw-resize" || this.markup.mode == "sw-resize" || this.markup.mode == "w-resize") {
        dx = Math.max(-this.markup.x, Math.min(this.markup.width, dx))
        this.markup.x += dx
        this.markup.width -= dx
    }

    if (this.markup.mode == "ne-resize" || this.markup.mode == "se-resize" || this.markup.mode == "e-resize") {
        dx = Math.max(-this.markup.width, Math.min(1 - this.markup.x - this.markup.width, dx))
        this.markup.width += dx
    }

    if (this.markup.mode == "nw-resize" || this.markup.mode == "ne-resize" || this.markup.mode == "n-resize") {
        dy = Math.max(-this.markup.y, Math.min(this.markup.height, dy))
        this.markup.y += dy
        this.markup.height -= dy
    }

    if (this.markup.mode == "sw-resize" || this.markup.mode == "se-resize" || this.markup.mode == "s-resize") {
        dy = Math.max(-this.markup.height, Math.min(1 - this.markup.y - this.markup.height, dy))
        this.markup.height += dy
    }

    this.point.x += dx
    this.point.y += dy
}

Markup.prototype.AddMarkup = function() {
    if (this.markup === null)
        return

    let username = this.userSelect.GetSelected()[0]

    SendRequest("/add-markup", {markup_id: -1, photo_id: this.photoId, x: this.markup.x, y: this.markup.y, width: this.markup.width, height: this.markup.height, username: username}).then(response => {
        if (response.status != SUCCESS_STATUS) {
            this.userSelect.Clear()
            ShowNotification(`Не удалось отметить пользователя<br><b>Причина</b>: ${response.message}`)
            return
        }

        this.EndEdit()
        this.photoId2markup[this.photoId].push(this.BuildMarkup(response.markup))
    })
}

Markup.prototype.RemoveMarkup = function(markup) {
    this.EndEdit()

    SendRequest("/remove-markup", {markup_id: markup.markup_id}).then(response => {
        if (response.status != SUCCESS_STATUS) {
            ShowNotification(`Не удалось удалить отметку пользователя<br><b>Причина</b>: ${response.message}`)
            return
        }

        this.photoId2markup[this.photoId].splice(this.photoId2markup[this.photoId].indexOf(markup), 1)
        markup.block.remove()
    })
}
