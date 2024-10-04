function GetParams() {
    return {}
}

function LoadStickers(response, block) {
    for (let user of response.users) {
        user = new User(user)
        block.appendChild(user.BuildSticker(response.username2sticker[user.username]))
        infos.Add(user.BuildStickerInfo(response.username2sticker[user.username]))
    }

    return response.users.length
}

function InitStickersInfo() {
    let info = MakeElement("info", null, {id: "stickers-info"})

    MakeElement("info-header", info, {innerText: "Управление наклейками"})

    let inputs = MakeElement("sticker-inputs", info)
    let date = MakeIconInput(inputs, '<img src="/images/icons/calendar.svg">', "stickers-date", "basic-input", {type: "date", placeholder: "дата", value: FormatInputDate()})
    userSelect.Build(inputs)

    let buttons = MakeElement("sticker-buttons hidden", inputs)
    let addButton = MakeElement("basic-button gradient-button", buttons, {innerText: "Добавить"}, "button")
    let removeButton = MakeElement("basic-button gradient-button", buttons, {innerText: "Удалить"}, "button")

    userSelect.onchange = () => {
        if (userSelect.HaveSelected())
            buttons.classList.remove("hidden")
        else
            buttons.classList.add("hidden")
    }

    addButton.addEventListener("click", () => ModifyStickers(info, "add"))
    removeButton.addEventListener("click", () => ModifyStickers(info, "remove"))

    infos.Add(info)
}

function ModifyStickers(info, action) {
    let date = GetTextInput("stickers-date", "Дата не указана")
    if (date === null)
        return

    let selected = userSelect.GetSelected()
    if (selected.length == 0)
        return

    let actions = {
        "add": {confirm: "добавить наклейки", error: "Не удалось добавить наклейки", success: "Наклейки успешно добавлены"},
        "remove": {confirm: "удалить наклейки", error: "Не удалось удалить наклейки", success: "Наклейки успешно удалены"}
    }

    if (!confirm(`Вы уверены, что хотите ${actions[action].confirm}?`))
        return

    let buttons = info.getElementsByTagName("button")
    Disable(buttons)

    SendRequest("/modify-stickers", {date: date, users: selected, action: action}).then(response => {
        if (response.status != SUCCESS_STATUS) {
            ShowNotification(`${actions[action].error}<br><b>Причина</b>: ${response.message}`, "error-notification")
            Enable(buttons)
            return
        }

        ShowNotification(actions[action].success, "success-notification")
        location.reload()
    })
}
