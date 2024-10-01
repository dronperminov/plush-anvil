function GetParams() {
    return {}
}

function LoadBirthdays(response, block) {
    for (let user of response.users) {
        user = new User(user)
        block.appendChild(user.BuildBirthday(response.username2days[user.username]))
    }

    return response.users.length
}
