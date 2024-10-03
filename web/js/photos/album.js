function GetAlbumPhotosParams() {
    if (typeof album.albumId === 'number')
        return {album_id: album.albumId}

    let albumData = JSON.parse(album.albumId)

    if (albumData.type == "photos_with_me") {
        albumData.only = document.getElementById("only").checked
    }
    else if (albumData.type == "user_photos") {
        albumData.only = document.getElementById("only").checked
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
