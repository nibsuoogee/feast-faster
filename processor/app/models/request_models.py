from pydantic import BaseModel, Field


class StationRequest(BaseModel):
    current_location: tuple[float, float]
    destination: tuple[float, float]
    ev_model: str
    current_car_range: float = Field(gt=0)
    current_soc: float = Field(gt=0)
    desired_soc: float = Field(gt=0)
    connector_type: str
    cuisines: list[str]


class ETACalculationRequest(BaseModel):
    current_location: tuple[float, float]
    reservation_id: int


class RouteRequest(BaseModel):
    source: tuple[float, float]
    station_id: int
    interval: int
