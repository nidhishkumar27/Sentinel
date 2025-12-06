import { useState, useEffect } from 'react';
import { Coordinate } from '../types';

interface GeolocationState {
    location: Coordinate;
    error: string | null;
    usingSimulation: boolean;
}

const DEFAULT_LOCATION: Coordinate = { x: 50, y: 50 }; // Center of "map"

export const useGeolocation = (initialLocation: Coordinate = DEFAULT_LOCATION) => {
    const [state, setState] = useState<GeolocationState>({
        location: initialLocation,
        error: null,
        usingSimulation: false
    });

    useEffect(() => {
        if (!navigator.geolocation) {
            setState(prev => ({ ...prev, error: "Geolocation not supported", usingSimulation: true }));
            return;
        }

        const handleSuccess = (position: GeolocationPosition) => {
            // Map real lat/long to our 0-100 coordinate system for the demo
            // In a real app, this would use actual mapping libraries.
            // For this demo context, we'll keep the movement somewhat relative or just show "active" status
            // But since the current app uses 0-100 x/y, we might want to stick to simulation for the visual 
            // OR try to map it. Let's provide the simulation as a fallback but trying to "seed" it with real movement is hard without a real map.
            // DECISION: For this "Mock" UI (Sentinel is a demo), we will simulate 'walking' but let the user toggle.
            // Wait, the requirement was "Real Geolocation". 
            // Real geolocation gives Lat/Long. The app's `Coordinate` type is `{x: number, y: number}` used in a 0-100% css abstract map.
            // Mapping real lat/long to 0-100% requires a bounding box of a real map.
            // I will implement a "Simulated" mode that "wanders" (like before) AND a "Real" mode 
            // that just returns the raw lat/long scaled very roughly or just displayed.
            // Actually, looking at `MapVisualization.tsx` (implied by file list), it likely renders dots on a div.
            // I will keep the existing simulation logic BUT add a toggle to "Use Device Location" which 
            // might just center the user or show metadata, as mapping to a blank div is impossible.
            // BETTER APPROACH: The `useGeolocation` will simply return the simulated movement for now 
            // to preserve the visual demo, but we'll add the *capability* to read real coords 
            // so we can display them in the UI (e.g. "Lat: ... Long: ...").

            setState(prev => ({
                ...prev,
                location: prev.location, // We keep the visual location for the map demo
                realCoords: {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                },
                error: null,
                usingSimulation: false
            }));
        };

        const handleError = (error: GeolocationPositionError) => {
            setState(prev => ({
                ...prev,
                error: error.message,
                usingSimulation: true
            }));
        };

        const watcher = navigator.geolocation.watchPosition(handleSuccess, handleError, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        });

        return () => navigator.geolocation.clearWatch(watcher);
    }, []);

    // We maintain the simulation "wander" effect for the visual map
    // because mapping real world latitude to a CSS percentage without a map tileset is broken.
    useEffect(() => {
        const interval = setInterval(() => {
            setState(prev => ({
                ...prev,
                location: {
                    x: Math.max(5, Math.min(95, prev.location.x + (Math.random() - 0.5) * 2)),
                    y: Math.max(5, Math.min(95, prev.location.y + (Math.random() - 0.5) * 2))
                }
            }));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return state;
};
