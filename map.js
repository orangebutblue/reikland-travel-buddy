let locations = {};
let graph = {};

document.addEventListener('DOMContentLoaded', () => {
    fetch('locations.json')
        .then(response => response.json())
        .then(data => {
            locations = data.locations;
            console.log("Locations loaded:", locations);
            populateDatalists();
            return fetch('rivers.csv');
        })
        .then(response => response.text())
        .then(data => {
            const rows = CSVToArray(data, ';');
            rows.slice(1).forEach(row => {
                if (row[0] && row[1] && row[2] && row[3]) {
                    graph[row[0]] = graph[row[0]] || [];
                    graph[row[0]].push({ to: row[1], distance: parseInt(row[2]), difficulty: parseInt(row[3]) });
                    graph[row[1]] = graph[row[1]] || [];
                    graph[row[1]].push({ to: row[0], distance: parseInt(row[2]), difficulty: parseInt(row[3]) });
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
        // Path not found: display the start and end locations
        pathDiv.innerHTML = `
            ${createLocationBox(start, locations[start] || {notes: "Location not found"})}
            <div class="has-text-centered">
                <p>x</p>
            </div>
            ${createLocationBox(end, locations[end] || {notes: "Location not found"})}
        `;
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
                const prevLoc = path[index - 1];
                pathDiv.innerHTML += createDistanceInfo(loc.distance, loc.difficulty);
            }
            pathDiv.innerHTML += createLocationBox(loc.node, locInfo);
        });

        pathDiv.innerHTML += `<div class="has-text-centered">
            <p>Total distance: ${totalDistance}</p>
        </div>`;
    }
}
