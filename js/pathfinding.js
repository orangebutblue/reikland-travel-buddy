class PriorityQueue {
    constructor() {
        this.elements = [];
    }

    enqueue(priority, element) {
        this.elements.push({ priority, element });
        this.elements.sort((a, b) => a.priority - b.priority);
    }

    dequeue() {
        return this.elements.shift().element;
    }

    isEmpty() {
        return this.elements.length === 0;
    }
}

function dijkstra(graph, start, end) {
    let distances = {};
    let previous = {};
    let pq = new PriorityQueue();

    for (let vertex in graph) {
        if (vertex === start) {
            distances[vertex] = 0;
            pq.enqueue(0, vertex);
        } else {
            distances[vertex] = Infinity;
        }
        previous[vertex] = null;
    }

    while (!pq.isEmpty()) {
        let current = pq.dequeue();
        if (current === end) {
            let node = end;
            let path = [];
            let totalDistance = 0;
            while (previous[node]) {
                const prevNode = previous[node];
                const edge = graph[prevNode].find(edge => edge.to === node);
                if (edge) {
                    path.unshift({ node, distance: edge.distance, difficulty: edge.difficulty });
                    totalDistance += edge.distance;
                }
                node = prevNode;
            }
            path.unshift({ node: start }); // Starting node without distance and difficulty
            return { path, totalDistance };
        }

        for (let neighbor of graph[current]) {
            let alt = distances[current] + neighbor.distance;
            if (alt < distances[neighbor.to]) {
                distances[neighbor.to] = alt;
                previous[neighbor.to] = current;
                pq.enqueue(alt, neighbor.to);
            }
        }
    }

    return { path: [], totalDistance: 0 }; // No path found
}
