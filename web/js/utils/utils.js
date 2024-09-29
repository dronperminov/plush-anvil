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
