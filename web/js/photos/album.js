function GetAlbumPhotosParams() {
    return {album_id: album.albumId}
}

function LoadAlbumPhotos(response, block) {
    for (let photo of response.photos)
        block.appendChild(album.BuildPhoto(photo))

    return response.photos.length
}

function GetResultMessage(total) {
    return `${total} фото`
}
