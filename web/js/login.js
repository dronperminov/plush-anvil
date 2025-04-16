function GetSignInParams() {
    let username = usernameInput.GetValue()
    if (username === null)
        return null

    let password = passwordInput.GetValue()
    if (password === null)
        return null

    return {username, password}
}

function GetSignUpParams() {
    let username = usernameInput.GetValue()
    if (username === null)
        return null

    let fullname = fullnameInput.GetValue()
    if (fullname === null)
        return null

    let birthDate = birthDateInput.GetValue()
    if (birthDate === null)
        return null

    let password = passwordInput.GetValue()
    if (password === null)
        return null

    let passwordConfirm = passwordConfirmInput.GetValue()
    if (passwordConfirm === null)
        return null

    if (password !== passwordConfirm) {
        passwordInput.Error("Пароли не совпадают")
        passwordConfirmInput.Error()
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
    let params = GetSignInParams()
    if (params === null)
        return

    let query = new URLSearchParams(window.location.search)
    let redirectUrl = query.get("back_url")

    SendRequest("/sign-in", params).then(response => {
        if (response.status != SUCCESS_STATUS) {
            ShowNotification(response.message, "error-notification", 3000)
            return
        }

        localStorage.setItem(TOKEN_NAME, response.token)
        location.href = redirectUrl ? redirectUrl : "/"
    })
}

function SignUp() {
    let params = GetSignUpParams()
    if (params === null)
        return

    SendRequest("/sign-up", params).then(response => {
        if (response.status != SUCCESS_STATUS) {
            ShowNotification(response.message, "error-notification", 3000)
            return
        }

        localStorage.setItem(TOKEN_NAME, response.token)
        location.reload()
    })
}
