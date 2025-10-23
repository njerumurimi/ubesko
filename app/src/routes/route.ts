import * as turf from "@turf/turf";

export interface Graph {
    [nodeId: string]: string[]; // adjacency list
}

export interface TreeNode {
    id: string;                // e.g. "lat,lon"
    coords: [number, number];  // [lon, lat] for GeoJSON consistency
    distanceFromRoute: number; // km from nearest main path node
    children: TreeNode[];      // recursive branches
}

export function buildSingleRouteTree(
    graph: Graph,
    startCoords: [number, number],  // [lon, lat] origin
    endCoords: [number, number],    // [lon, lat] destination
    depth = 2                       // expansion depth
): TreeNode | null {
    // ---- 1️⃣ Find nearest nodes to start and end ----
    function findNearestNode(point: [number, number]): string | null {
        let nearestNode = null;
        let minDistance = Infinity;

        for (const node of Object.keys(graph)) {
            const [lat, lon] = node.split(",").map(Number);
            const dist = turf.distance(turf.point(point), turf.point([lon, lat]));
            if (dist < minDistance) {
                minDistance = dist;
                nearestNode = node;
            }
        }

        return nearestNode;
    }

    const startNode = findNearestNode(startCoords);
    const endNode = findNearestNode(endCoords);
    if (!startNode || !endNode) return null;

    // ---- 2️⃣ Find main path (shortest connection) ----
    function bfsPath(start: string, end: string): string[] | null {
        const queue: string[][] = [[start]];
        const visited = new Set([start]);

        while (queue.length > 0) {
            const path = queue.shift()!;
            const node = path[path.length - 1];

            if (node === end) return path;

            for (const neighbor of graph[node] || []) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push([...path, neighbor]);
                }
            }
        }

        return null; // no path found
    }

    const mainPath = bfsPath(startNode, endNode);
    if (!mainPath) return null;

    const mainPathCoords: [number, number][] = mainPath.map(node => {
        const [lat, lon] = node.split(",").map(Number);
        return [lon, lat];
    });

    // ---- 3️⃣ Build a single recursive tree ----
    const visited = new Set(mainPath);

    function nodeToCoords(node: string): [number, number] {
        const [lat, lon] = node.split(",").map(Number);
        return [lon, lat];
    }

    function nearestMainRouteDistance(coords: [number, number]): number {
        let min = Infinity;
        const point = turf.point(coords);
        for (const routeCoord of mainPathCoords) {
            const dist = turf.distance(point, turf.point(routeCoord));
            if (dist < min) min = dist;
        }
        return min;
    }

    function expand(node: string, currentDepth: number): TreeNode {
        const coords = nodeToCoords(node);
        const children: TreeNode[] = [];

        if (currentDepth < depth) {
            const neighbors = graph[node] || [];
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    children.push(expand(neighbor, currentDepth + 1));
                }
            }
        }

        return {
            id: node,
            coords,
            distanceFromRoute: nearestMainRouteDistance(coords),
            children
        };
    }

    // ---- 4️⃣ Build tree starting at origin node ----
    return expand(startNode, 0);
}
