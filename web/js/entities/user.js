function User(user) {
    this.username = user.username
    this.fullname = user.full_name
    this.avatarUrl = user.avatar_url
    this.birthDate = user.birth_date
}

User.prototype.BuildProfile = function(parent, days) {
    let profileImage = MakeElement("profile-image", parent)
    let image = MakeElement("", profileImage, {src: this.avatarUrl}, "img")

    let profileName = MakeElement("profile-name", parent)
    let name = MakeElement("basic-input text-input", profileName, {type: "text", id: "full-name", value: this.fullname}, "input")

    let profileBirthday = MakeElement("profile-birthday", parent)
    MakeElement("", profileBirthday, {src: "/images/icons/birthday.svg"}, "img")

    if (this.birthDate !== null) {
        let months = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"]
        let day = `${this.birthDate.day}`.padStart(2, "0")
        MakeElement("", profileBirthday, {innerText: ` ${day} ${months[this.birthDate.month - 1]}`}, "span")
    }
    else {
        MakeElement("", profileBirthday, {innerText: "не указан"}, "span")
    }

    name.addEventListener("change", () => this.ChangeFullName(name))
    name.addEventListener("focus", () => {
        name.classList.remove("text-input")
    })

    name.addEventListener("blur", () => {
        if (name.value.trim() === "") {
            name.value = this.fullname
            name.classList.remove("error-input")
        }

        name.classList.add("text-input")
    })

    return profile
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
        let label = paidInfo.paid_type == "stickers" ? "stickers" : (paidInfo.extra ? "extra" : "")

        MakeElement("user-sticker-date", stickersBlock, {innerText: FormatDatetime(new Date(paidInfo.date))})
        let status = MakeElement("user-sticker-type", stickersBlock)
        MakeElement(`user-sticker-type-icon user-sticker-type-icon-${label}`, status)
        MakeElement("user-sticker-type-text", status, {innerText: this.GetStickerPaidType(paidInfo)})
    }

    return info
}

User.prototype.BuildAchievements = function(achievements) {
    let user = MakeElement("user user-menu")

    let userAvatar = MakeElement("user-avatar", user)
    let userAvatarLink = MakeElement("", userAvatar, {href: `/profile?username=${this.username}`}, "a")
    MakeElement("", userAvatarLink, {src: this.avatarUrl}, "img")

    let userInfo = MakeElement("user-info", user)
    let userName = MakeElement("user-name", userInfo)
    MakeElement("link", userName, {href: `/profile?username=${this.username}`, innerText: this.fullname}, "a")
    MakeElement("user-birthday", userInfo, {innerText: this.GetAchievementsCountText(achievements)})

    let userMenu = MakeElement("place-menu", user)
    let verticalHam = MakeElement("vertical-ham", userMenu, {innerHTML: "<div></div><div></div><div></div>"})
    verticalHam.addEventListener("click", () => infos.Show(`user-${this.username}-info`))

    return user
}

User.prototype.BuildAchievementsInfo = function(achievements) {
    let info = MakeElement("info", null, {id: `user-${this.username}-info`})

    let avatar = MakeElement("user-avatar", info)
    let avatarLink = MakeElement("", avatar, {href: `/profile?username=${this.username}`}, "a")
    MakeElement("", avatarLink, {src: this.avatarUrl}, "img")

    let name = MakeElement("user-name", info)
    MakeElement("link", name, {href: `/profile?username=${this.username}`, innerText: this.fullname}, "a")

    MakeElement("user-achievements-info", info, {innerText: this.GetAchievementsCountText(achievements)})

    let achievementsBlock = MakeElement("user-achievements", info)

    let header = MakeElement("user-achievement user-achievement-header", achievementsBlock)
    MakeElement("user-achievement-date", header, {innerText: "Дата"})
    MakeElement("user-achievement-title", header, {innerText: "Достижение"})

    for (let achievement of achievements) {
        let type = new HandleAchievementType(achievement.achievement_type)

        let achievementBlock = MakeElement("user-achievement", achievementsBlock)
        MakeElement("user-achievement-date", achievementBlock, {innerText: FormatDatetime(new Date(achievement.date))})
        MakeElement("user-achievement-title", achievementBlock, {innerText: type.ToTitle()})
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

User.prototype.GetAchievementsCountText = function(achievements) {
    return GetWordForm(achievements.length, ["достижение", "достижения", "достижений"])
}

User.prototype.GetStickerPaidType = function(paidInfo) {
    if (paidInfo.extra)
        return "доп. наклейка"

    let paidType = new PaidType(paidInfo.paid_type)
    return paidType.ToRus()
}

User.prototype.ChangeFullName = function(input) {
    let fullname = GetTextInput("full-name", "Имя пользователя не указано")
    if (fullname === null)
        return

    SendRequest("/change-full-name", {full_name: fullname}).then(response => {
        if (response.status != SUCCESS_STATUS) {
            ShowNotification(`Не удалось обновить имя<br><b>Причина</b>: ${response.message}`)
            input.value = this.fullname
            return
        }

        ShowNotification("Имя успешно обновлено", "success-notification")
        this.fullname = fullname
        input.blur()
    })
}
