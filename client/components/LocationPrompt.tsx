import React, { useState } from 'react';
import { Search, MapPin, LocateFixed } from 'lucide-react';

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

        // 1. Pre-fetch IP location immediately for speed (Race Preparation)
        const ipLocPromise = fetch('https://ipapi.co/json/')
            .then(res => res.json())
            .catch(err => null);

        const options = {
            enableHighAccuracy: false, // Use wifi/cell towers for speed
            timeout: 5000, // Hard limit of 5s for GPS
            maximumAge: 60000
        };

        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;

                // Use OpenStreetMap Nominatim for Reverse Geocoding
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const data = await response.json();

                if (data && data.address) {
                    const { city, town, village, suburb, county } = data.address;
                    const detectedName = city || town || village || suburb || county || "Unknown Location";

                    onSubmit({
                        name: detectedName,
                        lat: latitude,
                        lng: longitude
                    });
                } else {
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
        }, async (err) => {
            console.warn("Geolocation failing/slow, switching to IP fallback...", err);

            try {
                // 2. Use the pre-fetched promise
                const data = await ipLocPromise;

                if (data && data.latitude && data.longitude) {
                    onSubmit({
                        name: data.city || data.region || data.country_name,
                        lat: data.latitude,
                        lng: data.longitude
                    });
                } else {
                    // If pre-fetch failed, try again or error
                    throw new Error("IP Pre-fetch failed");
                }
            } catch (fallbackErr) {
                console.error("Fallback failed", fallbackErr);
                detectLocationByIP(); // Try fresh fetch as last resort
            } finally {
                setLoading(false);
            }
        }, options);
    };

    const detectLocationByIP = async () => {
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();

            if (data && data.latitude && data.longitude) {
                onSubmit({
                    name: data.city || data.region || data.country_name,
                    lat: data.latitude,
                    lng: data.longitude
                });
            } else {
                throw new Error("Invalid IP location data");
            }
        } catch (ipErr) {
            console.error("IP Fallback failed", ipErr);
            setError('Unable to retrieve your location. Please type your city manually.');
        } finally {
            setLoading(false);
        }
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
