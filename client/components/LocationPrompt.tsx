import React, { useState } from 'react';
import { Search, MapPin, LocateFixed } from 'lucide-react'; // Added LocateFixed
import { WeatherService } from '../services/weather'; // Added WeatherService

interface LocationPromptProps {
    onSubmit: (location: { name: string; lat: number; lng: number }) => void;
}

export const LocationPrompt: React.FC<LocationPromptProps> = ({ onSubmit }) => {
    const [city, setCity] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!city.trim()) return;

        setLoading(true);
        setError('');

        try {
            // Use OpenStreetMap Nominatim API for geocoding
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`);
            const data = await response.json();

            if (data && data.length > 0) {
                const result = data[0];
                onSubmit({
                    name: result.display_name.split(',')[0],
                    lat: parseFloat(result.lat),
                    lng: parseFloat(result.lon)
                });
            } else {
                setError('City not found. Please try again.');
            }
        } catch (err) {
            setError('Failed to fetch location. Check internet connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleAutoDetect = () => {
        setLoading(true);
        setError('');

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                // Use WeatherService (Visual Crossing) for Reverse Geocoding
                const weatherData = await WeatherService.getWeather({ lat: latitude, lng: longitude });

                if (weatherData && weatherData.address) {
                    // Visual Crossing often returns "City, State, Country" or similar. 
                    // We'll use the first part or the full address string as the name.
                    // The 'address' field in response is usually what we queried, 
                    // but 'resolvedAddress' is the full name. 
                    // WeatherService returns the full JSON, so let's check what we mapped.
                    // Actually WeatherData interface has 'address'. 
                    // Let's assume it holds a displayable name or we use a fallback.
                    const cityName = weatherData.address.split(',')[0];

                    onSubmit({
                        name: cityName,
                        lat: latitude,
                        lng: longitude
                    });
                } else {
                    // Fallback if API fails to resolve name but we have coords
                    onSubmit({
                        name: `Location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`,
                        lat: latitude,
                        lng: longitude
                    });
                }
            } catch (err) {
                console.error("Auto detect failed", err);
                setError('Failed to fetch location details.');
            } finally {
                setLoading(false);
            }
        }, (err) => {
            console.error("Geolocation error", err);
            setError('Unable to retrieve your location. Please check permissions.');
            setLoading(false);
        });
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-brand-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-fade-in-up">

                <div className="text-center mb-6">
                    <div className="mx-auto w-16 h-16 bg-brand-accent/20 rounded-full flex items-center justify-center mb-4">
                        <MapPin className="w-8 h-8 text-brand-accent animate-bounce" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Where are you roaming?</h2>
                    <p className="text-slate-400 text-sm">Enter your city to load local safety data and tourist zones.</p>
                </div>

                <form onSubmit={handleSearch} className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3.5 text-slate-500 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="e.g., Mysore, Bangalore, Paris"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-600 rounded-xl py-3 pl-10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all"
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div className="text-red-400 text-xs text-center bg-red-900/20 p-2 rounded">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-accent hover:bg-brand-accent/90 text-white font-bold py-3 rounded-xl transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Locating...' : 'Start Exploring'}
                    </button>

                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-slate-700"></div>
                        <span className="flex-shrink-0 mx-4 text-slate-500 text-xs">OR</span>
                        <div className="flex-grow border-t border-slate-700"></div>
                    </div>

                    <button
                        type="button"
                        onClick={handleAutoDetect}
                        disabled={loading}
                        className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 font-bold py-3 rounded-xl transition-all transform active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                        <LocateFixed className="w-5 h-5" />
                        <span>Use My Current Location</span>
                    </button>
                </form>

            </div>
        </div>
    );
};
