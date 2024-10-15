function Markup(image, users) {
    this.image = image
    this.block = image.parentNode
    this.username2user = {}

    for (let user of users)
        this.username2user[user.username] = user

    this.Clear()
}

Markup.prototype.Add = function(photoId, markup) {
    this.photoId2markup[photoId] = markup
}

Markup.prototype.Clear = function() {
    this.photoId2markup = {}
    this.markup = null
}

Markup.prototype.BuildMarkup = function(markup) {
    let block = MakeElement("markup markup-finished", this.block)
    MakeElement("markup-name", block, {innerText: `${this.username2user[markup.username].fullname}`})
    return block
}

Markup.prototype.Reset = function() {
    for (let markup of this.block.querySelectorAll(".markup"))
        markup.remove()
}

Markup.prototype.Show = function(photoId) {
    if (!(photoId in this.photoId2markup) || this.photoId2markup[photoId].length === 0) {
        this.markup = null
        return
    }

    this.markup = this.photoId2markup[photoId]

    for (let markup of this.markup)
        markup.block = this.BuildMarkup(markup)

    this.Update()
}

Markup.prototype.Update = function(offsetX = 0, offsetY = 0, scale = 1) {
    if (this.markup === null)
        return

    for (let markup of this.markup) {
        let cx = this.image.offsetLeft + this.image.clientWidth / 2
        let cy = this.image.offsetTop + this.image.clientHeight / 2

        let ox = this.image.offsetLeft + markup.x * this.image.clientWidth
        let oy = this.image.offsetTop + markup.y * this.image.clientHeight

        let x = offsetX + (ox - cx) * scale + cx
        let y = offsetY + (oy - cy) * scale + cy
        let width = markup.width * this.image.clientWidth * scale
        let height = markup.height * this.image.clientHeight * scale

        markup.block.setAttribute("style", `left: ${x}px; top: ${y}px; width: ${width}px; height: ${height}px;`)
    }
}

Markup.prototype.MouseDown = function(point) {

}

Markup.prototype.MouseMove = function(point) {

}

Markup.prototype.MouseUp = function(point) {

}
