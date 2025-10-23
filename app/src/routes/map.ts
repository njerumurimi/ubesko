import * as turf from "@turf/turf";
import polyline from "@mapbox/polyline";

export type Graph = Record<string, Set<string>>;

export type RouteGraphResult = {
    routeCoords: [number, number][]; // decoded [lon, lat]
    bbox: [number, number, number, number]; // [west, south, east, north]
    graph: Graph;
    overpassRaw: any;
};

/**
 * Build a connected graph of roads around the route between two points.
 *
 * 1️⃣ Fetch route from Google Directions API
 * 2️⃣ Decode polyline
 * 3️⃣ Buffer route area (default: 2 km)
 * 4️⃣ Fetch nearby roads via Overpass API
 * 5️⃣ Build adjacency graph of intersections
 */
export async function buildRouteGraph(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
    googleApiKey: string,
    bufferKm = 2
): Promise<RouteGraphResult> {
    // Step 1: Get route from Google Directions API
    const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${lat1},${lon1}&destination=${lat2},${lon2}&key=${googleApiKey}`;

    const directionsRes = await fetch(directionsUrl);
    if (!directionsRes.ok) throw new Error("Failed to fetch directions");
    const directionsData = await directionsRes.json();

    if (!directionsData.routes?.length)
        throw new Error("No routes found in Google Directions response");

    const overviewPoints = directionsData.routes[0].overview_polyline.points;

    // Step 2: Decode route → list of [lon, lat]
    const decodedCoords = polyline
        .decode(overviewPoints)
        .map(([lat, lon]) => [lon, lat]) as [number, number][];

    // Step 3: Create a buffer around the route
    const line = turf.lineString(decodedCoords);
    const buffered = turf.buffer(line, bufferKm, { units: "kilometers" });

    // Step 4: Get bounding box
    const [west, south, east, north] = turf.bbox(buffered);

    // Step 5: Query Overpass API for roads within bounding box
    const overpassQuery = `
    [out:json][timeout:25];
    (
      way["highway"](${south},${west},${north},${east});
    );
    out geom;
  `;

    const overpassRes = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: overpassQuery,
    });

    if (!overpassRes.ok) throw new Error("Failed to fetch Overpass data");
    const overpassData = await overpassRes.json();

    // Step 6: Build adjacency graph of roads
    const graph: Graph = {};

    for (const el of overpassData.elements) {
        if (el.type === "way" && el.geometry) {
            const points = el.geometry.map((g: any) => `${g.lat},${g.lon}`);

            for (let i = 0; i < points.length - 1; i++) {
                const a = points[i];
                const b = points[i + 1];
                if (!graph[a]) graph[a] = new Set();
                if (!graph[b]) graph[b] = new Set();
                graph[a].add(b);
                graph[b].add(a);
            }
        }
    }

    // ✅ Return all results
    return {
        routeCoords: decodedCoords,
        bbox: [west, south, east, north],
        graph,
        overpassRaw: overpassData,
    };
}
