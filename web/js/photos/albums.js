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
