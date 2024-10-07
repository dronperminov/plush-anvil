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
    let title = document.getElementById("album-title")
    title.innerText = response.album.title

    for (let photo of response.photos)
        block.appendChild(album.BuildPhoto(photo))

    return response.photos.length
}

function GetResultMessage(total) {
    return `${total} фото`
}

function GetAlbumPhotos() {
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
    let fetches = []

    for (let file of input.files)
        fetches.push(UploadPhoto(file))

    Promise.all(fetches).then(() => GetAlbumPhotos())
}

function UploadPhoto(image) {
    let data = new FormData()
    data.append("image", image)
    data.append("album_id", album.albumId)

    let photos = document.getElementById("photos").children[1]
    let photo = album.BuildPhoto({preview_url: "/images/albums/photo.webp"})
    photos.prepend(photo)

    return SendRequest("/upload-photo", data).then(response => {
        if (response.status != SUCCESS_STATUS) {
            photos.removeChild(photo)
            ShowNotification(`Не удалось загрузить фото<br><b>Причина</b>: ${response.message}`)
            return false
        }

        return true
    })
}
