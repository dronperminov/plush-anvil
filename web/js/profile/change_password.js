function GetChangePasswordParams() {
    let currPassword =  currPasswordInput.GetValue()
    if (currPassword === null)
        return null

    let password = passwordInput.GetValue()
    if (password === null)
        return null

    if (password === currPassword) {
        currPasswordInput.Error()
        passwordInput.Error("Новый пароль совпадает с текущим")
        return null
    }

    let passwordConfirm = passwordConfirmInput.GetValue()
    if (passwordConfirm === null)
        return null

    if (password !== passwordConfirm) {
        passwordInput.Error("Пароли не совпадают")
        passwordConfirmInput.Error()
        return null
    }

    return {curr_password: currPassword, password: password}
}

function ChangePassword() {
    let params = GetChangePasswordParams()
    if (params === null)
        return

    SendRequest("/change-password", params).then(response => {
        if (response.status != SUCCESS_STATUS) {
            ShowNotification(`Не удалось сменить пароль<br><b>Причина</b>: ${response.message}`)
            return
        }

        ShowNotification("Пароль успешно изменён", "success-notification")
        location.href = "/"
    })
}
