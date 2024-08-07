const PAID_GAME = "paid"
const FREE_GAME = "free"
const PASS_GAME = "pass"

function UserSelect(users, blockId, canPaid, canCount, onChange) {
    this.users = users
    this.onChange = onChange
    this.canPaid = canPaid
    this.canCount = canCount
    this.selected = []

    this.Build(blockId)
}

UserSelect.prototype.Build = function(blockId) {
    this.block = document.getElementById(blockId)
    this.block.classList.add("user-select")

    this.inputBlock = this.MakeElement("user-select-input", this.block)
    this.resultsBlock = this.MakeElement("user-select-result", this.block)

    this.BuildQuery()
    this.BuildUsers()
    this.BuildResults()
}

UserSelect.prototype.BuildQuery = function() {
    let queryBlock = this.MakeElement("user-select-query", this.inputBlock)

    this.clearBlock = this.MakeElement("user-select-query-clear user-select-query-clear-hidden", queryBlock)
    this.MakeElement("user-select-query-clear-icon", this.clearBlock)
    this.clearBlock.addEventListener("click", () => this.ClearQuery())

    this.queryInput = this.MakeElement("user-select-query-input basic-input default-input", queryBlock, {type: "text", placeholder: "начните вводить"}, "input")
    this.queryInput.addEventListener("input", () => this.FilterUsers())
}

UserSelect.prototype.BuildUsers = function() {
    let usersBlock = this.MakeElement("user-select-users", this.inputBlock)

    for (let [username, user] of Object.entries(this.users)) {
        user.block = this.BuildUser(usersBlock, user)
        user.isSelect = false
        user.paid = PAID_GAME
        user.count = 1
    }

    this.noMatches = this.MakeElement("user-select-no-matches user-select-hidden", this.inputBlock, {innerText: "никого не нашлось"})
}

UserSelect.prototype.BuildResults = function() {
    this.resultsHeader = this.MakeElement("user-select-results-header user-select-hidde", this.resultsBlock, {innerText: "Выбранные пользователи"})
    this.resultsUsersBlock = this.MakeElement("user-select-results", this.resultsBlock)

    for (let user of Object.values(this.users)) {
        let result = this.BuildResultUser(this.resultsUsersBlock, user)
        user.resultBlock = result.block
        user.resultSelect = result.select
        user.resultInput = result.input
    }

    this.noResults = this.MakeElement("user-select-no-results", this.resultsBlock, {innerText: "нет выбранных пользователей"})
}

UserSelect.prototype.BuildUser = function(parent, user) {
    let block = this.MakeElement("user-select-user", parent)
    let img = this.MakeElement("user-select-user-avatar", block, {src: user.image_src, alt: `Аватар пользователя ${user.username}`}, "img")
    let name = this.MakeElement("user-select-user-name", block, {innerText: `${user.fullname} (@${user.username})`})

    block.addEventListener("click", () => {
        this.SelectUser(user.username)
        this.onChange()
    })

    return block
}

UserSelect.prototype.BuildResultUser = function(parent, user, isResult, onclick) {
    let block = this.MakeElement("user-select-user user-select-hidden", parent)
    let img = this.MakeElement("user-select-user-avatar", block, {src: user.image_src, alt: `Аватар пользователя ${user.username}`}, "img")
    let name = this.MakeElement("user-select-user-name", block, {innerText: `${user.fullname} (@${user.username})`})

    img.addEventListener("click", () => {
        this.RemoveUser(user.username)
        this.onChange()
    })

    let paid = this.MakeElement("user-select-user-paid", name)
    let select = this.MakeElement("basic-input default-input", paid, {checked: true}, "select")

    for (let [value, text] of Object.entries({"paid": "платно", "pass": "проходка", "free": "бесплатно"}))
        this.MakeElement("", select, {value: value, innerText: text}, "option")

    let count = this.MakeElement("user-select-user-count", name)
    let input = this.MakeElement("basic-input default-input", count, {type: "number", min: 1, value: 1, step: 1, placeholder: "количество проходок"}, "input")

    if (!this.canPaid)
        paid.classList.add("user-select-hidden")

    if (!this.canCount)
        count.classList.add("user-select-hidden")

    select.addEventListener("change", () => {
        user.paid = select.value
        this.onChange()
    })

    input.addEventListener("change", () => {
        user.count = +input.value
        this.onChange()
    })

    input.addEventListener("input", () => {
        user.count = +input.value
        this.onChange()
    })

    return {"block": block, "select": select, "input": input}
}

UserSelect.prototype.ClearQuery = function() {
    this.queryInput.value = ""
    this.FilterUsers()
}

UserSelect.prototype.FilterUsers = function() {
    let query = this.queryInput.value.toLowerCase().trim()
    let translit = this.Transliterate(query)

    if (query === "")
        this.clearBlock.classList.add("user-select-query-clear-hidden")
    else
        this.clearBlock.classList.remove("user-select-query-clear-hidden")

    this.resultsUsersBlock.innerHTML = ""

    for (let username of this.selected)
        this.resultsUsersBlock.appendChild(this.users[username].resultBlock)

    let haveMatched = false
    let selectedCount = 0

    for (let user of Object.values(this.users)) {
        user.resultSelect.value = user.paid
        user.resultInput.value = user.count

        if (user.isSelect) {
            user.resultBlock.classList.remove("user-select-hidden")
            selectedCount++
        }
        else
            user.resultBlock.classList.add("user-select-hidden")

        if (!user.isSelect && this.IsUserMatch(user, [query, translit])) {
            haveMatched = true
            user.block.classList.remove("user-select-hidden")
        }
        else
            user.block.classList.add("user-select-hidden")
    }

    if (haveMatched)
        this.noMatches.classList.add("user-select-hidden")
    else
        this.noMatches.classList.remove("user-select-hidden")

    if (selectedCount > 0)
        this.noResults.classList.add("user-select-hidden")
    else
        this.noResults.classList.remove("user-select-hidden")

    this.resultsHeader.innerText = "Выбранные пользователи" + (selectedCount > 0 ? ` (${selectedCount})` : "")
}

UserSelect.prototype.IsUserMatch = function(user, queries) {
    for (let query of queries) {
        if (user.username.toLowerCase().indexOf(query) != -1)
            return true

        if (user.fullname.toLowerCase().indexOf(query) != -1)
            return true
    }

    return false
}

UserSelect.prototype.Transliterate = function(query) {
    let rus = "абвгдеёжзийклмнопрстуфхцшщю"
    let eng = "abvgdeezzijklmnoprstufhcssu"
    let map = {}

    for (let i = 0; i < rus.length; i++) {
        map[rus[i]] = eng[i]
        map[eng[i]] = rus[i]
    }

    return query.split("").map(c => c in map ? map[c] : c).join("")
}

UserSelect.prototype.SelectUser = function(username, paid = PAID_GAME, count = 1) {
    if (!this.users[username].isSelect)
        this.selected.push(username)

    this.users[username].isSelect = true
    this.users[username].paid = paid
    this.users[username].count = count

    this.FilterUsers()
}

UserSelect.prototype.RemoveUser = function(username) {
    if (this.users[username].isSelect)
        this.selected.splice(this.selected.indexOf(username), 1)

    this.users[username].isSelect = false
    this.users[username].paid = PAID_GAME
    this.users[username].count = 1

    this.FilterUsers()
}

UserSelect.prototype.GetSelected = function() {
    let selected = []

    for (let username of this.selected) {
        let value = {username: username, paid: this.canPaid ? this.users[username].paid : PAID_GAME}

        if (this.canCount)
            value.count = this.users[username].count

        selected.push(value)
    }

    return selected
}

UserSelect.prototype.GetSelectedUsernames = function() {
    return this.selected
}

UserSelect.prototype.HaveSelected = function() {
    return this.selected.length > 0
}

UserSelect.prototype.SetAttributes = function(element, attributes) {
    if (attributes === null)
        return

    for (let [name, value] of Object.entries(attributes)) {
        if (name == "innerText")
            element.innerText = value
        else if (name == "innerHTML")
            element.innerHTML = value
        else
            element.setAttribute(name, value)
    }
}

UserSelect.prototype.MakeElement = function(className, parent = null, attributes = null, tagName = "div") {
    let element = document.createElement(tagName)

    if (className !== "")
        element.className = className

    this.SetAttributes(element, attributes)

    if (parent !== null)
        parent.appendChild(element)

    return element
}
