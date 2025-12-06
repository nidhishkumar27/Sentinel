export interface WeatherData {
    currentConditions: {
        temp: number;
        conditions: string;
        icon: string;
        humidity: number;
        windspeed: number;
        sunrise: string;
        sunset: string;
    };
    days: {
        datetime: string;
        tempmax: number;
        tempmin: number;
        conditions: string;
        icon: string;
        description: string;
        hours: {
            datetime: string;
            temp: number;
            conditions: string;
            icon: string;
        }[];
    }[];
    alerts: {
        event: string;
        headline: string;
        description: string;
        severity: string;
        onset: string;
        ends: string;
    }[];
    address: string;
}

// Replace with your actual key or use env variable
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY || 'YOUR_VISUAL_CROSSING_KEY';
const BASE_URL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';

export const WeatherService = {
    getWeather: async (location: string | { lat: number, lng: number }): Promise<WeatherData | null> => {
        try {
            const query = typeof location === 'string'
                ? location
                : `${location.lat},${location.lng}`;

            // Fetching 7 days forecast, including current and hourly
            const response = await fetch(`${BASE_URL}/${query}?unitGroup=metric&key=${API_KEY}&contentType=json`);

            if (!response.ok) {
                console.warn("Weather API Limit likely reached or key invalid.");
                // Return mock data if API fails (for demo purposes)
                return MOCK_WEATHER_DATA;
            }

            return await response.json();
        } catch (error) {
            console.error("Weather Fecth Error:", error);
            return MOCK_WEATHER_DATA;
        }
    }
};

// Fallback Mock Data
const MOCK_WEATHER_DATA: WeatherData = {
    address: "Mock City",
    currentConditions: {
        temp: 28,
        conditions: "Partly Cloudy",
        icon: "partly-cloudy-day",
        humidity: 65,
        windspeed: 12,
        sunrise: "06:00",
        sunset: "18:30"
    },
    days: Array.from({ length: 7 }).map((_, i) => ({
        datetime: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
        tempmax: 30 + (i % 3),
        tempmin: 22 - (i % 2),
        conditions: i === 2 ? "Rain" : "Clear",
        icon: i === 2 ? "rain" : "clear-day",
        description: i === 2 ? "Expecting heavy showers in the afternoon." : "Clear skies throughout the day.",
        hours: Array.from({ length: 24 }).map((_, h) => ({
            datetime: `${h.toString().padStart(2, '0')}:00:00`,
            temp: 25 + Math.sin(h / 4) * 5,
            conditions: "Clear",
            icon: "clear-day"
        }))
    })),
    alerts: [
        /* Uncomment to test alerts
        {
            event: "Heat Advisory",
            headline: "Heat Advisory issued",
            description: "High temperatures expected to reach 35C.",
            severity: "Moderate",
            onset: new Date().toISOString(),
            ends: new Date(Date.now() + 86400000).toISOString()
        }
        */
    ]
};
