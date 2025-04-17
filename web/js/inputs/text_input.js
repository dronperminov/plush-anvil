class TextInput {
    constructor(input, config) {
        this.input = input
        this.input.addEventListener("input", () => this.ClearError())
        this.config = config

        if (this.config.change)
            this.input.addEventListener("change", this.config.change)
    }

    GetValue() {
        let value = this.input.value.trim()
        return this.Validate(value)
    }

    SetValue(value) {
        this.input.value = value
    }

    Blur() {
        this.input.blur()
    }

    Focus() {
        this.input.focus()
    }

    Validate(value) {
        if (this.config.empty && value === "") {
            this.Error(this.config.empty)
            return null
        }

        if (this.config.regexp && value.match(this.config.regexp.expression) === null) {
            this.Error(this.config.regexp.error)
            return null
        }

        if (this.config.exclude && new Set(this.config.exclude.values).has(value.toLowerCase())) {
            this.Error(this.config.exclude.error)
            return null
        }

        this.ClearError()
        return value
    }

    Clear() {
        this.input.value = ""
        this.ClearError()
    }

    Error(message = "") {
        if (message)
            ShowNotification(message, "error-notification", 3000)

        this.input.classList.add("error-input")
        this.Focus()
    }

    ClearError() {
        this.input.classList.remove("error-input")
    }
}
