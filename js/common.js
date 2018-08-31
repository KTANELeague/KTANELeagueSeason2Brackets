var matchStatuses = {
    "notstarted": "Not Started",
    "notcomplete": "Not Completed",
    "done": "Final Score",
    "timetbd": "Time TBD"
    // Special case for 'settime', 'inprogress'
}

function makeMatchCard(match, showInfo) {
    var matchId = match["id"];
    var status = match["status"];
    var competitors = match["competitors"].sort();
    var bombs = match["bombs"];
    var eliminations = match["eliminations"];
    if (eliminations === undefined || eliminations === null) {
        eliminations = [];
    } else if (eliminations.constructor !== Array) {
        eliminations = [eliminations];
    }
    var winners = match["winner"];
    if (winners === undefined || winners === null) {
        winners = [];
    } else if (winners.constructor !== Array) {
        winners = [winners];
    }

    // Get the displayed information by each name
    var displayedInfo = {};
    var showWinner = false;
    if (status === "done" && bombs.length === 1) {
        showWinner = true;
        if (bombs[0]["times"][0]["time-left"] != null) {
            for (var time of bombs[0]["times"]) {
                displayedInfo[time["competitor"]] = time["time-left"].toFixed(2);
            }
        } else {
            for (var time of bombs[0]["times"]) {
                displayedInfo[time["competitor"]] = time["modules"];
            }
        }
    } else {
        showWinner = true;
        for (var competitor of competitors) {
            displayedInfo[competitor] = 0;
        }
        for (var bomb of bombs) {
            if (displayedInfo[bomb["winner"]] === undefined) {
                displayedInfo[bomb["winner"]] = 1;
            } else {
                displayedInfo[bomb["winner"]] += 1;
            }
        }
    }
    for (var competitor of competitors) {
        if (!(competitor in displayedInfo)) {
            displayedInfo[competitor] = "N/A";
        }
    }

    // Build the card
    var card = $("<div>", {"class": "card bg-light match-card"});
    var cardBody = $("<div>", {"class": "card-body container"});
    for (var competitor of competitors) {
        let row;
        if (winners.includes(competitor)) {
            row = $("<div>", {"class": "row winner"});
        } else if (eliminations.includes(competitor)) {
            row = $("<div>", {"class": "row eliminated"});
        } else {
            row = $("<div>", {"class": "row"});
        }
        row.append($("<a>", {"class": "col-8", "href": `players#${competitor}`}).text(competitor));
        row.append($("<a>", {"class": "col-4 score", "href": `matches#${matchId}`}).text(displayedInfo[competitor]));
        cardBody.append(row);
    }
    var row = $("<div>", {"class": "row"});
    row.append($("<a>", {"class": "col-4 link", "href": `matches#${matchId}`}).text("Details"));
    var link = $("<a>", {"class": "col-8 date"});
    if (status in matchStatuses) {
        link.text(matchStatuses[status]);
    } else if (status === "settime") {
        link.text(match["date"]);
    } else if (status == "inprogress") {
        if (match["stream-url"]) {
            link.attr("href", match["stream-url"]);
        }
        link.text("Match In Progress");
    }
    row.append(link);
    cardBody.append(row);

    card.append(cardBody);
    return card;
    // TODO: Show Info (Match id, week, group, etc)
}
/*
<div class="card bg-light match-card">
            <div class="card-body container">
                <div class="row winner">
                    <a class="col-10" href="players#ZekNikZ">ZekNikZ</a>
                    <a class="col-2 score">4</a>
                </div>
                <div class="row">
                    <a class="col-10">OdderOtter</a>
                    <a class="col-2 score">3</a>
                </div>
                <div class="row eliminated">
                    <a class="col-10">Timwi</a>
                    <a class="col-2 score">2</a>
                </div>
                <div class="row">
                    <a class="col-4 link" href="matches#1234">Details</a>
                </div>
                <div class="row">
                        <a class="col-4 link" href="matches#1234">Details</a>
                        <a class="col-8 date">Not Started</a>
                    </div>
                <div class="row">
                    <a class="col-4 link" href="matches#1234">Details</a>
                    <a class="col-8 date">Not Completed</a>
                </div>
                <div class="row">
                    <a class="col-4 link" href="matches#1234">Details</a>
                    <a class="col-8 date" href="https://twitch.tv">Match in Progress</a>
                </div>
                <div class="row">
                    <a class="col-4 link" href="matches#1234">Details</a>
                    <a class="col-8 date">Final Score</a>
                </div>
                <div class="row">
                    <a class="col-4 link" href="matches#1234">Details</a>
                    <a class="col-8 date">September 16, 12:30pm</a>
                </div>
                <div class="row">
                    <a class="col-4 link" href="matches#1234">Details</a>
                    <a class="col-8 date">Time TBD</a>
                </div>
            </div>
        </div>
        */