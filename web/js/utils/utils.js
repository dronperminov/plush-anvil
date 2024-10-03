function ShowNotification(text, className = "error-notification", showTime = 2000) {
    let notifications = document.getElementById("notifications")

    if (notifications === null) {
        notifications = document.createElement("div")
        notifications.setAttribute("id", "notifications")
        let body = document.getElementsByTagName("body")[0]
        body.appendChild(notifications)
    }

    let notification = document.createElement("div")
    notification.classList.add("notification")
    notification.classList.add(className)
    notification.innerHTML = text
    notifications.prepend(notification)

    setTimeout(() => {
        notification.classList.add("notification-open")

        setTimeout(() => {
            notification.classList.remove("notification-open")

            setTimeout(() => {
                notification.remove()
            }, 50)
        }, showTime)
    }, 50)
}

function ClearInputError(inputId) {
    let input = document.getElementById(inputId)
    let label = document.getElementById(`${inputId}-label`)
    let icon = document.getElementById(`${inputId}-icon`)

    input.classList.remove("error-input")

    if (icon !== null)
        icon.classList.remove("error-icon")

    if (label !== null)
        label.classList.remove("error-label")
}

function InputError(inputId, error = "") {
    let input = document.getElementById(inputId)
    let label = document.getElementById(`${inputId}-label`)
    let icon = document.getElementById(`${inputId}-icon`)

    input.classList.add("error-input")
    input.focus()

    if (icon !== null)
        icon.classList.add("error-icon")

    if (label !== null)
        label.classList.add("error-label")

    if (error !== "")
        ShowNotification(error, "error-notification", 3000)
}

function GetTextInput(inputId, error = "") {
    let input = document.getElementById(inputId)
    let value = input.value.trim()
    input.value = value

    if (value === "" && error != "") {
        InputError(inputId, error)
        return null
    }

    ClearInputError(inputId)
    return value
}

function SetAttributes(element, attributes) {
    if (attributes === null)
        return

    for (let [name, value] of Object.entries(attributes)) {
        if (name == "innerText")
            element.innerText = value
        else if (name == "innerHTML")
            element.innerHTML = value
        else
            element.setAttribute(name, value)
    }
}

function MakeElement(className, parent = null, attributes = null, tagName = "div") {
    let element = document.createElement(tagName)
    element.className = className

    SetAttributes(element, attributes)

    if (parent !== null)
        parent.appendChild(element)

    return element
}

function MakeIconInput(parent = null, icon, inputId, inputClass, inputAttributes = null) {
    let block = MakeElement("icon-input", parent)
    MakeElement("icon-input-icon", block, {id: `${inputId}-icon`, for: inputId, innerHTML: icon}, "label")
    let inputBlock = MakeElement("icon-input-input", block)

    let input = MakeElement(inputClass, inputBlock, inputAttributes, inputClass == "basic-textarea" ? "textarea" : "input")
    input.setAttribute("id", inputId)

    return input
}

function GetWordForm(count, forms, onlyForm = false) {
    let index = 0

    if ([0, 5, 6, 7, 8, 9].indexOf(Math.abs(count) % 10) > -1 || [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].indexOf(Math.abs(count) % 100) > -1)
        index = 2
    else if ([2, 3, 4].indexOf(Math.abs(count) % 10) > -1)
        index = 1

    return onlyForm ? forms[index] : `${count} ${forms[index]}`
}

function FormatDatetime(datetime) {
    let day = `${datetime.getDate()}`.padStart(2, "0")
    let month = `${datetime.getMonth() + 1}`.padStart(2, "0")
    let year = datetime.getFullYear()

    let hours = `${datetime.getHours()}`.padStart(2, "0")
    let minutes = `${datetime.getMinutes()}`.padStart(2, "0")

    if (hours === "00")
        return `${day}.${month}.${year}`

    return `${day}.${month}.${year} ${hours}:${minutes}`
}

function Disable(elements) {
    for (let element of elements)
        element.setAttribute("disabled", "")
}

function Enable(elements) {
    for (let element of elements)
        element.removeAttribute("disabled")
}
