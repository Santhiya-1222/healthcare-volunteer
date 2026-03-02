/**
 * Reverse geocode lat/lon → human-readable address.
 * Uses Google Geocoding API if VITE_GOOGLE_MAPS_API_KEY is set,
 * otherwise falls back to Nominatim (OpenStreetMap).
 */
export const reverseGeocode = async (lat, lon) => {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (key) {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${key}`
    );
    const data = await res.json();
    if (data.status === "OK" && data.results?.length) {
      return data.results[0].formatted_address;
    }
  }

  // Fallback: Nominatim
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
    { headers: { "Accept-Language": "en" } }
  );
  const data = await res.json();
  return data.display_name || "";
};
