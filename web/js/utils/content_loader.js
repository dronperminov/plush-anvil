function ContentLoader(config) {
    let block = document.getElementById(config.blockId)

    this.loader = block.children[0]
    this.block = block.children[1]

    this.url = config.url
    this.getParams = config.getParams || null
    this.onLoad = config.onLoad
    this.clearBeforeLoad = config.clearBeforeLoad || false

    if (config.load)
        this.Load()
}

ContentLoader.prototype.Load = function() {
    let params = this.getParams === null ? {} : this.getParams()
    if (params === null)
        return

    if (this.clearBeforeLoad)
        this.Clear()

    this.loader.classList.remove("hidden")

    SendRequest(this.url, params).then(response => {
        if (response.status != SUCCESS_STATUS) {
            ShowNotification(`Не удалось загрузить данные<br><b>Причина</b>: ${response.message}`, "error-notification", 3500)
            setTimeout(() => this.Load(), 3000)
            return
        }

        this.Reset()
        this.onLoad(response, this.block)
    })
}

ContentLoader.prototype.Clear = function() {
    this.block.innerHTML = ""
}

ContentLoader.prototype.Reset = function() {
    this.Clear()
    this.loader.classList.add("hidden")
}
