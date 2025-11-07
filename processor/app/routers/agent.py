from app.dependencies.database import get_session
from app.services.open_route import get_location_range
from app.models import Station, Restaurant, StationRequest, StationRequestMock
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select
from fastapi import APIRouter, Depends, HTTPException
from geoalchemy2 import functions as func


router = APIRouter(
    prefix="/api",
)


@router.post("/stations-restaurants-MOCK")
async def get_stations_restaurants_(
    body: StationRequestMock,
    session: Session = Depends(get_session)
):
    # Select first 2 stations, eagerly loading their restaurants
    statement = (
        select(Station)
        .options(selectinload(Station.restaurants))
        .limit(2)
    )

    result = session.exec(statement).all()

    # Format nicely for the API response
    data = []
    for station in result:
        data.append({
            "station_id": station.station_id,
            "name": station.name,
            "address": station.address,
            "travel_time_min": 67,
            "distance_km": 102,
            "soc_at_arrival": 33,
            "estimate_charging_time_min": 45,
            "chargers": [
                {
                    "charger_id": 1,
                    "status": "available",
                    "type": "CCS",
                    "max_power": 50
                },
                {
                    "charger_id": 2,
                    "status": "unavailable",
                    "type": "CHAdeMO",
                    "max_power": 100
                }
            ],
            "restaurants": [
                {
                    "restaurant_id": r.restaurant_id,
                    "name": r.name,
                    "address": r.address,
                    "cuisines": r.cuisines
                }
                for r in station.restaurants
            ]
        })

    return data


@router.post("/get-filtered-stations")
def get_stations(
    body: StationRequest,
    session: Session = Depends(get_session)
):

    # Get location range - client
    buffer_geojson = get_location_range(body.current_location, body.destination)

    # Get stations from database + restaurants + chargers
    polygon = buffer_geojson.geometry.unary_union
    buffer_wkt = polygon.wkt

    # Pre-filter by bounding box to make the query faster
    minx, miny, maxx, maxy = polygon.bounds

    stmt = (
        select(Station)
        .where(
            func.ST_Intersects(
                Station.location,
                func.ST_GeogFromText(buffer_wkt)
            )
        )
        .where(
            func.ST_MakeEnvelope(minx, miny, maxx, maxy, 4326).op("&&")(Station.location)
        )
    )

    stations_inside = session.exec(stmt).all()

    for station in stations_inside:
        print(station.station_id, station.name, station.location)

    # Get ETAs
    # TODO
