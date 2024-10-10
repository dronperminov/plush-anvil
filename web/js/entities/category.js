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
}

Category.prototype.ToRus = function() {
    return this.value2rus[this.value]
}
