import React, { useState, useCallback, useEffect } from 'react';
import { TouristView } from './components/TouristView';
import { AuthorityDashboard } from './components/AuthorityDashboard';
import { AuthScreen } from './components/AuthScreen';
import { AppMode, IncidentAlert } from './types';
import { MOCK_USER, INITIAL_LOCATION } from './constants';
import { useGeolocation } from './hooks/useGeolocation';
import { LocationPrompt } from './components/LocationPrompt';
import { SOSModal } from './components/SOSModal';
import { api } from './services/api';
import { scanCity, CityIntel } from './services/geminiService';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.AUTH);
  const [currentUser, setCurrentUser] = useState<any>(MOCK_USER);
  const [currentCity, setCurrentCity] = useState<{ name: string; lat: number; lng: number } | null>(null);
  const [scannedData, setScannedData] = useState<CityIntel | null>(null);
  const [alerts, setAlerts] = useState<IncidentAlert[]>([]);
  const [showSOSModal, setShowSOSModal] = useState(false);

  // Use the custom hook for location
  const { location: userLocation, realCoords } = useGeolocation(INITIAL_LOCATION);

  // Poll for alerts every 3 seconds
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await api.getAlerts();
        setAlerts(data);
      } catch (err) {
        console.error("Failed to fetch alerts", err);
      }
    };

    fetchAlerts(); // Initial fetch
    const interval = setInterval(fetchAlerts, 3000); // Poll
    return () => clearInterval(interval);
  }, []);

  const handleCitySet = async (city: { name: string; lat: number; lng: number }) => {
    setCurrentCity(city);
    console.log("Scanning city safety:", city.name);
    const data = await scanCity(city.name);
    if (data) setScannedData(data);
  };

  const handleLogout = () => {
    setMode(AppMode.AUTH);
    setCurrentCity(null);
    setScannedData(null);
  };

  const handleLogin = (selectedMode: AppMode, user: any) => {
    setCurrentUser(user);
    setMode(selectedMode);
  };

  const handlePanicClick = () => {
    setShowSOSModal(true);
  };

  const handleConfirmSOS = useCallback(async (type: IncidentAlert['type'], description: string) => {
    setShowSOSModal(false);

    const newAlert = {
      id: `ALT-${Date.now()}`,
      userId: currentUser.id,
      type: type,
      description: description,
      timestamp: Date.now(),
      location: currentCity ? { x: currentCity.lat, y: currentCity.lng } : { ...userLocation },
      status: 'PENDING' as const,
      riskScore: 95,
      timeline: [{ status: 'PENDING', note: 'SOS Request Raised', timestamp: Date.now() }]
    };

    setAlerts(prev => [newAlert as IncidentAlert, ...prev]);

    try {
      await api.createAlert(newAlert);
      alert("✅ SOS ALERT SENT. HELP IS ON THE WAY.");
    } catch (err) {
      console.error("Failed to send panic alert", err);
      alert("Failed to send alert. Please call police directly.");
    }
  }, [userLocation, currentUser, currentCity]);

  return (
    <div className="h-screen w-screen relative overflow-hidden font-sans">
      <div className="h-full w-full transition-opacity duration-300">

        {showSOSModal && (
          <SOSModal
            onConfirm={handleConfirmSOS}
            onCancel={() => setShowSOSModal(false)}
          />
        )}

        {mode === AppMode.AUTH && (
          <AuthScreen onLogin={handleLogin} />
        )}

        {mode === AppMode.TOURIST && (
          <>
            {!currentCity && <LocationPrompt onSubmit={handleCitySet} />}
            <TouristView
              user={currentUser}
              location={userLocation}
              realCoords={realCoords}
              alerts={alerts}
              onPanic={handlePanicClick}
              onLogout={handleLogout}
              cityLocation={currentCity}
              scannedZones={scannedData?.dangerZones}
              scannedSpots={scannedData?.touristSpots}
            />
          </>
        )}

        {mode === AppMode.AUTHORITY && (
          <AuthorityDashboard
            alerts={alerts}
            userLocation={userLocation}
            onLogout={handleLogout}
          />
        )}

      </div>
    </div>
  );
};

export default App;