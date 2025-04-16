class BirthDateInput {
    constructor(dayInput, monthInput, config) {
        this.dayInput = dayInput
        this.monthInput = monthInput
        this.dayInput.addEventListener("input", () => this.ClearError())
        this.monthInput.addEventListener("input", () => this.ClearError())
        this.config = config
        this.month2days = {1: 31, 2: 29, 3: 31, 4: 30, 5: 31, 6: 30, 7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31}
    }

    GetValue() {
        let day = +this.dayInput.value
        let month = +this.monthInput.value
        return this.Validate(day, month)
    }

    Validate(day, month) {
        if (day < 1 || day > this.month2days[month]) {
            this.Error(`День рождения не может быть числом больше ${this.month2days[+month]}`)
            return null
        }

        this.ClearError()
        return {day: day, month: month}
    }

    Error(message = "") {
        if (message)
            ShowNotification(message, "error-notification", 3000)

        this.dayInput.classList.add("error-input")
        this.monthInput.classList.add("error-input")
        this.dayInput.focus()
    }

    ClearError() {
        this.dayInput.classList.remove("error-input")
        this.monthInput.classList.remove("error-input")
    }
}
