from typing import List
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import String
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import ARRAY
from geoalchemy2 import Geography
from pydantic import BaseModel


class Station(SQLModel, table=True):
    __tablename__ = "stations"
    model_config = {"arbitrary_types_allowed": True}

    station_id: int = Field(default=None, primary_key=True)
    name: str = Field(default="Feast faster", nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    location: Geography = Field(
        sa_column=Column(Geography(geometry_type="POINT", srid=4326), nullable=False)
    )
    address: str = Field(nullable=False)
    # Relationships
    restaurants: List["Restaurant"] = Relationship(back_populates="station")
    chargers: List["Charger"] = Relationship(back_populates="station")


class Restaurant(SQLModel, table=True):
    __tablename__ = "restaurants"
    model_config = {"arbitrary_types_allowed": True}

    restaurant_id: int = Field(default=None, primary_key=True)
    station_id: int = Field(foreign_key="stations.station_id", nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    location: Geography = Field(
        sa_column=Column(Geography(geometry_type="POINT", srid=4326), nullable=False)
    )
    name: str = Field(max_length=50, nullable=False)
    cuisines: List[str] = Field(
        sa_column=Column(ARRAY(String), default=list)
    )
    address: str = Field(nullable=False)
    # Relationships
    station: Station = Relationship(back_populates="restaurants")


class Charger(SQLModel, table=True):
    __tablename__ = "chargers"

    charger_id: int = Field(primary_key=True)
    station_id: int = Field(foreign_key="stations.station_id", nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    connector_type: str
    power: int
    # Relationships
    station: Station = Relationship(back_populates="chargers")
    reservations: List["Reservation"] = Relationship(back_populates="charger")


class Reservation(SQLModel, table=True):
    __tablename__ = "reservations"

    reservation_id: int = Field(primary_key=True)
    charger_id: int = Field(foreign_key="chargers.charger_id", nullable=False)
    # Relationships
    charger: Charger = Relationship(back_populates="reservations")


class StationRequest(BaseModel):
    current_location: tuple[float, float]
    destination: tuple[float, float]
    ev_model: str
    current_car_range: float
    current_soc: float
    desired_soc: float
    connector_type: str
    cuisines: list[str]


class ETACalculationRequest(BaseModel):
    current_location: tuple[float, float]
    reservation_id: int


class RouteRequest(BaseModel):
    source: tuple[float, float]
    destination: tuple[float, float]
    interval: int
