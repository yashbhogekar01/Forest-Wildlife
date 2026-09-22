import express from 'express';

const router = express.Router();

// Helper to convert wind degrees to compass cardinal direction
function degreesToCardinal(deg) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const idx = Math.round((deg % 360) / 22.5);
  return directions[idx % 16];
}

// Map WMO weather interpretation codes
function wmoCodeToCondition(code, isNight) {
  switch (code) {
    case 0: return isNight ? 'Clear Night / High Visibility' : 'Clear Sky / Sunlight';
    case 1:
    case 2:
    case 3: return isNight ? 'Partly Cloudy Night' : 'Partly Cloudy / Light Jungle Breeze';
    case 45:
    case 48: return 'Jungle Morning Fog / Dew';
    case 51:
    case 53:
    case 55: return 'Light Canopy Drizzle';
    case 61:
    case 63:
    case 65: return 'Monsoon Rain Showers';
    case 80:
    case 81:
    case 82: return 'Heavy Rainstorm';
    case 95:
    case 96:
    case 99: return 'Severe Thunderstorm Warning';
    default: return isNight ? 'Clear Night' : 'Partly Cloudy';
  }
}

router.get('/', async (req, res) => {
  const lat = 21.75;
  const lng = 79.33;
  const hour = new Date().getHours();
  const isNight = hour < 6 || hour > 19;

  try {
    const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m,weather_code,uv_index,visibility&daily=sunrise,sunset&timezone=Asia%2FKolkata`;
    
    const apiRes = await fetch(openMeteoUrl);
    if (apiRes.ok) {
      const data = await apiRes.json();
      const curr = data.current || {};
      const daily = data.daily || {};

      const sunriseStr = daily.sunrise?.[0] ? new Date(daily.sunrise[0]).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST' : '05:48 IST';
      const sunsetStr = daily.sunset?.[0] ? new Date(daily.sunset[0]).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST' : '18:52 IST';

      return res.json({
        location: 'Pench Tiger Reserve, MP/MH Border',
        coordinates: { lat, lng },
        temperature_celsius: curr.temperature_2m ?? 26.4,
        humidity_percent: curr.relative_humidity_2m ?? 78,
        wind_speed_kmh: curr.wind_speed_10m ?? 12.5,
        wind_direction: degreesToCardinal(curr.wind_direction_10m ?? 65),
        barometric_pressure_hpa: curr.surface_pressure ?? 1012.3,
        conditions: wmoCodeToCondition(curr.weather_code ?? 1, isNight),
        visibility_km: curr.visibility ? Number((curr.visibility / 1000).toFixed(1)) : 9.8,
        uv_index: curr.uv_index ?? (isNight ? 0 : 6),
        sunrise: sunriseStr,
        sunset: sunsetStr,
        moon_phase: 'Waning Gibbous (68% Illumination)',
        telemetry_status: 'OPEN_METEO_LIVE',
        live_api: true,
        timestamp: new Date().toISOString()
      });
    }
  } catch (err) {
    console.warn('Open-Meteo Live API request timed out or failed, using nominal fallback:', err.message);
  }

  // Fallback response
  res.json({
    location: 'Pench Tiger Reserve, MP/MH Border',
    coordinates: { lat, lng },
    temperature_celsius: 26.4,
    humidity_percent: 78,
    wind_speed_kmh: 12.5,
    wind_direction: 'ENE',
    barometric_pressure_hpa: 1012.3,
    conditions: isNight ? 'Clear Night / High Visibility' : 'Partly Cloudy / Light Jungle Canopy Breeze',
    visibility_km: 9.8,
    uv_index: isNight ? 0 : 6,
    sunrise: '05:48 IST',
    sunset: '18:52 IST',
    moon_phase: 'Waning Gibbous (68% Illumination)',
    telemetry_status: 'NOMINAL_FALLBACK',
    live_api: false,
    timestamp: new Date().toISOString()
  });
});

export default router;

