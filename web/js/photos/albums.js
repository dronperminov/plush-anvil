function GetSearchParams() {
    return {
        query: document.getElementById("query").value.trim(),
        order: document.getElementById("order").value,
        order_type: +document.getElementById("order-type").value
    }
}

function LoadAlbums(response, block) {
    for (let album of response.albums) {
        album = new Album(album, response.photo_id2photo)
        block.appendChild(album.Build())
    }

    return response.albums.length
}

function GetResultMessage(total) {
    return GetWordForm(total, ['альбом', 'альбома', 'альбомов'])
}

function PushUrlParams(params = null) {
    let url = new URL(window.location.href)

    let keys = []
    for (let [key, value] of url.searchParams.entries())
        keys.push(key)

    for (let key of keys)
        url.searchParams.delete(key)

    if (params !== null) {
        if (params.query !== "")
            url.searchParams.set("query", params.query)

        for (let key of ["order", "order_type"])
            url.searchParams.set(key, params[key])
    }

    window.history.pushState(null, '', url.toString())
}

function SearchAlbums() {
    let params = GetSearchParams()
    if (params === null)
        return

    PushUrlParams(params)

    search.CloseFiltersPopup()
    infiniteScroll.Reset()
    infiniteScroll.LoadContent()
}

function ResetFilters() {
    let queryInput = document.getElementById("query")
    let orderInput = document.getElementById("order")
    let orderTypeInput = document.getElementById("order-type")

    queryInput.value = ""
    orderInput.value = "date"
    orderTypeInput.value = -1
}

function ClearAlbums() {
    ResetFilters()
    SearchAlbums()
}

function MakeNewAlbumInfo() {
    let info = MakeElement("info", null, {id: "new-album"})

    MakeElement("info-header", info, {innerText: "Добавить новый альбом"})
    MakeIconInput(info, "название альбома", '<img src="/images/icons/edit.svg">', "new-album-title", "basic-input", {placeholder: "название альбома"})

    let buttons = MakeElement("info-buttons", info)
    let button = MakeArrowLink(buttons, "ДОБАВИТЬ", "/images/icons/add.svg")
    button.addEventListener("click", () => CreateAlbum(button))
    return info
}

function CreateAlbum(button) {
    let title = newAlbumTitleInput.GetValue()
    if (title === null)
        return

    Disable([button])
    SendRequest("/add-album", {title: title}).then(response => {
        Enable([button])

        if (response.status != SUCCESS_STATUS) {
            ShowNotification(`Не удалось создать новый альбом.<br><b>Причина</b>: ${response.message}`, "error-notification")
            return
        }

        newAlbumTitleInput.Clear()
        infos.Close()
        ClearAlbums()
    })
}
