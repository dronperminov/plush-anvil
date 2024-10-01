function GetAlbumPhotosParams() {
    return {album_id: album.albumId}
}

function LoadAlbumPhotos(response, block) {
    for (let photo of response.photos)
        block.appendChild(album.BuildPhoto(photo))

    return response.photos.length
}

function GetAlbumPhotos() {
    let params = GetAlbumPhotosParams()
    if (params === null)
        return

    infiniteScroll.Reset()
    infiniteScroll.LoadContent()
}
