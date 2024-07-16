let locations = {};
let graph = {};
let seasonalPrices = {};
let goodsList = [];

document.addEventListener('DOMContentLoaded', () => {
    Promise.all([
        fetch('data/locations.json').then(response => response.json()),
        fetch('data/rivers.csv').then(response => response.text()),
        fetch('data/seasonal_prices.csv').then(response => response.text())
    ])
        .then(([locationsData, riversData, seasonalPricesData]) => {
            locations = locationsData.locations;
            console.log("Locations loaded:", locations);
            populateDatalists();

            const riverRows = CSVToArray(riversData, ';');
            riverRows.slice(1).forEach(row => {
                if (row[0] && row[1] && row[2] && row[3]) {
                    graph[row[0]] = graph[row[0]] || [];
                    graph[row[0]].push({ to: row[1], distance: parseInt(row[2]), difficulty: parseInt(row[3]) });
                    graph[row[1]] = graph[row[1]] || [];
                    graph[row[1]].push({ to: row[0], distance: parseInt(row[2]), difficulty: parseInt(row[3]) });
                }
            });
            console.log("Graph:", graph);

            const seasonalRows = CSVToArray(seasonalPricesData, ';');
            seasonalRows.slice(1).forEach(row => {
                const [good, spring, summer, autumn, winter] = row;
                seasonalPrices[good.toLowerCase()] = {
                    spring: parseFloat(spring),
                    summer: parseFloat(summer),
                    autumn: parseFloat(autumn),
                    winter: parseFloat(winter)
                };
                goodsList.push(good);
            });
            console.log("Seasonal Prices:", seasonalPrices);
            console.log("Goods List:", goodsList);
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
