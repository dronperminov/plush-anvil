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
        "movies": "#ec6b56",
        "media-mix": "#b347a4",
        "guess-the-melody": "#ffc154",
        "karaoke": "#6347b3",
        "music": "#47b39c",
        "harry-potter": "#478bb3",
        "about-everything": "#8bc34a",
        "video-games": "#ff5471",
        "soviet": "#00bcd4",
        "other": "#cccccc"
    }
}

Category.prototype.ToRus = function() {
    return this.value2rus[this.value]
}

Category.prototype.Build = function(parent) {
    MakeElement("circle", parent, {style: `background-color: ${this.value2color[this.value]}`}, "span")
    MakeElement("", parent, {innerText: ` ${this.ToRus()}`}, "span")
}
