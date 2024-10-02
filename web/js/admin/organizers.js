function LoadOrganizers(response, block) {
    for (let organizer of response.organizers) {
        organizer = new Organizer(organizer)
        block.appendChild(organizer.Build())
        infos.Add(organizer.BuildInfo())
    }

    return response.organizers.length
}

function GetResultMessage(total) {
    return GetWordForm(total, ["организатор", "организатора", "организаторов"])
}
