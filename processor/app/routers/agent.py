from app.dependencies.database import get_session
from app.services.open_route import get_location_range, get_driving_etas, RoutingServiceError
from app.services.charging_estimation import get_estimate_charging_time
from app.services.database import get_stations_from_db, get_destination
from app.models import StationRequest, ETACalculationRequest
from app.config import logger
from sqlmodel import Session
from fastapi import APIRouter, Depends, HTTPException


router = APIRouter(
    prefix="/api",
)


@router.post("/get-filtered-stations")
def get_filtered_stations(
    body: StationRequest,
    session: Session = Depends(get_session)
):
    # Get location range - by OpenRouteService
    current_location = body.current_location
    try:
        buffer_geojson = get_location_range(body.current_location, body.destination)
    except RoutingServiceError as e:
        raise HTTPException(status_code=400, detail=str(e))
    logger.info("Received buffer_geojson from OpenRouteService")

    # Get stations from database within a route
    stations = get_stations_from_db(session, buffer_geojson, body.cuisines, body.connector_type)

    # Get ETAs - by OpenRouteService
    try:
        stations_with_eta = get_driving_etas(current_location, stations)
    except RoutingServiceError as e:
        raise HTTPException(status_code=400, detail=str(e))
    logger.info("Received driving ETAa from OpenRouteService")

    # Calculate the charging time
    stations_with_charging_time = get_estimate_charging_time(body.ev_model, body.current_soc, body.current_car_range,
                                                             body.desired_soc, stations_with_eta)

    # Sort by distance
    stations_sorted = sorted(stations_with_charging_time, key=lambda x: x["distance_km"])

    return stations_sorted


@router.post("/calculate-eta")
def calculate_eta(
    body: ETACalculationRequest,
    session: Session = Depends(get_session)
):
    # Get destination station location
    destination_station = get_destination(session, body.reservation_id)

    if not destination_station:
        raise HTTPException(status_code=404, detail=f"Station not found for reservation with reservation_id {body.reservation_id}")

    # Get ETA and distance
    station_with_eta = get_driving_etas(body.current_location, [destination_station])

    return station_with_eta[0]
