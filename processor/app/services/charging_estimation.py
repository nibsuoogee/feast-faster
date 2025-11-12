import pandas as pd
import warnings
import joblib
from app.constants import TEMPERATURE


warnings.filterwarnings("ignore", message="X does not have valid feature names")

model = joblib.load("app/trained_models/sample_time_predictor_LGBM_compressed.pkl")


def get_estimate_charging_time(ev_model, desired_soc, stations):
    test_data = [{
        "EVModel": ev_model,
        "min_soc": st['soc_at_arrival'],
        "soc_diff": desired_soc - st['soc_at_arrival'],
        "max_power": st['chargers'][0]['max_power'] * 1000,
        "mean_temp": TEMPERATURE
    } for st in stations]

    test_data_frame = pd.DataFrame(test_data)
    predicted_sample_time = model.predict(test_data_frame)
    predictions = pd.Series(predicted_sample_time)

    for station, pred in zip(stations, predictions.tolist()):
        station['estimate_charging_time_min'] = round(pred / 60, 1)

    return stations
