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

Album.prototype.BuildPhoto = function(photo, markup, title, gallery = null) {
    let photoBlock = MakeElement("photo")
    let img = MakeElement("", photoBlock, {src: photo.preview_url}, "img")

    let removeIcon = this.BuildPhotoIcon("photo-remove-icon", "/images/icons/trash.svg", photoBlock)
    removeIcon.addEventListener("click", () => RemovePhoto(photo.photo_id))

    let coverIcon = this.BuildPhotoIcon("photo-cover-icon", "/images/icons/" + (this.coverId === photo.photo_id ? "star-fill.svg" : "star.svg"), photoBlock)
    coverIcon.addEventListener("click", () => this.SetCoverPhoto(photo.photo_id, coverIcon.querySelector("img")))

    if (gallery !== null) {
        gallery.AddPhoto({photoId: photo.photo_id, url: photo.url, albumId: photo.album_id, title: title}, markup)
        img.addEventListener("click", (e) => gallery.ShowPhoto(photo.photo_id))
    }

    return photoBlock
}

Album.prototype.BuildPhotoIcon = function(className, icon, parent) {
    let iconBlock = MakeElement(`admin-block photo-icon ${className}`, parent)
    let circleLink = MakeElement("circle-link", iconBlock, {}, "span")
    MakeElement("", circleLink, {src: icon}, "img")
    return iconBlock
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

Album.prototype.SetCoverPhoto = function(photoId, coverIconImg) {
    return SendRequest("/set-cover-photo", {album_id: this.albumId, photo_id: photoId}).then(response => {
        if (response.status != SUCCESS_STATUS) {
            ShowNotification(`Не удалось установить фото в качестве обложки<br><b>Причина</b>: ${response.message}`)
            return false
        }

        for (let coverIcon of document.querySelectorAll(".photo-cover-icon img"))
            coverIcon.src = "/images/icons/star.svg"

        coverIconImg.src = "/images/icons/star-fill.svg"
        this.coverId = photoId
        return true
    })
}

Album.prototype.RenameAlbum = function(title) {
    return SendRequest("/rename-album", {album_id: this.albumId, title: title}).then(response => {
        if (response.status != SUCCESS_STATUS) {
            ShowNotification(`Не удалось изменить название альбома<br><b>Причина</b>: ${response.message}`)
            return false
        }

        this.title = title
        return true
    })
}

Album.prototype.Remove = function() {
    if (!confirm(`Вы уверены, что хотите удалить фотоальбом "${this.title}"?`))
        return

    SendRequest("/remove-album", {album_id: this.albumId}).then(response => {
        if (response.status != SUCCESS_STATUS) {
            ShowNotification(`Не удалось удалить альбом<br><b>Причина</b>: ${response.message}`)
            return false
        }

        location.href = "/albums"
    })
}
