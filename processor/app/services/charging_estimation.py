import pandas as pd
import warnings
import joblib
from app.constants import MINIMUM_SOC_AT_ARRIVAL, TEMPERATURE


warnings.filterwarnings("ignore", message="X does not have valid feature names")

model = joblib.load("app/trained_models/sample_time_predictor_LGBM_compressed.pkl")


def get_estimate_charging_time(ev_model, current_soc, current_car_range, desired_soc, stations):
    available_stations = []

    # Filter out stations that are too far
    # Calculate SoC decrease rate
    soc_rate = current_soc / current_car_range  # % decrease by 1 km

    for st in stations:
        st.pop("location", None)  # Remove location as we no longer need it
        # Calculate SoC at arrival
        soc_at_arrival = round(current_soc - soc_rate * st["distance_km"])

        # If soc_at_arrival is less than minimum, continue MINIMUM_SOC_AT_ARRIVAL
        if soc_at_arrival < MINIMUM_SOC_AT_ARRIVAL:
            continue

        st["soc_at_arrival"] = soc_at_arrival
        available_stations.append(st)

    if not len(available_stations):
        return []

    test_data = [{
        "EVModel": ev_model,
        "min_soc": st["soc_at_arrival"],
        "soc_diff": desired_soc - st["soc_at_arrival"],
        "max_power": st["chargers"][0]["max_power"] * 1000,
        "mean_temp": TEMPERATURE
    } for st in available_stations]

    test_data_frame = pd.DataFrame(test_data)
    predicted_sample_time = model.predict(test_data_frame)
    predictions = pd.Series(predicted_sample_time)

    for station, pred in zip(available_stations, predictions.tolist()):
        station["estimate_charging_time_min"] = round(pred / 60)

    return available_stations
