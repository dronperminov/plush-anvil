function GetParams() {
    return {}
}

function LoadAchievements(response, block) {
    for (let user of response.users) {
        user = new User(user)
        block.appendChild(user.BuildAchievements(response.username2achievements[user.username]))
        infos.Add(user.BuildAchievementsInfo(response.username2achievements[user.username]))
    }

    return response.users.length
}

function InitAchievementsInfo() {
    let info = MakeElement("info", null, {id: "achievements-info"})

    MakeElement("info-header", info, {innerText: "Управление достижениями"})

    let inputs = MakeElement("achievements-inputs", info)
    let date = MakeIconInput(inputs, "дата достижения", '<img src="/images/icons/calendar.svg">', "achievement-date", "basic-input", {type: "date", placeholder: "дата", value: FormatInputDate()})

    let achievementTypeInput = MakeIconInput(inputs, "тип достижения", '<img src="/images/icons/achievement.svg">', "achievement-type", "basic-select", {style: "width: 100%;"})
    let achievementType = new HandleAchievementType("")

    for (let type of achievementType.values)
        MakeElement("", achievementTypeInput, {value: type, innerText: achievementType.value2title[type]}, "option")

    userSelect.Build(inputs)

    let buttons = MakeElement("achievements-buttons hidden", inputs)
    let addButton = MakeArrowLink(buttons, "ДОБАВИТЬ", "/images/icons/add.svg")
    let removeButton = MakeArrowLink(buttons, "УДАЛИТЬ", "/images/icons/trash.svg")

    userSelect.onchange = () => {
        if (userSelect.HaveSelected())
            buttons.classList.remove("hidden")
        else
            buttons.classList.add("hidden")
    }

    addButton.addEventListener("click", () => ModifyAchievements(info, "add"))
    removeButton.addEventListener("click", () => ModifyAchievements(info, "remove"))

    infos.Add(info)
}

function ModifyAchievements(info, action) {
    let date = dateInput.GetValue()
    if (date === null)
        return

    let selected = userSelect.GetSelected()
    if (selected.length == 0)
        return

    let achievementType = document.getElementById("achievement-type").value

    let actions = {
        "add": {confirm: "добавить достижение", error: "Не удалось добавить достижение", success: "Достижение успешно добавлены"},
        "remove": {confirm: "удалить достижение", error: "Не удалось удалить достижение", success: "Достижение успешно удалены"}
    }

    if (!confirm(`Вы уверены, что хотите ${actions[action].confirm}?`))
        return

    let buttons = info.getElementsByTagName("button")
    Disable(buttons)

    SendRequest("/modify-achievements", {date: date, achievement_type: achievementType, users: selected, action: action}).then(response => {
        if (response.status != SUCCESS_STATUS) {
            ShowNotification(`${actions[action].error}<br><b>Причина</b>: ${response.message}`, "error-notification")
            Enable(buttons)
            return
        }

        ShowNotification(actions[action].success, "success-notification")
        location.reload()
    })
}
