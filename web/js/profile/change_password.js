function GetChangePasswordParams() {
    let currPassword = GetTextInput("curr-password", "Текущий пароль не заполнен")
    if (currPassword === null)
        return null

    let password = GetTextInput("password", "Пароль не заполнен")
    if (password === null)
        return null

    if (password === currPassword) {
        InputError("curr-password")
        InputError("password", "Новый пароль совпадает с текущим")
        return null
    }

    let passwordConfirm = GetTextInput("password-confirm", "Подтверждение пароля не заполнено")
    if (passwordConfirm === null)
        return null

    if (password !== passwordConfirm) {
        InputError("password")
        InputError("password-confirm", "Пароли не совпадают")
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
            ShowNotification(`Не удалось сменить пароль<br><b>Причиина</b>: ${response.message}`)
            return
        }

        ShowNotification("Пароль успешно изменён", "success-notification")
        location.href = "/"
    })
}
