function GetScheduleParams() {
    let year = document.getElementById("schedule-date-year").innerText
    let month = document.getElementById("schedule-date-month").innerText

    return {year: year, month: GetMonthFromRus(month)}
}

function SetScheduleParams(params) {
    let year = document.getElementById("schedule-date-year")
    let month = document.getElementById("schedule-date-month")

    year.innerText = params.year
    month.innerText = GetRusMonth(params.month).toUpperCase()
}

function StepSchedule(step) {
    let params = GetScheduleParams()
    params.month += step

    if (params.month > 12) {
        params.month = 1
        params.year++
    }
    else if (params.month < 1) {
        params.month = 12
        params.year--
    }

    let dateBlock = document.getElementById("schedule-date")
    dateBlock.classList.add("schedule-date-disabled")

    SetScheduleParams(params)
    scheduleLoader.Load()
}

function LoadSchedule(response, block) {
    SetScheduleParams(response.schedule)

    console.log(response)

    let schedule = new Schedule(response.schedule)
    schedule.Build(block)

    let dateBlock = document.getElementById("schedule-date")
    dateBlock.classList.remove("schedule-date-disabled")
}
