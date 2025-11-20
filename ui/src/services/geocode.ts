import { useState, useEffect } from "react";
import {
  setKey,
  setLanguage,
  setRegion,
  fromAddress,
  fromLatLng,
  fromPlaceId,
  setLocationType,
  geocode,
  RequestType,
} from "react-geocode";

// Set Google Maps API key
setKey(import.meta.env.VITE_GOOGLE_GEOCODE_API_KEY || "");
// Optional: set language
setLanguage("en");
// Optional: set region (ISO 3166-1 alpha-2 country code)
setRegion("fi");

interface LocationData {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
}

type AddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

// defaultLocation is LUT_M19
const defaultLocation: LocationData = {
  latitude: 61.00581881792029,
  longitude: 25.664881992931964,
  address: "Mukkulankatu 19, Lahti",
};

const LOCATION_KEY = "cached_user_location";

export const useUserLocation = () => {
  const [location, setLocation] = useState<LocationData>(() => {
    // Load from localStorage if available
    // So that navigation and Geocoding are not called everytime
    // To update position, delete item from localStorage
    const saved = localStorage.getItem(LOCATION_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (location) return;

    if (!("geolocation" in navigator)) {
      setLocation(defaultLocation);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fromLatLng(latitude, longitude);
          const components = response.results[0].address_components;

          const get = (type: string) =>
            components.find((c: AddressComponent) => c.types.includes(type))
              ?.long_name || "";

          const street = get("route");
          const houseNumber = get("street_number");
          const city =
            get("locality") || // normal cities
            get("postal_town") || // UK / Nordic use postal_town
            get("administrative_area_level_2"); // fallback

          const loc = {
            latitude,
            longitude,
            address: `${street} ${houseNumber}, ${city}`,
          };
          setLocation(loc);
          localStorage.setItem(LOCATION_KEY, JSON.stringify(loc));
        } catch (err) {
          console.log("Set default location. Geocoding failed: ", err);
          setLocation(defaultLocation);
        }
      },
      (err) => {
        console.log("Set default location. getCurrentPosition failed: ", err);
        setLocation(defaultLocation);
      }
    );
  }, [location]);

  return location;
};
