function Category(value) {
    this.value = value
    this.value2rus = {
        "movies": "КМС",
        "media-mix": "медиа-микс",
        "guess-the-melody": "УМ",
        "karaoke": "караоке",
        "music": "музыка",
        "harry-potter": "ГП",
        "about-everything": "обо всём",
        "video-games": "видеоигры",
        "soviet": "советское",
        "other": "прочее"
    }

    this.value2color = {
        "movies": "#fddc81",
        "media-mix": "#ffa1a6",
        "guess-the-melody": "#a1ffdc",
        "karaoke": "#9cc2ff",
        "music": "#caffa1",
        "harry-potter": "#b0a1ff",
        "about-everything": "#ee9ddc",
        "video-games": "#f9ffa1",
        "soviet": "#81eaff",
        "other": "#dbdbdb"
    }
}

Category.prototype.ToRus = function() {
    return this.value2rus[this.value]
}

Category.prototype.ToColor = function() {
    return this.value2color[this.value]
}

Category.prototype.Build = function(parent) {
    MakeElement("circle", parent, {style: `background-color: ${this.value2color[this.value]}`}, "span")
    MakeElement("", parent, {innerText: ` ${this.ToRus()}`}, "span")
}
