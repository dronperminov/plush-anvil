function Album(album, photoId2photo) {
    this.albumId = album.album_id
    this.title = album.title
    this.date = album.date
    this.coverId = album.cover_id
    this.photoIds = album.photo_ids
    this.photoId2photo = photoId2photo

    this.coverUrl = this.coverId in photoId2photo ? photoId2photo[this.coverId].preview_url : "/images/albums/default.webp"
}

Album.prototype.Build = function() {
    let album = MakeElement("album")

    let albumCover = MakeElement("album-cover", album)
    let albumCoverLink = MakeElement("", albumCover, {href: `/albums/${this.albumId}`}, "a")
    MakeElement("", albumCoverLink, {src: this.coverUrl}, "img")

    let albumTitle = MakeElement("album-title", album)
    MakeElement("", albumTitle, {innerText: this.title}, "span")
    let link = MakeElement("circle-link", albumTitle, {href: `/albums/${this.albumId}`}, "a")
    MakeElement("", link, {src: "/images/icons/arrow-right.svg"}, "img")

    return album
}

Album.prototype.BuildPhoto = function(photo) {
    let photoBlock = MakeElement("photo")
    MakeElement("", photoBlock, {src: photo.preview_url}, "img")

    let removeIcon = MakeElement("admin-block photo-icon", photoBlock)
    let circleLink = MakeElement("circle-link", removeIcon, {}, "span")
    let icon = MakeElement("", circleLink, {src: "/images/icons/trash.svg"}, "img")
    removeIcon.addEventListener("click", () => RemovePhoto(photo.photo_id))

    return photoBlock
}

Album.prototype.UploadPhoto = function(image, parent) {
    let data = new FormData()
    data.append("image", image)
    data.append("album_id", this.albumId)

    let photo = album.BuildPhoto({preview_url: "/images/albums/photo.webp"})
    parent.prepend(photo)

    return SendRequest("/upload-photo", data).then(response => {
        if (response.status != SUCCESS_STATUS) {
            parent.removeChild(photo)
            ShowNotification(`Не удалось загрузить фото<br><b>Причина</b>: ${response.message}`)
            return false
        }

        return true
    })
}

Album.prototype.RemovePhoto = function(photoId) {
    return SendRequest("/remove-photo", {photo_id: photoId}).then(response => {
        if (response.status != SUCCESS_STATUS) {
            ShowNotification(`Не удалось удалить фото<br><b>Причина</b>: ${response.message}`)
            return false
        }

        return true
    })
}
