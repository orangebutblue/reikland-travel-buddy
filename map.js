let locations = {};
let graph = {};

document.addEventListener('DOMContentLoaded', () => {
    fetch('locations.json')
        .then(response => response.json())
        .then(data => {
            locations = data.locations; // Adjust to access nested locations object
            console.log("Locations loaded:", locations);
            populateDatalists();
            return fetch('rivers.csv');
        })
        .then(response => response.text())
        .then(data => {
            const rows = CSVToArray(data, ';');
            rows.slice(1).forEach(row => {
                if (row[0] && row[1] && row[2] && row[3]) { // Ensure no empty values
                    graph[row[0]] = graph[row[0]] || [];
                    graph[row[0]].push({ to: row[1], distance: parseInt(row[2]), difficulty: parseInt(row[3]) });
                    graph[row[1]] = graph[row[1]] || [];
                    graph[row[1]].push({ to: row[0], distance: parseInt(row[2]), difficulty: parseInt(row[3]) });  // Assuming undirected roads
                }
            });
            console.log("Graph:", graph);
        })
        .catch(error => console.error('Error loading data:', error));
});

function populateDatalists() {
    const startDatalist = document.getElementById('start-locations');
    const endDatalist = document.getElementById('end-locations');
    for (const location in locations) {
        const option = document.createElement('option');
        option.value = location;
        startDatalist.appendChild(option);
        endDatalist.appendChild(option.cloneNode(true));
    }
}

function findPath() {
    const start = document.getElementById('start').value;
    const end = document.getElementById('end').value;
    const pathResult = dijkstra(graph, start, end);
    printPath(pathResult, start, end);
}

function printPath(pathResult, start, end) {
    const path = pathResult.path;
    const totalDistance = pathResult.totalDistance;
    const pathDiv = document.getElementById('path');
    pathDiv.innerHTML = '';

    if (path.length === 0) {
        pathDiv.innerHTML = `No path found from ${start} to ${end}`;
    } else {
        console.log("Path found:", path);
        path.forEach((loc, index) => {
            if (!locations[loc.node]) {
                console.error(`Location not found: ${loc.node}`);
                pathDiv.innerHTML += `<div class="notification is-danger">Location not found: ${loc.node}</div>`;
                return;
            }
            const locInfo = locations[loc.node];
            if (index > 0) {
                pathDiv.innerHTML += createDistanceInfo(loc.distance, loc.difficulty);
            }
            pathDiv.innerHTML += createLocationBox(loc.node, locInfo);
        });

        pathDiv.innerHTML += `<div class="has-text-centered">
            <p>Total distance: ${totalDistance}</p>
        </div>`;
    }
}

function createTableRow(header, value) {
    return `
        <tr>
            <th>${header}</th>
            <td>${value}</td>
        </tr>`;
}

function createLocationDetails(locInfo) {
    const garrison = locInfo.garrison !== '-' ? locInfo.garrison : 'None';
    const militia = locInfo.militia !== '-' ? locInfo.militia : 'None';

    return `
        <table class="table is-fullwidth">
            <tbody>
                ${createTableRow('Size', `<a href="#" onclick="filterLocations('size', '${locInfo.size}')">${locInfo.size}</a>`)}
                ${createTableRow('Ruler', `<a href="#" onclick="filterLocations('ruler', '${locInfo.ruler}')">${locInfo.ruler}</a>`)}
                ${createTableRow('Population', locInfo.population)}
                ${createTableRow('Wealth', locInfo.wealth)}
                ${createTableRow('Source', locInfo.source.map(src => `<a href="#" onclick="filterLocations('source', '${src}')">${src}</a>`).join(', '))}
                ${createTableRow('Garrison', garrison)}
                ${createTableRow('Militia', militia)}
                ${createTableRow('Fief', locInfo.fief)}
                ${createTableRow('Notes', locInfo.notes)}
            </tbody>
        </table>`;
}


function createLocationBox(loc, locInfo) {
    return `
        <div class="box">
            <article class="message">
                <div class="message-header" onclick="toggleDetails('${loc}')">
                    <p>${loc}</p>
                </div>
                <div id="details-${loc}" class="message-body" style="display: none;">
                    ${createLocationDetails(locInfo)}
                </div>
            </article>
        </div>`;
}

function createDistanceInfo(distance, difficulty) {
    return `
        <div class="has-text-centered">
            <p>distance: ${distance}, difficulty: ${difficulty}</p>
            <p>v</p>
        </div>`;
}

function toggleDetails(id) {
    const details = document.getElementById(`details-${id}`);
    if (details.style.display === "none") {
        details.style.display = "block";
    } else {
        details.style.display = "none";
    }
}

function filterLocations(attribute, value) {
    const pathDiv = document.getElementById('path');
    pathDiv.innerHTML = '';

    Object.keys(locations).forEach(loc => {
        const locInfo = locations[loc];
        if (attribute === 'source') {
            if (!locInfo.source.includes(value)) return;
        } else if (locInfo[attribute] !== value) {
            return;
        }

        const locDetails = `
            <div class="box">
                <article class="message">
                    <div class="message-header" onclick="toggleDetails('${loc}')">
                        <p>${loc}</p>
                    </div>
                    <div id="details-${loc}" class="message-body" style="display: none;">
                        ${createLocationDetails(locInfo)}
                    </div>
                </article>
            </div>`;
        pathDiv.innerHTML += locDetails;
    });
}

// Utility function to parse CSV data
function CSVToArray(strData, strDelimiter = ',') {
    const objPattern = new RegExp((
        `(${strDelimiter}|\\r?\\n|\\r|^)` +
        `(?:"([^"]*(?:""[^"]*)*)"|([^"\\${strDelimiter}\\r\\n]*))`
    ), "gi");

    const arrData = [[]];
    let arrMatches = null;

    while (arrMatches = objPattern.exec(strData)) {
        const strMatchedDelimiter = arrMatches[1];

        if (strMatchedDelimiter.length && strMatchedDelimiter !== strDelimiter) {
            arrData.push([]);
        }

        const strMatchedValue = arrMatches[2] ?
            arrMatches[2].replace(new RegExp('""', 'g'), '"') :
            arrMatches[3];

        arrData[arrData.length - 1].push(strMatchedValue);
    }

    return arrData;
}
