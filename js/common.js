var matchStatuses = {
    "notstarted": "Not Started",
    "notcomplete": "Not Completed",
    "complete": "Final Score",
    "timetbd": "Time TBD",
    "inprogress": "Match In Progress"
    // Special case for 'settime', 'live'
}

function makeMatchCard(match, showInfo) {
    var matchId = match["id"];
    var status = match["status"];
    var competitors = match["competitors"];
    var bombs = match["bombs"];
    var eliminations = match["eliminations"];
    if (status === "complete") {
        if (eliminations === undefined || eliminations === null) {
            eliminations = [];
        } else if (eliminations.constructor !== Array) {
            eliminations = [eliminations];
        }
    }
    var winners = match["winner"];
    if (status === "complete") {
        if (winners === undefined || winners === null) {
            winners = [];
        } else if (winners.constructor !== Array) {
            winners = [winners];
        }
    }

    var competitorType;
    for (let category of categories) {
        if (category["id"] === match["category"]) {
            competitorType = category["participant-type"];
            break;
        }
    }

    // Get the displayed information by each name
    var displayedInfo = {};
    var showWinner = false;
    if (status === "complete" && bombs.length === 1) {
        showWinner = true;
        competitors = multipleSort(bombs[0]["times"], ["time-left", "-modules", "competitor"], competitors, "competitor");
        if (bombs[0]["times"][0]["time-left"] != null) {
            for (var time of bombs[0]["times"]) {
                //displayedInfo[time["competitor"]] = time["time-left"].toFixed(2);
                displayedInfo[time["competitor"]] = time["time-left"];
            }
        } else {
            for (var time of bombs[0]["times"]) {
                displayedInfo[time["competitor"]] = time["modules"];
            }
        }
    } else {
        for (var competitor of competitors) {
            displayedInfo[competitor] = 0;
        }
        if (status === "complete") {
            showWinner = true;
            for (var bomb of bombs) {
                if (displayedInfo[bomb["winner"]] === undefined) {
                    displayedInfo[bomb["winner"]] = 1;
                } else {
                    displayedInfo[bomb["winner"]] += 1;
                }
            }
        }
    }
    for (var competitor of competitors) {
        if (!(competitor in displayedInfo)) {
            displayedInfo[competitor] = "N/A";
        }
    }

    // Build the card
    if (status === "inprogress") {
       var card = $("<div>", {"class": "card match-card ip-card"});    
    } else if (status === "complete") {
        var card = $("<div>", {"class": "card match-card comp-card"});    
    } else {
       var card = $("<div>", {"class": "card bg-light match-card"});    
    }
    
    var cardBody = $("<div>", { "class": "card-body container" });
    if (showInfo) {
        let row = $("<div>", { "class": "row match-info" });
        row.append($("<a>", { "class": "col-12", "href": `matches.html#${matchId}` }).text(`${match["match-group"] || "Unsorted"} - ${match["group"] ? match["group"] : "No Group"}`));
        cardBody.append(row);
    }
    for (var competitor of competitors) {
        let row;
        if (status === "complete" && winners.includes(competitor)) {
            row = $("<div>", {"class": "row winner"});
        } else if (status === "complete" && eliminations.includes(competitor)) {
            row = $("<div>", {"class": "row eliminated"});
        } else {
            row = $("<div>", {"class": "row"});
        }
        row.append($("<a>", { "class": "col-8", "href": `${competitorType}s.html#${competitor}` }).text(competitor));
        row.append($("<a>", {"class": "col-4 score", "href": `matches.html#${matchId}`}).text(displayedInfo[competitor]));
        cardBody.append(row);
    }
    var row = $("<div>", {"class": "row last-row"});
    row.append($("<a>", {"class": "col-4 link", "href": `matches.html#${matchId}`}).text("Details"));
    var link = $("<a>", {"class": "col-8 date"});
    if (status in matchStatuses) {
        link.text(matchStatuses[status]);
    } else if (status === "settime") {
        link.text(match["date"]);
    } else if (status === "live") {
        if (match["stream-url"]) {
            link.attr("href", match["stream-url"]);
        }
        link.text("Currently Live");
    }
    row.append(link);
    cardBody.append(row);

    card.append(cardBody);
    return card;
    // TODO: Show Info (Match id, week, group, etc)
}

function makePlayerCard(p) {
    //$("<li>").append($("<a>", { href: `#${player["name"]}` }).text(player["name"]))
    let player = p;
    var card = $("<a>", { href: `#${player["name"]}`, class: "player-listing bg-light col-12 col-sm-6 col-md-4 col-lg-3" });
    var categoryList = $("<div>");
    for (var category of player["categories"]) {
        var ctg = categories.filter(c => c.id === category)[0];
        categoryList.append($("<span>").text(ctg["shorthand"] + " "));
    }
    for (var category of player["eliminated-categories"]) {
        var ctg = categories.filter(c => c.id === category)[0];
        categoryList.append($("<span>", { class: "eliminated" }).text(ctg["shorthand"] + " "));
    }
    card.append($("<div>", { class: "name" }).text(`${player["name"]}`));
    card.append(categoryList);
    return card;
}

function encodeModuleName(name) {
    var temp = name.replace("'", ".ap.");
    var encodedName = encodeURI(temp);
    var result = encodedName.replace(".ap.", "%E2%80%99");
    return result;
}

function dynamicSort(property) {
    var sortOrder = 1;

    if (property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }

    return function (a, b) {
        if (sortOrder == -1) {
            return b[property].localeCompare(a[property]);
        } else {
            return a[property].localeCompare(b[property]);
        }
    }
}

function timeSort(property) {
    let sortOrder = -1;

    if (property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }

    return function(a, b) {
        let maxLength = a[property].replace(/:|\./, "").length;
        if (b[property].replace(/:|\./, "").length > maxLength) maxLength = b[property].replace(/:|\./, "").length;
        if (sortOrder === -1) {
            return b[property].replace(/:|\./, "").padStart(maxLength, '0').localeCompare(a[property].replace(/:|\./, "").padStart(maxLength, '0'))
        } else {
            return a[property].replace(/:|\./, "").padStart(maxLength, '0').localeCompare(b[property].replace(/:|\./, "").padStart(maxLength, '0'))
        }
    }    
}

function multipleSort(objList, properties, listToSort, keyToSortBy) {
    if (listToSort === null || listToSort === undefined) {
        listToSort = objList;
        keyToSortBy = null;
    }
    let newList = objList.slice(0);
    newList.sort(
        function(a, b) {
            let res = 0;
            for (let property of properties) {
                if (property.includes("time-left")) {
                    res = timeSort(property)(a, b);
                } else {
                    res = dynamicSort(property)(a, b);
                }
                if (res) break;
            }
            return res;
        }
    );
    let result = [];
    if (keyToSortBy !== null) {
        for (let obj of newList) {
            result.push(obj[keyToSortBy]);
        }
    } else {
        for (let obj of newList) {
            result.push(obj);
        }
    }
    return result;
}

var categories;
var matches;
var players;
var teams;
var bombTemplates;

$(function(){
    // Load navbar
    $("#navbar-placeholder").load("https://raw.githubusercontent.com/KTANECommunity/KTANELeagueSeason2Brackets/master/nav.html");

    /*
    var json = $.getJSON("https://raw.githubusercontent.com/KTANECommunity/KTANELeagueSeason2Brackets/master/ktane-league.json").then(
        function (data, status, jqXHR) {
            categories = data["categories"];
            matches = data["matches"];
            players = data["players"];
            teams = data["teams"];
            setupPage();
        }
    );
    */

    var dataCount = 5;
    $.getJSON("https://raw.githubusercontent.com/KTANECommunity/KTANELeagueSeason2Brackets/master/data/players.json").then(function(data, status, jqXHR) {
        players = data["players"];
        if (--dataCount === 0) setupPage();
    });
    $.getJSON("https://raw.githubusercontent.com/KTANECommunity/KTANELeagueSeason2Brackets/master/data/teams.json").then(function(data, status, jqXHR) {
        teams = data["teams"];
        if (--dataCount === 0) setupPage();
    });
    $.getJSON("https://raw.githubusercontent.com/KTANECommunity/KTANELeagueSeason2Brackets/master/data/categories.json").then(function(data, status, jqXHR) {
        categories = data["categories"];
        if (--dataCount === 0) setupPage();
    });
    $.getJSON("https://raw.githubusercontent.com/KTANECommunity/KTANELeagueSeason2Brackets/master/data/matches.json").then(function(data, status, jqXHR) {
        matches = data["matches"];
        if (--dataCount === 0) setupPage();
    });
    $.getJSON("https://raw.githubusercontent.com/KTANECommunity/KTANELeagueSeason2Brackets/master/data/bomb-templates.json").then(function(data, status, jqXHR) {
        bombTemplates = data["bomb-templates"];
        if (--dataCount === 0) setupPage();
    });
});
