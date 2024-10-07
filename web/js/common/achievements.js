function GetParams() {
    return {}
}

function LoadAchievements(response, block) {
    for (let achievement of response.achievements) {
        achievement = new Achievement(achievement)
        block.appendChild(achievement.Build())
    }

    return response.achievements.length
}
