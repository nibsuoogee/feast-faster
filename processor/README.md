First do `docker-compose up` following feast-faster/README.md.

Mock api works on
```
curl --location 'http://localhost:8000/api/stations-restaurants-MOCK' \
--header 'Content-Type: application/json' \
--data '{
    "current_location": [25.124, 60.123],
    "destination": "Espoo",
    "ev_model": "EV model",
    "current_car_range": 100,
    "current_soc": 40,
    "desired_soc": 80
}'
```

Uses POST request. You can write any data to body, all the fields are required.
Currently, it returns 2 first stations from the database and their respective restaurants.
`chargers`, `travel_time_min`, `distance_km`, `soc_at_arrival`, and `estimate_charging_time_min` are dummy data.
