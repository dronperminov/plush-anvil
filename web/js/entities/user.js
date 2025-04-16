function User(user) {
    this.username = user.username
    this.fullname = user.full_name
    this.avatarUrl = user.avatar_url
    this.birthDate = user.birth_date
}

User.prototype.BuildProfile = function(parent, days, editable = false) {
    let profileImage = MakeElement("profile-image", parent)
    let image = MakeElement("", profileImage, {src: this.avatarUrl}, "img")

    if (editable) {
        let imageInput = MakeElement("", profileImage, {type: "file", accept: "image/*"}, "input")
        let imageCropper = new ImageCropper(imageInput)

        image.addEventListener("click", () => imageInput.click())
        imageCropper.onselect = (buttons) => this.UploadAvatar(imageCropper, imageInput, image, buttons)
    }

    let profileName = MakeElement("profile-name", parent)
    let name = MakeElement("basic-input text-input", profileName, {type: "text", id: "full-name", value: this.fullname}, "input")
    let nameInput = new TextInput(name, {empty: "Имя пользователя не указано"})

    let profileBirthday = MakeElement("profile-birthday", parent)
    MakeElement("", profileBirthday, {src: "/images/icons/birthday.svg"}, "img")

    if (this.birthDate !== null) {
        let months = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"]
        let day = `${this.birthDate.day}`.padStart(2, "0")
        MakeElement("", profileBirthday, {innerText: ` ${day} ${months[this.birthDate.month - 1]}`}, "span")
    }
    else {
        MakeElement("", profileBirthday, {innerText: " не указан"}, "span")
    }

    if (editable) {
        name.addEventListener("change", () => this.ChangeFullName(nameInput))
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
    }
    else {
        name.setAttribute("readonly", "true")
    }

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

User.prototype.BuildTopPlayer = function(params) {
    let user = MakeElement("user")

    let userAvatar = MakeElement("user-avatar", user)
    let userAvatarLink = MakeElement("", userAvatar, {href: `/profile?username=${this.username}`}, "a")
    MakeElement("", userAvatarLink, {src: this.avatarUrl}, "img")

    let userInfo = MakeElement("user-info", user)
    let userName = MakeElement("user-name", userInfo)
    MakeElement("link", userName, {href: `/profile?username=${this.username}`, innerText: this.fullname}, "a")

    MakeElement("user-activity", userInfo, {innerHTML: `<b>Активность</b>: ${this.GetGamesActivityText(params.games, params.score)}`})
    MakeElement("user-categories", userInfo, {innerHTML: `<b>Топ категорий</b>: ${this.GetTopCategoriesText(params.category2count)}`})
    return user
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

User.prototype.GetAchievementsCountText = function(achievements) {
    return GetWordForm(achievements.length, ["достижение", "достижения", "достижений"])
}

User.prototype.ChangeFullName = function(input) {
    let fullname = input.GetValue()
    if (fullname === null)
        return

    SendRequest("/change-full-name", {full_name: fullname}).then(response => {
        if (response.status != SUCCESS_STATUS) {
            ShowNotification(`Не удалось обновить имя<br><b>Причина</b>: ${response.message}`)
            input.SetValue(this.fullname)
            return
        }

        ShowNotification("Имя успешно обновлено", "success-notification")
        this.fullname = fullname
        input.Blur()
    })
}

User.prototype.UploadAvatar = function(cropper, input, image, buttons) {
    input.value = null
    Disable(buttons)

    SendRequest("/change-avatar", cropper.GetData()).then(response => {
        Enable(buttons)

        if (response.status != SUCCESS_STATUS) {
            ShowNotification(`Не удалось обновить изображение профиля<br><b>Причина</b>: ${response.message}`)
            return
        }

        ShowNotification("Изображение профиля успешно обновлено", "success-notification")
        this.avatarUrl = response.avatar_url
        image.src = this.avatarUrl
        document.querySelector(".menu .profile img").src = this.avatarUrl
        cropper.Close()
    })
}

User.prototype.GetGamesActivityText = function(games, score) {
    return `${GetWordForm(games, ["игра", "игры", "игр"])} (${Round(score, 10)})`
}

User.prototype.GetTopCategoriesText = function(category2count) {
    let categories = []

    for (let [category, count] of Object.entries(category2count))
        categories.push({count: count, category: new Category(category)})

    categories.sort((a, b) => b.count - a.count)
    return categories.slice(0, 3).map(category => category.category.ToRus()).join(", ")
}
