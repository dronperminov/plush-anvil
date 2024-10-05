function Achievement(achievement) {
    this.title = achievement.title
    this.description = achievement.description
    this.count = achievement.count
    this.firstDate = achievement.first_date
    this.labelDate = achievement.label_date
    this.imageUrl = achievement.image_url
}

Achievement.prototype.Build = function() {
    let achievement = MakeElement("achievement", null, {style: `background-image: url(${this.imageUrl})`})

    if (this.count == 0)
        achievement.classList.add("achievement-locked")

    MakeElement("achievement-count", achievement, {innerText: this.count > 0 ? this.count : ""})
    MakeElement("achievement-title", achievement, {innerText: this.title})
    MakeElement("achievement-description", achievement, {innerText: this.description})

    let date = MakeElement("achievement-date", achievement)
    MakeElement("achievement-date-icon", date, {src: "/images/icons/" + (this.count > 0 ? "calendar.svg" : "close.svg")}, "img")
    MakeElement("achievement-date-icon", date, {innerText: this.GetDateText()})

    console.log(this)

    return achievement
}

Achievement.prototype.GetDateText = function() {
    if (this.count > 0)
        return `получено ${this.labelDate}`

    let text = "пока не открыто"

    if (this.labelDate)
        text += `(${this.labelDate})`

    return text
}
