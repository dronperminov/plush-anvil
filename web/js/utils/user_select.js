function UserSelect(users, config) {
    this.users = users
    this.config = config
    this.onchange = null

    this.username2user = this.GetUsersDict(users)
    this.username2selected = {}
    this.username2block = {}
    this.selected = []
}

UserSelect.prototype.GetUsersDict = function(users) {
    let username2user = {}

    for (let user of users)
        username2user[user.username] = user

    return username2user
}

UserSelect.prototype.Build = function(parent) {
    let block = MakeElement("user-select", parent)

    let filter = MakeElement("user-select-filter", block)
    let clearIcon = MakeElement("user-select-clear", filter)
    let queryBlock = MakeElement("user-select-query", filter)
    let query = MakeElement("basic-input", queryBlock, {type: "text", placeholder: "начните писать"}, "input")

    this.usersBlock = MakeElement("user-select-users", block)

    for (let user of this.users)
        this.username2block[user.username] = this.BuildUser(user)

    query.addEventListener("input", () => this.QueryInput(query, clearIcon))
    clearIcon.addEventListener("click", () => this.ClearQuery(query, clearIcon))
}

UserSelect.prototype.BuildUser = function(user) {
    let block = MakeElement("user-select-user", this.usersBlock)
    let avatar = MakeElement("user-select-avatar", block)
    MakeElement("", avatar, {src: user.avatarUrl}, "img")
    MakeElement("user-select-selected-count", avatar, {innerText: 0})

    let name = MakeElement("user-select-username", block, {innerText: `${user.fullname} (@${user.username})`})

    if (this.config.multiple) {
        name.addEventListener("click", () => this.SelectUser(user.username))
        avatar.addEventListener("click", () => this.UnselectUser(user.username))
    }
    else {
        block.addEventListener("click", () => this.ToggleUser(user.username))
    }

    return block
}

UserSelect.prototype.QueryInput = function(query, clearIcon) {
    let value = query.value.trim().toLowerCase()

    if (value !== "")
        clearIcon.classList.add("user-select-clear-showed")
    else
        clearIcon.classList.remove("user-select-clear-showed")

    for (let user of this.users) {
        if (value === "" || user.username in this.username2selected || this.IsMatch(value, user))
            this.username2block[user.username].classList.remove("hidden")
        else
            this.username2block[user.username].classList.add("hidden")
    }
}

UserSelect.prototype.ClearQuery = function(query, clearIcon) {
    query.value = ""
    this.QueryInput(query, clearIcon)
}

UserSelect.prototype.SelectUser = function(username) {
    if (username in this.username2selected) {
        if (!this.config.multiple)
            return

        this.username2selected[username] += 1
    }
    else {
        this.username2selected[username] = 1
        this.selected.push(username)
    }

    this.UpdateSelectUser(username)
}

UserSelect.prototype.UnselectUser = function(username) {
    if (!(username in this.username2selected))
        return

    this.username2selected[username] -= 1

    if (this.username2selected[username] === 0) {
        delete this.username2selected[username]
        this.selected.splice(this.selected.indexOf(username), 1)
    }

    this.UpdateSelectUser(username)
}

UserSelect.prototype.ToggleUser = function(username) {
    if (username in this.username2selected)
        this.UnselectUser(username)
    else
        this.SelectUser(username)
}

UserSelect.prototype.UpdateSelectUser = function(username) {
    let count = username in this.username2selected ? this.username2selected[username] : 0
    let block = this.username2block[username]

    if (count == 0)
        block.classList.remove("user-select-user-selected")
    else
        block.classList.add("user-select-user-selected")

    let countBlock = block.querySelector(".user-select-selected-count")
    countBlock.innerText = this.config.multiple ? count : ""

    this.SortUsers()

    if (this.onchange !== null)
        this.onchange()
}

UserSelect.prototype.SortUsers = function() {
    while (this.usersBlock.children.length > 0)
        this.usersBlock.removeChild(this.usersBlock.children[0])

    for (let username of this.selected)
        this.usersBlock.appendChild(this.username2block[username])

    for (let user of this.users)
        if (!(user.username in this.username2selected))
            this.usersBlock.appendChild(this.username2block[user.username])
}

UserSelect.prototype.IsMatch = function(query, user) {
    if (user.username.toLowerCase().indexOf(query) > -1)
        return true

    if (user.fullname.toLowerCase().indexOf(query) > -1)
        return true

    return false
}

UserSelect.prototype.GetSelected = function() {
    let selected = []

    for (let username of this.selected) {
        if (this.config.multiple)
            selected.push({username: username, count: this.username2selected[username]})
        else
            selected.push(username)
    }

    return selected
}

UserSelect.prototype.HaveSelected = function() {
    return this.selected.length > 0
}
