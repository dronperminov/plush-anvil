function GetParams() {
    return {}
}

function LoadTeamActivity(response, block) {
    console.log("team activity", response)
    let yearGrid = new YearGrid(block, response.team_activity, {})
}
