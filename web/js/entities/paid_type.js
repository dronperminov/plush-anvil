function PaidType(value) {
    this.value = value
    this.value2rus = {
        "paid": "платно", 
        "free": "бесплатно", 
        "stickers": "за наклейки", 
    }
}

PaidType.prototype.ToRus = function() {
    return this.value2rus[this.value]
}
