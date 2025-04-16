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
    let element = null

    if (["svg", "path"].indexOf(tagName) > -1) {
        element = document.createElementNS("http://www.w3.org/2000/svg", tagName)
        element.setAttribute("class", className)
    }
    else {
        element = document.createElement(tagName)
        element.className = className
    }

    SetAttributes(element, attributes)

    if (parent !== null)
        parent.appendChild(element)

    return element
}

function HTMLtoElement(html, parent = null) {
    let div = MakeElement("", null, {innerHTML: html})
    let element = div.firstElementChild

    if (parent !== null)
        parent.appendChild(element)

    return element
}

function MakeIconInput(parent, label, icon, inputId, inputClass, inputAttributes = null) {
    let block = MakeElement("icon-input icon-input-info", parent)
    MakeElement("", block, {for: inputId, innerText: label}, "label")
    HTMLtoElement(icon, block)

    let class2tag = {"basic-textarea": "textarea", "basic-select": "select", "basic-input": "input"}
    let input = MakeElement(inputClass, block, inputAttributes, inputClass in class2tag ? class2tag[inputClass] : "input")
    input.setAttribute("id", inputId)

    return input
}

function MakeCheckbox(text, id, parent) {
    let label = MakeElement("switch-checkbox", parent, {}, "label")
    let input = MakeElement("", label, {type: "checkbox", id: id}, "input")
    MakeElement("switch-checkbox-slider", label, {}, "span")
    MakeElement("", parent, {for: id, innerText: ` ${text}`}, "label")

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

function FormatDate(datetime) {
    let day = `${datetime.getDate()}`.padStart(2, "0")
    let month = `${datetime.getMonth() + 1}`.padStart(2, "0")
    let year = datetime.getFullYear()

    return `${day}.${month}.${year}`
}

function FormatTime(datetime) {
    let hours = `${datetime.getHours()}`.padStart(2, "0")
    let minutes = `${datetime.getMinutes()}`.padStart(2, "0")
    return `${hours}:${minutes}`
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

function FormatInputDate(date = null) {
    if (date === null)
        date = new Date()

    let day = `${date.getDate()}`.padStart(2, "0")
    let month = `${date.getMonth() + 1}`.padStart(2, "0")
    let year = date.getFullYear()

    return `${year}-${month}-${day}`
}

function Disable(elements) {
    for (let element of elements)
        element.setAttribute("disabled", "")
}

function Enable(elements) {
    for (let element of elements)
        element.removeAttribute("disabled")
}

function Round(value, scale = 100) {
    return Math.round(value * scale) / scale
}

function GetMonthFromRus(month) {
    let rus2month = {
        "январь": 1, "февраль": 2, "март": 3, "апрель": 4, "май": 5, "июнь": 6,
        "июль": 7, "август": 8, "сентябрь": 9, "октябрь": 10, "ноябрь": 11, "декабрь": 12
    }
    return rus2month[month.toLowerCase()]
}

function GetRusMonth(month) {
    let months = ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"]
    return months[month - 1]
}
