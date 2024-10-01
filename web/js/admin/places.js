function LoadPlaces(response, block) {
    for (let place of response.places) {
        place = new Place(place)
        block.appendChild(place.Build())
        infos.Add(place.BuildInfo())
    }

    return response.places.length
}

function GetResultMessage(total) {
    return GetWordForm(total, ["место", "места", "мест"])
}
