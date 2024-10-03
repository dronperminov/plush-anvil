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
    MakeElement("user-birthday", userInfo, {innerText: this.GetBirthDateText(days)})

    return user
}

User.prototype.BuildSticker = function(stickers) {
    let user = MakeElement("user user-menu")

    let userAvatar = MakeElement("user-avatar", user)
    let userAvatarLink = MakeElement("", userAvatar, {href: `/profile?username=${this.username}`}, "a")
    MakeElement("", userAvatarLink, {src: this.avatarUrl}, "img")

    let userInfo = MakeElement("user-info", user)
    let userName = MakeElement("user-name", userInfo)
    MakeElement("link", userName, {href: `/profile?username=${this.username}`, innerText: this.fullname}, "a")
    MakeElement("user-birthday", userInfo, {innerText: this.GetStickersCountText(stickers)})

    let userMenu = MakeElement("place-menu", user)
    let verticalHam = MakeElement("vertical-ham", userMenu, {innerHTML: "<div></div><div></div><div></div>"})
    verticalHam.addEventListener("click", () => infos.Show(`user-${this.username}-info`))

    return user
}

User.prototype.BuildStickerInfo = function(stickers) {
    let info = MakeElement("info", null, {id: `user-${this.username}-info`})

    let avatar = MakeElement("user-avatar", info)
    let avatarLink = MakeElement("", avatar, {href: `/profile?username=${this.username}`}, "a")
    MakeElement("", avatarLink, {src: this.avatarUrl}, "img")

    let name = MakeElement("user-name", info)
    MakeElement("link", name, {href: `/profile?username=${this.username}`, innerText: this.fullname}, "a")

    MakeElement("user-stickers-info", info, {innerText: this.GetStickersCountText(stickers)})

    let stickersBlock = MakeElement("user-stickers", info)

    MakeElement("user-sticker-date user-sticker-header", stickersBlock, {innerText: "Дата"})
    MakeElement("user-sticker-type user-sticker-header", stickersBlock, {innerText: "Статус"})

    for (let paidInfo of stickers.paid_infos) {
        let paidType = new PaidType(paidInfo.paid_type)
        let label = paidType.value == "stickers" ? "stickers" : (paidInfo.extra ? "extra" : "")

        MakeElement("user-sticker-date", stickersBlock, {innerText: FormatDatetime(new Date(paidInfo.date))})
        let status = MakeElement("user-sticker-type", stickersBlock)
        MakeElement(`user-sticker-type-icon user-sticker-type-icon-${label}`, status)
        MakeElement("user-sticker-type-text", status, {innerText: paidType.ToRus()})
    }

    return info
}

User.prototype.GetBirthDateText = function(days) {
    let months = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"]
    let date = `${this.birthDate.day} ${months[this.birthDate.month - 1]}`

    if (days > 1)
        date += ` (через ${GetWordForm(days, ["день", "дня", "дней"])})`
    else if (days == 1)
        date += " (завтра)"
    else if (days == 0)
        date += " (сегодня)"

    return date
}

User.prototype.GetStickersCountText = function(stickers) {
    return GetWordForm(stickers.games, ["наклейка", "наклейки", "наклеек"])
}
