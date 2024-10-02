const ORGANIZER_NAME_ICON = `
<svg width="1.2em" height="1.2em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460.067 460.067">
    <path d="M374.327,135.228c17.589,0,31.978-14.237,31.978-31.977c0-17.661-14.317-31.978-31.978-31.978
        c-17.764,0-31.978,14.447-31.978,31.978C342.349,120.917,356.671,135.228,374.327,135.228z"></path>
    <path d="M452.127,181.751c-0.101-20.032-16.481-36.329-36.513-36.329c-6.897,0-61.508,0-68.651,0
        c0.952,6.167,0.651-2.211,1.333,133.434c0.061,12.286-5.819,23.198-15.204,30.061v132.362c0,10.226,8.289,18.515,18.515,18.515
        c10.226,0,18.515-8.289,18.515-18.515V297.282c0-2.208,1.79-3.997,3.997-3.997c2.208,0,3.997,1.79,3.997,3.997v143.996
        c0,10.226,8.289,18.515,18.515,18.515c10.226,0,18.515-8.289,18.515-18.515c0-244.922-0.328-104.588-0.336-259.474
        c0-1.781,1.442-3.226,3.222-3.229c1.781-0.004,3.229,1.435,3.236,3.216c0,0.038,0,0.077,0,0.116l0.57,113.353
        c0.043,8.495,6.942,15.352,15.427,15.352c0.026,0,0.053,0,0.079,0c8.521-0.043,15.394-6.986,15.352-15.507L452.127,181.751z"></path>
    <path d="M327.67,154.397c-0.111-22.012-18.11-39.92-40.122-39.92c-16.156,0-61.035,0-77.161,0
        c1.413,5.186,2.191,10.628,2.22,16.245l0.674,134.228c0.066,13.049-6.446,24.621-16.411,31.582v143.044
        c0,11.236,9.109,20.345,20.345,20.345c11.236,0,20.345-9.108,20.345-20.345V281.348c0-2.426,1.967-4.392,4.393-4.392
        c2.426,0,4.393,1.967,4.393,4.393v158.229c0,11.236,9.108,20.345,20.345,20.345c11.236,0,20.345-9.108,20.345-20.345
        c0-76.238-0.35-206.143-0.368-285.1c0-1.959,1.588-3.548,3.547-3.549c1.96,0,3.548,1.588,3.549,3.547c0,0.031,0,0.062,0,0.093
        l0.626,124.557c0.046,9.175,7.434,16.869,17.039,16.869c9.363-0.047,16.916-7.676,16.869-17.039L327.67,154.397z"></path>
    <path d="M242.18,103.277c19.388,0,35.138-15.744,35.138-35.138C277.318,48.732,261.587,33,242.18,33
        c-19.406,0-35.138,15.732-35.138,35.139C207.042,87.544,222.803,103.277,242.18,103.277z"></path>
    <path d="M191.758,122.554c-3.967-19.778-21.497-34.751-42.39-34.751c-105.711,0-99.357-0.095-102.48,0.223
        c-18.617,1.896-33.814,15.701-37.808,33.647c-1.422,6.39-0.976-2.697-1.71,143.379c-0.051,10.093,8.091,18.312,18.179,18.362h0
        c0.031,0,0.062,0,0.094,0h0c10.047,0,18.218-8.12,18.269-18.179l0.674-134.228c0.01-1.946,1.592-3.515,3.537-3.51
        c1.945,0.005,3.518,1.583,3.518,3.528v131.871h0.009v175.247c0,12.108,9.816,21.925,21.925,21.925h0h0
        c12.109,0,21.925-9.816,21.925-21.925V267.629c0-2.614,2.119-4.733,4.733-4.733c2.614,0,4.733,2.119,4.733,4.733v170.514
        c0,12.108,9.816,21.925,21.925,21.925h0h0c12.109,0,21.925-9.816,21.925-21.925c0-167.702-0.357-263.581-0.395-306.968
        c-0.002-2.079,1.659-3.779,3.738-3.826c2.079-0.047,3.816,1.577,3.906,3.654c0,0.001,0,0.002,0,0.004l0.674,134.228
        c0.051,10.062,8.223,18.179,18.269,18.179h0c0.031,0,0.063,0,0.094,0h0c10.09-0.051,18.23-8.271,18.179-18.362
        C192.556,120.843,192.921,128.349,191.758,122.554z"></path>
    <path d="M100.479,75.733c20.868,0,37.867-16.944,37.867-37.866C138.346,16.922,121.331,0,100.479,0
        C79.624,0,62.613,16.901,62.613,37.867C62.613,58.87,79.664,75.733,100.479,75.733z"></path>
</svg>
`

function Organizer(organizer) {
    this.organizerId = organizer.organizer_id
    this.name = organizer.name
    this.imageUrl = organizer.image_url
}

Organizer.prototype.Build = function() {
    this.organizer = MakeElement("organizer", null, {id: `organizer-${this.organizerId}`})

    let organizerImage = MakeElement("organizer-image", this.organizer)
    this.organizerImage = MakeElement("", organizerImage, {src: this.imageUrl}, "img")

    let organizerMain = MakeElement("organizer-main", this.organizer)
    this.organizerName = MakeElement("organizer-name", organizerMain, {innerText: this.name})

    let organizerMenu = MakeElement("organizer-menu", this.organizer)
    let verticalHam = MakeElement("vertical-ham", organizerMenu, {innerHTML: "<div></div><div></div><div></div>"})
    verticalHam.addEventListener("click", () => infos.Show(`organizer-${this.organizerId}-info`))

    return this.organizer
}

Organizer.prototype.BuildInfo = function() {
    let info = MakeElement("info", null, {id: `organizer-${this.organizerId}-info`})

    if (this.organizerId === "add") {
        MakeElement("info-header", info, {innerText: "Добавление организатора"}, "h2")
    }

    let organizerImage = MakeElement("organizer-image", info)
    this.infoImage = MakeElement("", organizerImage, {src: this.imageUrl}, "img")

    let organizerInputs = MakeElement("organizer-inputs", info)

    let nameInput = MakeIconInput(organizerInputs, ORGANIZER_NAME_ICON, `organizer-${this.organizerId}-name`, "basic-input", {placeholder: "название", type: "text", value: this.name})

    let buttons = MakeElement("organizer-buttons", organizerInputs)

    if (this.organizerId === "add") {
        let addButton = MakeElement("basic-button gradient-button", buttons, {innerText: "Добавить"}, "button")
        addButton.addEventListener("click", () => this.Add(info))
    }
    else {
        this.imageInput = MakeElement("organizer-file-input", info, {type: "file", "accept": "image/*"}, "input")
        this.imageInput.addEventListener("change", (e) => this.UpdateImage())
        this.infoImage.addEventListener("click", () => this.imageInput.click())

        for (let input of [nameInput])
            input.addEventListener("change", () => this.Update(info))

        let removeButton = MakeElement("basic-button gradient-button", buttons, {innerText: "Удалить"}, "button")
        removeButton.addEventListener("click", () => this.Remove(info))
    }

    return info
}

Organizer.prototype.GetUpdateParams = function() {
    let name = GetTextInput(`organizer-${this.organizerId}-name`, "Название организатора не заполнено")
    if (name === null)
        return null

    return {
        organizer_id: this.organizerId,
        name: name,
        image_url: this.imageUrl
    }
}

Organizer.prototype.Update = function(info) {
    let params = this.GetUpdateParams()
    if (params === null)
        return

    let buttons = info.getElementsByTagName("button")
    Disable(buttons)

    SendRequest("/update-organizer", params).then(response => {
        Enable(buttons)

        if (response.status != SUCCESS_STATUS) {
            ShowNotification(`Не удалось обновить место "${this.name}".<br><b>Причина</b>: ${response.message}`, "error-notification")
            return
        }

        ShowNotification("Организатор успешно обновлён", "success-notification")
        this.UpdateParams(response.organizer)
    })
}

Organizer.prototype.Add = function(info) {
    let params = this.GetUpdateParams()
    if (params === null)
        return

    params.organizer_id = 0

    let buttons = info.getElementsByTagName("button")
    Disable(buttons)

    SendRequest("/add-organizer", params).then(response => {
        if (response.status != SUCCESS_STATUS) {
            ShowNotification(`Не удалось добавить организатора "${params.name}".<br><b>Причина</b>: ${response.message}`, "error-notification")
            Enable(buttons)
            return
        }

        location.reload()
    })
}

Organizer.prototype.UpdateParams = function(organizer) {
    this.name = organizer.name
    this.imageUrl = organizer.image_url

    this.organizerImage.src = this.imageUrl
    this.organizerName.innerText = this.name
    this.infoImage.src = this.imageUrl
}

Organizer.prototype.Remove = function(info) {
    if (!confirm(`Вы уверены, что хотите удалить организатора "${this.name}"`))
        return

    let buttons = info.getElementsByTagName("button")
    Disable(buttons)

    SendRequest("/remove-organizer", {organizer_id: this.organizerId}).then(response => {
        if (response.status != SUCCESS_STATUS) {
            ShowNotification(`Не удалось удалить организатора "${this.name}".<br><b>Причина</b>: ${response.message}`, "error-notification")
            Enable(buttons)
            return
        }

        infos.Close()
        this.organizer.parentNode.removeChild(this.organizer)
    })
}

Organizer.prototype.UpdateImage = function() {
    if (this.imageInput.files.length != 1)
        return

    let data = new FormData()
    data.append("organizer_id", this.organizerId)
    data.append("image", this.imageInput.files[0])

    SendRequest("/update-organizer-image", data).then(response => {
        this.imageInput.value = null

        if (response.status != SUCCESS_STATUS) {
            ShowNotification(`Не удалось обновить фото организатора "${this.name}".<br><b>Причина</b>: ${response.message}`, "error-notification")
            return
        }

        ShowNotification("Фото организатора успешно обновлено", "success-notification")
        this.UpdateParams(response.organizer)
    })
}
