function GetAlbumPhotosParams() {
    if (typeof album.albumId === 'number')
        return {album_id: album.albumId}

    let albumData = JSON.parse(album.albumId)

    if (albumData.type == "photos_with_me") {
        albumData.only = document.getElementById("only").checked
    }
    else if (albumData.type == "user_photos") {
        albumData.only = document.getElementById("only").checked
        albumData.usernames = userSelect.GetSelected()
    }

    PushUrlParams(albumData)
    album.albumId = JSON.stringify(albumData)
    return {album_id: album.albumId}
}

function PushUrlParams(params) {
    let url = new URL(window.location.href)

    let keys = [...url.searchParams.keys()]
    for (let key of keys)
        url.searchParams.delete(key)

    if ("usernames" in params)
        for (let username of params.usernames)
            url.searchParams.append("usernames", username)

    if ("only" in params)
        url.searchParams.set("only", params.only)

    window.history.pushState(null, '', url.toString())
}

function LoadAlbumPhotos(response, block) {
    ShowAlbumTitle(response.album.title)

    for (let photo of response.photos)
        block.appendChild(album.BuildPhoto(photo, response.photo_id2markup[photo.photo_id], gallery))

    return response.photos.length
}

function GetResultMessage(total) {
    return `${total} фото`
}

function GetAlbumPhotos() {
    gallery.Clear()

    infiniteScroll.Reset()
    infiniteScroll.LoadContent()
}

function SelectPhotos() {
    if (typeof album.albumId !== 'number')
        return

    let input = document.getElementById("photos-input")
    input.click()
}

function UploadPhotos() {
    if (typeof album.albumId !== 'number')
        return

    let input = document.getElementById("photos-input")
    let photos = document.getElementById("photos").children[1]
    let fetches = []

    for (let file of input.files)
        fetches.push(album.UploadPhoto(file, photos))

    Promise.all(fetches).then(() => GetAlbumPhotos())
}

function RemovePhoto(photoId) {
    if (!confirm("Вы уверены, что хотите удалить это фото?"))
        return

    album.RemovePhoto(photoId).then(result => {
        if (result)
            GetAlbumPhotos()
    })
}

function ToggleEditMode() {
    let content = document.getElementById("content")
    let editLink = document.getElementById("edit-link").children[0]
    let addLink = document.getElementById("add-link")
    let editBlock = document.getElementById("edit-block")

    content.classList.toggle("album-edit")

    addLink.classList.toggle("hidden")
    editBlock.classList.toggle("hidden")

    if (content.classList.contains("album-edit"))
        editLink.innerText = "ЗАВЕРШИТЬ"
    else
        editLink.innerText = "ИЗМЕНИТЬ"
}

function RenameAlbum() {
    let title = GetTextInput("album-title", "Название альбома не может быть пустым")
    if (title === null || title == this.title)
        return

    album.RenameAlbum(title).then(result => {
        if (!result)
            return

        ShowAlbumTitle(title)
        ShowNotification(`Название альбома успешно изменено на "${title}"`, "success-notification")
    })
}

function ShowAlbumTitle(title) {
    document.querySelector("title").innerText = `${title} | Плюшевая наковальня`
    document.querySelector("h1").innerText = title
    document.querySelector(".bread-crumbs-current").innerText = title.substr(0, 50) + (title.length > 50 ? "..." : "")
}
