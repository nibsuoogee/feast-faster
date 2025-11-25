from shapely.geometry import LineString
from app.config import settings
from app.constants import BUFFERED_ZONE
import openrouteservice
from openrouteservice import exceptions
import geopandas as gpd


client = openrouteservice.Client(key=settings.OPEN_ROUTE_SERVICE_API_KEY)
# Current limits https://account.heigit.org/manage/key


class RoutingServiceError(Exception):
    """Custom exception for routing errors."""
    pass


def get_location_range(current_location, destination):
    # source: (lon, lat)
    # destination: (lon, lat)
    coords = [current_location, destination]

    # Request the route geometry
    try:
        route = client.directions(
            coordinates=coords,
            profile="driving-car",
            format="geojson"
        )
    except exceptions.ApiError as e:
        raise RoutingServiceError(f"OpenRouteService API error: {str(e)}")
    except Exception as e:
        raise RoutingServiceError(f"Unexpected error: {str(e)}")

    # Extract coordinates of the route (as (lon, lat))
    route_coords = route["features"][0]["geometry"]["coordinates"]

    # Convert route to a LineString
    line = LineString(route_coords)

    # ORS coordinates are in lon/lat, so first project to metric (meters) CRS
    gdf = gpd.GeoDataFrame(geometry=[line], crs="EPSG:4326")
    gdf = gdf.to_crs(epsg=3857)  # Web Mercator, in meters

    buffered = gdf.buffer(BUFFERED_ZONE)  # BUFFERED_ZONE m each side

    # Convert back to lat/lon
    buffered = gpd.GeoDataFrame(geometry=buffered, crs="EPSG:3857").to_crs(epsg=4326)

    return buffered  # min_lon, min_lat, max_lon, max_lat


def get_driving_etas(current_location, stations):
    locations = [current_location] + [tuple(st["location"]) for st in stations]  # todo refactor " -> ""

    # Call ORS Matrix API (driving duration in seconds)
    try:
        matrix = client.distance_matrix(
            locations=locations,
            profile="driving-car",
            metrics=["duration", "distance"],
            units="km",
            sources=[0],  # only from current_location
            destinations=list(range(1, len(stations) + 1))
        )
    except exceptions.ApiError as e:
        raise RoutingServiceError(f"OpenRouteService API error: {str(e)}")
    except Exception as e:
        raise RoutingServiceError(f"Unexpected error: {str(e)}")

    durations = matrix["durations"][0]
    distances = matrix["distances"][0]

    for i, r in enumerate(stations):
        r["travel_time_min"] = round(durations[i] / 60)
        r["distance_km"] = round(distances[i], 2)

    return stations


def get_route_locations(source, destination, interval_min):
    # source: (lon, lat)
    # destination: (lon, lat)
    coords = [source, destination]

    # Request the route geometry
    try:
        route = client.directions(
            coordinates=coords,
            profile="driving-car",
            format="geojson"
        )
    except exceptions.ApiError as e:
        raise RoutingServiceError(f"OpenRouteService API error: {str(e)}")
    except Exception as e:
        raise RoutingServiceError(f"Unexpected error: {str(e)}")
    
    geometry = route["features"][0]["geometry"]["coordinates"]
    steps = route["features"][0]["properties"]["segments"][0]["steps"]
    interval_sec = interval_min * 60
    current_time = 0
    next_sample_time = 0
    # Expand geometry into a time-stamped polyline
    expanded = []  # items in form (lon, lat, cumulative_time_sec)
    for step in steps:
        start_idx, end_idx = step["way_points"]
        step_coords = geometry[start_idx:end_idx + 1]
        duration = step["duration"]  # seconds

        # Evenly distribute time across step geometry
        if len(step_coords) > 1:
            per_segment_time = duration / (len(step_coords) - 1)
        else:
            per_segment_time = duration

        for _, (lon, lat) in enumerate(step_coords):
            expanded.append((lon, lat, current_time))
            current_time += per_segment_time

    # Now sample every X minutes
    samples = []
    ptr = 0

    while next_sample_time <= expanded[-1][2]:
        # Move pointer until reaching time >= next_sample_time
        while ptr < len(expanded) - 1 and expanded[ptr][2] < next_sample_time:
            ptr += 1

        lon, lat, _ = expanded[ptr]
        samples.append({
            "lat": lat,
            "lon": lon,
            "time_min": round(next_sample_time / 60)
        })

        next_sample_time += interval_sec

    return samples
