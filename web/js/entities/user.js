function User(user) {
    this.username = user.username
    this.fullname = user.full_name
    this.avatarUrl = user.avatar_url
    this.birthDate = user.birth_date
}

User.prototype.BuildBirthday = function(days) {
    let user = MakeElement("user")

    let userAvatar = MakeElement("user-avatar", user)
    let userAvatarLink = MakeElement("", userAvatar, {href: `/profile?username=${this.username}`}, "a")
    MakeElement("", userAvatarLink, {src: this.avatarUrl}, "img")

    let userInfo = MakeElement("user-info", user)
    let userName = MakeElement("user-name", userInfo)
    MakeElement("link", userName, {href: `/profile?username=${this.username}`, innerText: this.fullname}, "a")

    let text = `${this.GetBirthDateText()} (через ${GetWordForm(days, ["день", "дня", "дней"])})`
    MakeElement("user-birthday", userInfo, {innerText: text})

    return user
}

User.prototype.GetBirthDateText = function() {
    let months = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"]
    return `${this.birthDate.day} ${months[this.birthDate.month - 1]}`
}
