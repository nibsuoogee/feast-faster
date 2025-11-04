from app.dependencies.database import get_session
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select
from app.models import Station, Restaurant, StationRequest
from fastapi import APIRouter, Depends, HTTPException

router = APIRouter(
    prefix="/api",
)


@router.post("/stations-restaurants-MOCK")
async def get_stations_restaurants_(
    body: StationRequest,
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
