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
