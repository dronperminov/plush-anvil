function GetSignInParams() {
    let username = GetTextInput("username", "Имя пользователя не заполнено")
    if (username === null)
        return null

    let password = GetTextInput("password", "Пароль не заполнен")
    if (password === null)
        return null

    return {username, password}
}

function GetBirthDate() {
    let day = +document.getElementById("birth-date-day").value
    let month = +document.getElementById("birth-date-month").value

    let month2days = {1: 31, 2: 29, 3: 31, 4: 30, 5: 31, 6: 30, 7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31}

    if (day < 1 || day > month2days[month]) {
        InputError("birth-date-day", `День рождения не может быть числом больше ${month2days[+month]}`)
        return null
    }

    return {day: day, month: month}
}

function GetSignUpParams() {
    let username = GetTextInput("username", "Имя пользователя не заполнено")
    if (username === null)
        return null

    if (username.match(/^[a-z][a-zA-Z_\d]+$/gi) === null) {
        InputError("username", 'Имя пользователя может состоять только из латинских букв, цифр и символа "_" и должно иметь более одного символа')
        return null
    }

    if (username.match(/^admin/gi) !== null) {
        InputError("username", "Введённое имя пользователя запрещено")
        return null
    }

    let fullname = GetTextInput("full-name", "Полное имя не заполнено")
    if (fullname === null)
        return null

    let birthDate = GetBirthDate()
    if (birthDate === null)
        return null

    let password = GetTextInput("password", "Пароль не заполнен")
    if (password === null)
        return null

    let passwordConfirm = GetTextInput("password-confirm", "Подтверждение пароля не заполнено")
    if (passwordConfirm === null)
        return null

    if (password !== passwordConfirm) {
        InputError("password")
        InputError("password-confirm", "Пароли не совпадают")
        return null
    }

    let response = grecaptcha.getResponse()
    if (response.length == 0) {
        ShowNotification("Капча не пройдена", "error-notification")
        return null
    }

    return {username: username, password: password, full_name: fullname, birth_date: birthDate}
}

function SignIn() {
    let data = GetSignInParams()
    if (data === null)
        return

    let params = new URLSearchParams(window.location.search)
    let redirectUrl = params.get("back_url")

    SendRequest("/sign-in", data).then(response => {
        if (response.status != SUCCESS_STATUS) {
            ShowNotification(response.message, "error-notification", 3000)
            return
        }

        localStorage.setItem(TOKEN_NAME, response.token)
        location.href = redirectUrl ? redirectUrl : "/"
    })
}

function SignUp() {
    let data = GetSignUpParams()
    if (data === null)
        return

    SendRequest("/sign-up", data).then(response => {
        if (response.status != SUCCESS_STATUS) {
            ShowNotification(response.message, "error-notification", 3000)
            return
        }

        localStorage.setItem(TOKEN_NAME, response.token)
        location.reload()
    })
}
