from shapely.geometry import LineString
from app.config import settings
from app.constants import BUFFERED_ZONE
import openrouteservice
from openrouteservice import exceptions
import geopandas as gpd
from math import radians, sin, cos, sqrt, atan2


client = openrouteservice.Client(key=settings.OPEN_ROUTE_SERVICE_API_KEY)
# Current limits https://account.heigit.org/manage/key


class RoutingServiceError(Exception):
    """Custom exception for routing errors."""
    pass


def haversine(lon1, lat1, lon2, lat2):
    R = 6371.0  # Earth radius in km
    dlon = radians(lon2 - lon1)
    dlat = radians(lat2 - lat1)

    a = sin(dlat / 2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    return R * c


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
    locations = [current_location] + [tuple(st["location"]) for st in stations]

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
    current_dist = 0
    next_sample_time = 0
    # Expand geometry into a time-stamped polyline
    expanded = []  # (lon, lat, cumulative_time_sec, cumulative_dist_km)

    for step in steps:
        start_idx, end_idx = step["way_points"]
        step_coords = geometry[start_idx:end_idx + 1]
        duration = step["duration"]  # seconds

        # Evenly distribute time across step geometry
        if len(step_coords) > 1:
            per_segment_time = duration / (len(step_coords) - 1)
        else:
            per_segment_time = duration

        prev_lon, prev_lat = step_coords[0]

        # Add first point of the step
        expanded.append((prev_lon, prev_lat, current_time, current_dist))

        # Move through the rest of the coords
        for lon, lat in step_coords[1:]:
            # distance from previous point
            seg_dist = haversine(prev_lon, prev_lat, lon, lat)
            current_dist += seg_dist
            current_time += per_segment_time

            expanded.append((lon, lat, current_time, current_dist))

            prev_lon, prev_lat = lon, lat

    # Now sample every X minutes
    samples = []
    ptr = 0

    while next_sample_time <= expanded[-1][2]:
        # Move pointer until reaching time >= next_sample_time
        while ptr < len(expanded) - 1 and expanded[ptr][2] < next_sample_time:
            ptr += 1

        lon, lat, _, dist = expanded[ptr]
        samples.append({
            "lat": lat,
            "lon": lon,
            "time_min": round(next_sample_time / 60),
            "distance_km": round(dist, 3)
        })

        next_sample_time += interval_sec

    return samples
