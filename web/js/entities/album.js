function Album(album, photoId2photo) {
    this.albumId = album.album_id
    this.title = album.title
    this.date = album.date
    this.coverId = album.cover_id
    this.imageIds = album.image_ids
    this.photoId2photo = photoId2photo

    this.coverUrl = this.coverId in photoId2photo ? `https://plush-anvil.ru${photoId2photo[this.coverId].preview_url}` : "/images/albums/default.png"
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
