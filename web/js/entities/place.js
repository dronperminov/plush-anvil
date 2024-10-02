const PLACE_NAME_ICON = `
<svg width="1.2em" height="1.2em" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <path d="M33,19a1,1,0,0,1-.71-.29L18,4.41,3.71,18.71a1,1,0,0,1-1.41-1.41l15-15a1,1,0,0,1,1.41,0l15,15A1,1,0,0,1,33,19Z"></path>
    <path d="M18,7.79,6,19.83V32a2,2,0,0,0,2,2h7V24h6V34h7a2,2,0,0,0,2-2V19.76Z"></path>
    <rect x="0" y="0" width="36" height="36" fill-opacity="0"></rect>
</svg>
`

const PLACE_ADDRESS_ICON = `
<svg width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M8.89129 21.0787L8.9461 21.1315L8.95039 21.1357C9.95462 22.098 10.9283 22.7576 12.0296 22.7449C13.1259 22.7323 14.0956 22.0555 15.0992 21.0783C16.4747 19.7455 18.2545 17.9477 19.5403 15.8149C20.831 13.6741 21.6639 11.1292 21.0372 8.33595C18.9197 -1.10413 5.09133 -1.11519 2.96276 8.32592C2.35382 11.04 3.12314 13.5227 4.34999 15.6268C5.57222 17.7231 7.2824 19.5029 8.65394 20.8471C8.73386 20.9254 8.81273 21.0023 8.89035 21.0778L8.89129 21.0787ZM12 6.25012C10.2051 6.25012 8.75 7.7052 8.75 9.50012C8.75 11.295 10.2051 12.7501 12 12.7501C13.7949 12.7501 15.25 11.295 15.25 9.50012C15.25 7.7052 13.7949 6.25012 12 6.25012Z" />
</svg>
`

const PLACE_METRO_STATION_ICON = `
<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="337.5 232.3 125 85.9">
    <polygon fill="#FF0013" points="453.9,306.2 424.7,232.3 400,275.5 375.4,232.3 346.1,306.2 337.5,306.2 337.5,317.4 381.7,317.4 
    381.7,306.2 375.1,306.2 381.5,287.8 400,318.2 418.5,287.8 424.9,306.2 418.3,306.2 418.3,317.4 462.5,317.4 462.5,306.2 "></polygon>
</svg>
`

const PLACE_YANDEX_MAP_ICON = `
<svg width="1.2em" height="1.2em" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 1C4.6862 1 2 3.6862 2 7C2 8.6563 2.6711 10.156 3.7565 11.2417C4.8422 12.328 7.4 13.9 7.55 15.55C7.57249 15.7974 7.7516 16 8 16C8.2484 16 8.42751 15.7974 8.45 15.55C8.6 13.9 11.1578 12.328 12.2435 11.2417C13.3289 10.156 14 8.6563 14 7C14 3.6862 11.3138 1 8 1Z" fill="#FF4433"></path><path d="M8.00002 9.10015C9.15982 9.10015 10.1 8.15994 10.1 7.00015C10.1 5.84035 9.15982 4.90015 8.00002 4.90015C6.84023 4.90015 5.90002 5.84035 5.90002 7.00015C5.90002 8.15994 6.84023 9.10015 8.00002 9.10015Z" fill="white"></path>
</svg>
`

function Place(place) {
    this.placeId = place.place_id
    this.name = place.name
    this.address = place.address
    this.yandexMapLink = place.yandex_map_link
    this.metroStation = place.metro_station
    this.color = place.color
}

Place.prototype.Build = function() {
    this.place = MakeElement("place", null, {style: `background-color: ${this.color}60; border-color: ${this.color}bb;`, id: `place-${this.placeId}`})

    this.placeColor = MakeElement("place-color", this.place, {style: `background-color: ${this.color}`})

    let placeMain = MakeElement("place-main", this.place)
    this.placeName = MakeElement("place-name", placeMain, {innerText: this.GetNameText()})
    let placeAddress = MakeElement("place-address", placeMain)
    this.placeLink = MakeElement("link", placeAddress, {href: this.yandexMapLink, innerText: this.address}, "a")

    let placeMenu = MakeElement("place-menu", this.place)
    let verticalHam = MakeElement("vertical-ham", placeMenu, {innerHTML: "<div></div><div></div><div></div>"})
    verticalHam.addEventListener("click", () => infos.Show(`place-${this.placeId}-info`))

    return this.place
}

Place.prototype.BuildInfo = function() {
    let info = MakeElement("info", null, {id: `place-${this.placeId}-info`})

    if (this.placeId === "add") {
        MakeElement("info-header", info, {innerText: "Добавление места"}, "h2")
    }

    let placeInputs = MakeElement("place-inputs", info)

    let nameInput = MakeIconInput(placeInputs, PLACE_NAME_ICON, `place-${this.placeId}-name`, "basic-input", {placeholder: "название", type: "text", value: this.name})
    let addressInput = MakeIconInput(placeInputs, PLACE_ADDRESS_ICON, `place-${this.placeId}-address`, "basic-input", {placeholder: "адрес", type: "text", value: this.address})
    let metroStationInput = MakeIconInput(placeInputs, PLACE_METRO_STATION_ICON, `place-${this.placeId}-metro-station`, "basic-input", {placeholder: "станция метро", type: "text", value: this.metroStation, list: "metro-stations"})
    let yandexMapLinkInput = MakeIconInput(placeInputs, PLACE_YANDEX_MAP_ICON, `place-${this.placeId}-yandex-map-link`, "basic-input", {placeholder: "ссылка на я.карты", type: "text", value: this.yandexMapLink})
    this.colorInput = new ColorInput(placeInputs, this.color)

    let buttons = MakeElement("place-buttons", placeInputs)

    if (this.placeId === "add") {
        let addButton = MakeElement("basic-button gradient-button", buttons, {innerText: "Добавить"}, "button")
        addButton.addEventListener("click", () => this.Add(info))
    }
    else {
        this.colorInput.onchange = () => this.Update(info)
        let removeButton = MakeElement("basic-button gradient-button", buttons, {innerText: "Удалить"}, "button")

        for (let input of [nameInput, addressInput, metroStationInput, yandexMapLinkInput])
            input.addEventListener("change", () => this.Update(info))

        removeButton.addEventListener("click", () => this.Remove(info))
    }

    return info
}

Place.prototype.GetUpdateParams = function() {
    let name = GetTextInput(`place-${this.placeId}-name`, "Название места не заполнено")
    if (name === null)
        return null

    let address = GetTextInput(`place-${this.placeId}-address`, "Адрес места не заполнен")
    if (address === null)
        return null

    let metroStation = GetTextInput(`place-${this.placeId}-metro-station`)
    if (metroStation === null)
        return null

    let yandexMapLink = GetTextInput(`place-${this.placeId}-yandex-map-link`, "Ссылка на я.карты не заполнена")
    if (yandexMapLink === null)
        return null

    if (yandexMapLink.match(/^https:\/\/yandex.ru\/maps\/org(\/.+)?\/\d+\/?/) === null) {
        InputError(`place-${this.placeId}-yandex-map-link`, "Ссылка на я.карты введена некорректно")
        return null
    }

    let color = this.colorInput.GetColor()
    if (color === null)
        return null

    return {
        place_id: this.placeId,
        name: name,
        address: address,
        metro_station: metroStation,
        yandex_map_link: yandexMapLink,
        color: color
    }
}

Place.prototype.Update = function(info) {
    let params = this.GetUpdateParams()
    if (params === null)
        return

    let buttons = info.getElementsByTagName("button")
    Disable(buttons)

    SendRequest("/update-place", params).then(response => {
        Enable(buttons)

        if (response.status != SUCCESS_STATUS) {
            ShowNotification(`Не удалось обновить место "${this.name}".<br><b>Причина</b>: ${response.message}`, "error-notification")
            return
        }

        ShowNotification("Место успешно обновлено", "success-notification")
        this.UpdateParams(response.place)
    })
}

Place.prototype.Add = function(info) {
    let params = this.GetUpdateParams()
    if (params === null)
        return

    params.place_id = 0

    let buttons = info.getElementsByTagName("button")
    Disable(buttons)

    SendRequest("/add-place", params).then(response => {
        if (response.status != SUCCESS_STATUS) {
            ShowNotification(`Не удалось добавить место "${params.name}".<br><b>Причина</b>: ${response.message}`, "error-notification")
            Enable(buttons)
            return
        }

        location.reload()
    })
}

Place.prototype.UpdateParams = function(place) {
    this.name = place.name
    this.address = place.address
    this.yandexMapLink = place.yandex_map_link
    this.metroStation = place.metro_station
    this.color = place.color

    this.place.setAttribute("style", `background-color: ${this.color}60; border-color: ${this.color}bb;`)

    this.placeColor.setAttribute("style", `background-color: ${this.color}`)
    this.placeName.innerText = this.GetNameText()
    this.placeLink.setAttribute("href", this.yandexMapLink)
    this.placeLink.innerText = this.address
}

Place.prototype.Remove = function(info) {
    if (!confirm(`Вы уверены, что хотите удалить место "${this.name}"`))
        return

    let buttons = info.getElementsByTagName("button")
    Disable(buttons)

    SendRequest("/remove-place", {place_id: this.placeId}).then(response => {
        if (response.status != SUCCESS_STATUS) {
            ShowNotification(`Не удалось удалить место "${this.name}".<br><b>Причина</b>: ${response.message}`, "error-notification")
            Enable(buttons)
            return
        }

        infos.Close()
        this.place.parentNode.removeChild(this.place)
    })
}

Place.prototype.GetNameText = function() {
    let text = this.name

    if (this.metroStation !== "")
        text += ` (м. ${this.metroStation})`

    return text
}