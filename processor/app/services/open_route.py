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
