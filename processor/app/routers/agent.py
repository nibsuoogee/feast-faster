from app.dependencies.database import get_session
from app.services.open_route import get_location_range, get_driving_etas
from app.services.charging_estimation import get_estimate_charging_time
from app.models import Station, StationRequest, StationRequestMock
from app.constants import MINIMUM_SOC_AT_ARRIVAL
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select
from fastapi import APIRouter, Depends, HTTPException
from geoalchemy2 import functions as func
from geoalchemy2.shape import to_shape


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
    current_location = body.current_location
    buffer_geojson = get_location_range(body.current_location, body.destination)

    # Get stations from database within a route
    polygon = buffer_geojson.geometry.unary_union
    buffer_wkt = polygon.wkt

    # Pre-filter by bounding box to make the query faster
    minx, miny, maxx, maxy = polygon.bounds

    stmt = (
        select(Station)
        .options(
            selectinload(Station.restaurants),
            selectinload(Station.chargers)
        )
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

    stations = session.exec(stmt).all()

    # Post-filter restaurants and chargers for each station in python memory
    filtered_stations = []
    for st in stations:
        filtered_restaurants = [
            {
                "restaurant_id": r.restaurant_id,
                "name": r.name,
                "address": r.address,
                "cuisines": r.cuisines
            } for r in st.restaurants
            if any(cuisine in body.cuisines for cuisine in r.cuisines)
        ]

        if len(filtered_restaurants) == 0:
            continue

        filtered_chargers = [
            {
                "charger_id": c.charger_id,
                "status": c.status,
                "type": c.connector_type,
                "max_power": c.power
            } for c in st.chargers
            if c.connector_type == body.connector_type and c.status == "available"
        ]

        if len(filtered_chargers) == 0:
            continue

        filtered_stations.append({
            "station_id": st.station_id,
            "name": st.name,
            "address": st.address,
            "location": (to_shape(st.location).x, to_shape(st.location).y),
            "restaurants": filtered_restaurants,
            "chargers": filtered_chargers
        })

    # Get ETAs - by open route
    stations_with_eta = get_driving_etas(current_location, filtered_stations)

    available_stations = []

    # Filter out stations that are too far
    # Calculate SoC decrease rate
    soc_rate = body.current_soc / body.current_car_range  # % decrease by 1 km

    for st in stations_with_eta:
        st.pop("location", None)  # Remove location as we no longer need it
        # Calculate SoC at arrival
        soc_at_arrival = round(body.current_soc - soc_rate * st['distance_km'], 2)

        # If soc_at_arrival is less than minimum, continue MINIMUM_SOC_AT_ARRIVAL
        if soc_at_arrival < MINIMUM_SOC_AT_ARRIVAL:
            continue

        st['soc_at_arrival'] = soc_at_arrival
        available_stations.append(st)

    # Calculate how long will the charge take
    available_stations = get_estimate_charging_time(body.ev_model, body.desired_soc, available_stations)

    # Sort by distance
    stations_sorted = sorted(available_stations, key=lambda x: x["distance_km"])

    return stations_sorted
