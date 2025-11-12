from app.dependencies.database import get_session
from app.services.open_route import get_location_range, get_driving_etas
from app.services.charging_estimation import get_estimate_charging_time
from app.services.database import get_stations_from_db
from app.models import Station, StationRequest, StationRequestMock
from app.config import logger
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select
from fastapi import APIRouter, Depends, HTTPException


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
def get_filtered_stations(
    body: StationRequest,
    session: Session = Depends(get_session)
):
    # Get location range - by OpenRouteService
    current_location = body.current_location
    buffer_geojson = get_location_range(body.current_location, body.destination)
    logger.info("Received buffer_geojson from OpenRouteService")

    # Get stations from database within a route
    stations = get_stations_from_db(session, buffer_geojson, body.cuisines, body.connector_type)

    # Get ETAs - by OpenRouteService
    stations_with_eta = get_driving_etas(current_location, stations)
    logger.info("Received driving ETAa from OpenRouteService")

    # Calculate the charging time
    stations_with_charging_time = get_estimate_charging_time(body.ev_model, body.current_soc, body.current_car_range,
                                                             body.desired_soc, stations_with_eta)

    # Sort by distance
    stations_sorted = sorted(stations_with_charging_time, key=lambda x: x["distance_km"])

    return stations_sorted
