from app.models import Station, Charger, Reservation
from sqlalchemy import select, join
from sqlalchemy.orm import selectinload
from sqlmodel import select
from geoalchemy2 import functions as func
from geoalchemy2.shape import to_shape


def get_stations_from_db(session, buffer_geojson, cuisines, connector_type):
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
                "station_id": r.station_id,
                "name": r.name,
                "address": r.address,
                "cuisines": r.cuisines
            } for r in st.restaurants
            if any(cuisine in cuisines for cuisine in r.cuisines)
        ]

        if len(filtered_restaurants) == 0:
            continue

        filtered_chargers = [
            {
                "charger_id": c.charger_id,
                "type": c.connector_type,
                "max_power": c.power
            } for c in st.chargers
            if c.connector_type == connector_type
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

    return filtered_stations


def get_destination(session, reservation_id):
    stmt = (
        select(Station.location)
        .select_from(
            join(Reservation, Charger, Reservation.charger_id == Charger.charger_id)
            .join(Station, Charger.station_id == Station.station_id)
        )
        .where(Reservation.reservation_id == reservation_id)
    )

    location = session.execute(stmt).scalar_one()

    if not location:
        return None

    return {
        "location": (to_shape(location).x, to_shape(location).y)  # To match further call from OpenRouteService
    }


def get_destination_by_station_id(session, station_id):
    stmt = (
        select(Station.location)
        .where(Station.station_id == station_id)
    )

    location = session.execute(stmt).scalar_one()
    
    if not location:
        return None

    return to_shape(location).x, to_shape(location).y
