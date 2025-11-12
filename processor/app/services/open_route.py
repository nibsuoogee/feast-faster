from shapely.geometry import LineString
from app.config import settings
from app.constants import BUFFERED_ZONE
import openrouteservice
import geopandas as gpd


client = openrouteservice.Client(key=settings.OPEN_ROUTE_SERVICE_API_KEY)
# Current limits https://account.heigit.org/manage/key


def get_location_range(current_location, destination):
    # source: (lon, lat)
    # destination: (lon, lat)
    coords = [current_location, destination]

    # Request the route geometry
    route = client.directions(
        coordinates=coords,
        profile='driving-car',
        format='geojson'
    )

    # Extract coordinates of the route (as (lon, lat))
    route_coords = route['features'][0]['geometry']['coordinates']

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
    locations = [current_location] + [tuple(st['location']) for st in stations]

    # Call ORS Matrix API (driving duration in seconds)
    matrix = client.distance_matrix(
        locations=locations,
        profile='driving-car',
        metrics=['duration', 'distance'],
        units='km',
        sources=[0],  # only from current_location
        destinations=list(range(1, len(stations) + 1))
    )

    durations = matrix['durations'][0]
    distances = matrix['distances'][0]

    for i, r in enumerate(stations):
        r['travel_time_min'] = round(durations[i] / 60)
        r['distance_km'] = round(distances[i], 2)

    return stations
