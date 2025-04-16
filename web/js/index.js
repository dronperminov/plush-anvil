function GetScheduleParams() {
    return schedule.GetDate()
}

function StepSchedule(step) {
    schedule.GetDate(step)
    scheduleLoader.Load()
}

function LoadSchedule(response, block) {
    schedule.Build(block, response.schedule)
    schedule.Resize()
}
