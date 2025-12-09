import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Coordinate, IncidentAlert } from '../types';
import { AlertTriangle, TrendingUp } from 'lucide-react';

// Fix for default Leaflet icon not showing in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapVisualizationProps {
  userLocation: Coordinate;
  alerts: IncidentAlert[];
  showHeatmap?: boolean;
  cityLocation?: { lat: number; lng: number; name: string };
  zoom?: number;
  markerLabel?: string;
  scannedZones?: any[];
  scannedSpots?: any[];
  onInactivityAlert?: () => void;
}

// Helper: Calculate distance in meters between two coordinates
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Component to handle map center updates
// Fixed to prevent resetting zoom on every render
// Component to handle map center updates
// Fixed to prevent resetting zoom on every render
const ResizeHandler = () => {
  const map = useMap();
  useEffect(() => {
    // Invalidate size after mount to fix grey tiles in tabs/modals
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [map]);
  return null;
};

const MapUpdater: React.FC<{ center: [number, number]; zoom?: number }> = ({ center, zoom = 13 }) => {
  const map = useMap();
  const prevCenter = useRef<string>("");

  useEffect(() => {
    const currentCenterKey = `${center[0]},${center[1]}-${zoom}`;
    if (prevCenter.current !== currentCenterKey) {
      // Only fly if the LOCATION URL actually changes (new city)
      map.flyTo(center, zoom);
      prevCenter.current = currentCenterKey;
    }
  }, [center[0], center[1], zoom, map]);
  return null;
};

export const MapVisualization: React.FC<MapVisualizationProps> = ({ userLocation, alerts, cityLocation, scannedZones, scannedSpots, zoom = 13, markerLabel = "You are here", onInactivityAlert }) => {

  // Default to user location or generic fallback (Mysore) if nothing provided
  const centerPosition: [number, number] = cityLocation
    ? [cityLocation.lat, cityLocation.lng]
    : [12.2958, 76.6394]; // Default to Mysore

  // USE SCANNED DATA IF AVAILABLE, OTHERWISE FALLBACK
  const touristSpots = scannedSpots && scannedSpots.length > 0 ? scannedSpots : (cityLocation ? [
    { name: "Main Palace / Attraction", lat: cityLocation.lat + 0.002, lng: cityLocation.lng + 0.002 },
    { name: "Public Gardens", lat: cityLocation.lat - 0.003, lng: cityLocation.lng + 0.004 },
  ] : []);

  // Combine Scanned Zones with Active High-Risk Alerts
  // Combine Scanned Zones with Active High-Risk Alerts
  const dangerZones = React.useMemo(() => {
    const activeAlertZones = alerts
      .filter(a => (a.type === 'HARASSMENT' || a.type === 'LOST') && a.status !== 'RESOLVED')
      .map(a => ({
        name: `${a.type} reported in this area`,
        lat: a.location.x,
        lng: a.location.y,
        radius: 300,
        reason: "Live Incident Report"
      }));

    return [
      ...(scannedZones && scannedZones.length > 0 ? scannedZones : (cityLocation ? [
        { name: "Simulated Hazard A", lat: cityLocation.lat - 0.005, lng: cityLocation.lng - 0.005, radius: 400 },
      ] : [])),
      ...activeAlertZones
    ];
  }, [alerts, scannedZones, cityLocation]);

  // Vulnerable Zones (Resolved Harassment/Lost)
  const vulnerableZones = alerts
    .filter(a => (a.type === 'HARASSMENT' || a.type === 'LOST') && a.status === 'RESOLVED')
    .map(a => ({
      name: `Past ${a.type} Incident (Vulnerable)`,
      lat: a.location.x,
      lng: a.location.y,
      radius: 300,
      reason: "Recently Resolved Incident"
    }));

  // Dynamic User Movement Simulation
  const [dynamicPos, setDynamicPos] = useState<[number, number]>(centerPosition);
  const [escapeRoute, setEscapeRoute] = useState<[number, number][] | null>(null);

  // Simulation State
  const simState = useRef<'MOVING' | 'STATIC'>('MOVING'); // Start moving
  const simTimer = useRef<number>(0);

  // Sync dynamicPos with centerPosition when city changes
  useEffect(() => {
    setDynamicPos(centerPosition);
    simTimer.current = 0;
    simState.current = 'MOVING';
  }, [centerPosition[0], centerPosition[1]]);

  // Simulate Walking & Safety Check
  useEffect(() => {
    const interval = setInterval(() => {
      setDynamicPos(prev => {
        let newPos = prev;
        simTimer.current += 1; // Increment timer (1s)

        // STATE MACHINE: 30s Moving -> 10s Static -> Alert -> Reset
        if (simState.current === 'MOVING') {
          // Move
          const deltaLat = (Math.random() - 0.5) * 0.0002;
          const deltaLng = (Math.random() - 0.5) * 0.0002;
          newPos = [prev[0] + deltaLat, prev[1] + deltaLng];

          // Transition check
          if (simTimer.current >= 30) {
            simState.current = 'STATIC';
            simTimer.current = 0;
            console.log("Sim: Switching to STATIC mode");
          }
        } else if (simState.current === 'STATIC') {
          // Don't move (newPos = prev)

          // Transition check
          if (simTimer.current >= 10) {
            // TRIGGER ALERT
            if (onInactivityAlert) onInactivityAlert();

            // Resume moving
            simState.current = 'MOVING';
            simTimer.current = 0;
            console.log("Sim: Alert Triggered! Resuming movement.");
          }
        }

        // Check Safety
        let inDanger = false;
        let nearestSafeSpot = null;
        let minSafeDist = Infinity;

        // 1. Am I in danger or vulnerable zone?
        for (const zone of [...dangerZones, ...vulnerableZones]) {
          const dist = getDistanceMeters(newPos[0], newPos[1], zone.lat, zone.lng);
          if (dist < zone.radius) {
            inDanger = true;
            break;
          }
        }

        // 2. If in danger, find route to nearest safe spot
        if (inDanger) {
          for (const spot of touristSpots) {
            const dist = getDistanceMeters(newPos[0], newPos[1], spot.lat, spot.lng);
            if (dist < minSafeDist) {
              minSafeDist = dist;
              nearestSafeSpot = spot;
            }
          }

          if (nearestSafeSpot) {
            setEscapeRoute([newPos, [nearestSafeSpot.lat, nearestSafeSpot.lng]]);
          }
        } else {
          setEscapeRoute(null);
        }

        return newPos;
      });
    }, 1000); // Move every second



    return () => clearInterval(interval);
  }, [dangerZones, touristSpots, onInactivityAlert]);

  return (
    <div className="relative w-full h-full bg-slate-900 overflow-hidden rounded-xl border border-slate-700 shadow-inner z-0">
      <MapContainer
        center={centerPosition}
        zoom={14} // Zoomed in a bit more to see movement
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        maxZoom={20}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxNativeZoom={19}
          maxZoom={20}
        />

        <MapUpdater center={centerPosition} zoom={zoom} />
        <ResizeHandler />

        {/* Escape Route Line */}
        {escapeRoute && (
          <Polyline
            positions={escapeRoute}
            pathOptions={{ color: '#10b981', weight: 4, dashArray: '10, 10', opacity: 0.8 }}
          />
        )}

        {touristSpots.map((spot, idx) => (
          <Marker key={`spot-${idx}`} position={[spot.lat, spot.lng]}>
            <Popup>
              <div className="text-emerald-600 font-bold">🌿 {spot.name}</div>
              <div className="text-xs text-slate-500">Safe Tourist Zone</div>
            </Popup>
          </Marker>
        ))}

        {dangerZones.map((zone, idx) => (
          <Circle
            key={`zone-${idx}`}
            center={[zone.lat, zone.lng]}
            radius={zone.radius}
            pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.2 }}
          >
            <Popup>
              <div className="text-red-500 font-bold">⚠️ {zone.name}</div>
              <div className="text-xs text-slate-500">High Risk Area. Exercise Caution.</div>
            </Popup>
          </Circle>
        ))}

        {vulnerableZones.map((zone, idx) => (
          <Circle
            key={`vuln-zone-${idx}`}
            center={[zone.lat, zone.lng]}
            radius={zone.radius}
            pathOptions={{ color: '#eab308', fillColor: '#eab308', fillOpacity: 0.2, dashArray: '5, 10' }}
          >
            <Popup>
              <div className="text-yellow-500 font-bold">⚠️ {zone.name}</div>
              <div className="text-xs text-slate-500">Vulnerable Area. Please proceed with caution.</div>
            </Popup>
          </Circle>
        ))}

        {/* User Location (Live Blue Dot) */}
        <Circle
          center={dynamicPos}
          pathOptions={{
            fillColor: escapeRoute ? '#ef4444' : '#3b82f6', // Turn red if in danger
            color: '#ffffff',
            weight: 2,
            fillOpacity: 1
          }}
          radius={6} // Approx 6 meters radius on map (renders as dot)
        >
          <Popup autoClose={false} closeOnClick={false}>
            <div className={`${escapeRoute ? 'text-red-600' : 'text-blue-600'} font-bold text-center`}>
              {escapeRoute ? '⚠️ IN DANGER ZONE' : markerLabel}<br />
              {escapeRoute ? '⚠️ IN DANGER ZONE' : markerLabel}<br />
              <span className="text-xs text-slate-500 animate-pulse">
                {escapeRoute ? 'Follow line to safety!' :
                  (simState.current === 'STATIC' ? `(Static: ${simTimer.current}s)` : '(Moving...)')
                }
              </span>
            </div>
          </Popup>
        </Circle>
        {/* Alerts Markers */}
        {alerts.map((alert, idx) => (
          <Marker
            key={`alert-${alert.id}`}
            position={[alert.location.x, alert.location.y]}
            zIndexOffset={1000}
          >
            <Popup>
              <div className="flex items-center space-x-2 text-red-600 font-bold animate-pulse">
                <AlertTriangle className="w-5 h-5" />
                <div>
                  <div>{alert.type} ALERT</div>
                  <div className="text-xs text-slate-500">{new Date(alert.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Pulse Effect for User */}
        <Circle
          center={dynamicPos}
          pathOptions={{
            fillColor: escapeRoute ? '#ef4444' : '#3b82f6',
            color: escapeRoute ? '#ef4444' : '#3b82f6',
            weight: 0,
            fillOpacity: 0.2
          }}
          radius={escapeRoute ? 40 : 20} // Larger pulse in danger
        />

      </MapContainer>

      {/* Danger Overlay Alert */}
      {escapeRoute && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-full font-bold shadow-2xl animate-bounce flex items-center space-x-2 z-[1000]">
          <AlertTriangle className="w-6 h-6" />
          <span>UNSAFE ZONE DETECTED! FOLLOW ROUTE TO SAFETY</span>
          <TrendingUp className="w-6 h-6" />
        </div>
      )}

      <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur border border-slate-700 p-3 rounded-xl text-xs space-y-2 z-[1000] shadow-xl">
        <div className="font-bold text-slate-300 mb-2 border-b border-slate-700 pb-1">LEGEND</div>
        <div className="flex items-center space-x-2">
          <span className={`w-3 h-3 rounded-full border-2 border-white ${escapeRoute ? 'bg-red-500' : 'bg-blue-500'}`}></span>
          <span className="text-slate-300">Your Location</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
          <span className="text-slate-300">Safe Zone</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-red-500/50 border border-red-500"></span>
          <span className="text-slate-300">Risk Zone</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-yellow-500/50 border border-yellow-500 dashed border-dashed"></span>
          <span className="text-slate-300">Vulnerable Zone</span>
        </div>
      </div>

    </div>
  );
};