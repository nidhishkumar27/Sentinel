import React, { useState } from 'react';
import { UserProfile, IncidentAlert, Coordinate } from '../types';
import { DigitalID } from './DigitalID';
import { MapVisualization } from './MapVisualization';
import { RiskScanner } from './RiskScanner';
import { EmergencyContacts } from './EmergencyContacts';
import { ShieldAlert, Phone, Navigation, LogOut, CheckCircle } from 'lucide-react';
import { WeatherWidget } from './WeatherWidget';

interface TouristViewProps {
    user: UserProfile;
    location: Coordinate;
    realCoords?: { lat: number; lng: number };
    alerts: IncidentAlert[];
    onPanic: () => void;
    onLogout: () => void;
    cityLocation?: { name: string; lat: number; lng: number } | null;
    scannedZones?: { name: string; lat: number; lng: number; radius: number; reason: string }[];
    scannedSpots?: { name: string; lat: number; lng: number; description: string }[];
}

export const TouristView: React.FC<TouristViewProps> = ({ user, location, realCoords, alerts, onPanic, onLogout, cityLocation, scannedZones, scannedSpots }) => {
    const [activeTab, setActiveTab] = useState<'status' | 'map' | 'id'>('status');
    const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);

    const activeAlert = alerts.find(a => a.userId === user.id && !dismissedAlertIds.includes(a.id));
    const isResolved = activeAlert?.status === 'RESOLVED';

    return (
        <div className="flex flex-col h-full bg-brand-900 relative">

            {/* Mobile Header */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-brand-900/95 backdrop-blur z-20 sticky top-0">
                <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${isResolved ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    <span className="font-bold tracking-wider text-slate-100">TRV-01 SENTINEL</span>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="text-xs text-slate-500 font-mono hidden sm:block">
                        {realCoords ?
                            `${realCoords.lat.toFixed(4)}, ${realCoords.lng.toFixed(4)}` :
                            `${location.x.toFixed(4)}, ${location.y.toFixed(4)}`
                        }
                    </div>
                    <button
                        onClick={onLogout}
                        className="p-1.5 text-slate-400 hover:text-white bg-slate-800/50 rounded hover:bg-slate-800 transition-colors"
                        title="Logout"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Main Content Area - Scrollable */}
            <div className="flex-1 overflow-y-auto pb-24">

                {/* Status Tab */}
                {activeTab === 'status' && (
                    <div className="p-4 space-y-6 max-w-md mx-auto">


                        <div className="text-center py-6">
                            <h1 className="text-2xl font-light text-white mb-1">Good Evening, {user.name.split(' ')[0]}</h1>
                            <p className="text-slate-400 text-sm">System is active. You are in a verified safe zone.</p>
                        </div>

                        {/* WEATHER WIDGET */}
                        {(cityLocation || location) && (
                            <WeatherWidget location={cityLocation || { lat: location.x, lng: location.y }} />
                        )}

                        <RiskScanner />

                        {/* Active Emergency Status Card */}
                        {activeAlert && (
                            <div className={`border rounded-xl p-4 animate-fadeIn transition-all ${isResolved
                                ? 'bg-emerald-900/20 border-emerald-500 shadow-lg shadow-emerald-900/20'
                                : 'bg-red-900/20 border-red-500 animate-pulse-slow'
                                }`}>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className={`font-bold uppercase text-sm flex items-center ${isResolved ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {isResolved ? <CheckCircleIcon className="w-4 h-4 mr-2" /> : <ShieldAlert className="w-4 h-4 mr-2" />}
                                        {isResolved ? 'CASE RESOLVED' : 'SOS ACTIVE'}
                                    </h3>
                                    {isResolved ? (
                                        <button
                                            onClick={() => setDismissedAlertIds(prev => [...prev, activeAlert.id])}
                                            className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-full font-bold shadow-sm transition-colors"
                                        >
                                            DISMISS
                                        </button>
                                    ) : (
                                        <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                                            {activeAlert.status.replace('_', ' ')}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    {activeAlert.responder && (
                                        <div className="bg-slate-900/50 p-3 rounded-lg flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                                                <Phone className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 uppercase">Responder Assigned</p>
                                                <p className="text-sm font-bold text-white">
                                                    {activeAlert.responder.name}
                                                </p>
                                                <p className="text-xs text-brand-accent">
                                                    {activeAlert.responder.contact}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {isResolved && activeAlert.resolutionNotes && (
                                        <div className="bg-emerald-900/30 p-2 rounded text-xs text-emerald-200 border border-emerald-500/30 mb-2">
                                            <strong>Resolution:</strong> {activeAlert.resolutionNotes}
                                        </div>
                                    )}

                                    <div className="text-xs text-slate-400 space-y-1 pl-2 border-l border-slate-700">
                                        {activeAlert.timeline?.slice().reverse().map((log, i) => (
                                            <p key={i}>
                                                <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span> - <span className="text-slate-300">{log.note}</span>
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-brand-800/50 border border-slate-700 p-4 rounded-xl">
                            <h3 className="text-slate-400 text-xs uppercase font-bold mb-3">Nearby Incidents (Same City)</h3>
                            {alerts.filter(a => {
                                // 1. Exclude own alerts
                                if (a.userId === user.id) return false;
                                // 2. Exclude resolved
                                if (a.status === 'RESOLVED') return false;

                                // 3. Check City Proximity (approx 20km radius)
                                const center = cityLocation || { lat: location.x, lng: location.y }; // Fallback to user loc
                                const R = 6371; // Radius of the earth in km
                                const dLat = (a.location.x - center.lat) * (Math.PI / 180);
                                const dLon = (a.location.y - center.lng) * (Math.PI / 180);
                                const lat1 = center.lat * (Math.PI / 180);
                                const lat2 = a.location.x * (Math.PI / 180);

                                const haversine =
                                    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                                    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
                                const c = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
                                const distance = R * c; // Distance in km

                                return distance <= 20; // Show only if within 20km
                            }).length === 0 ? (
                                <p className="text-emerald-500 text-sm flex items-center">
                                    <CheckCircleIcon className="w-4 h-4 mr-2" /> No active incidents nearby.
                                </p>
                            ) : (
                                <ul className="space-y-2">
                                    {alerts.filter(a => {
                                        if (a.userId === user.id) return false;
                                        if (a.status === 'RESOLVED') return false;

                                        const center = cityLocation || { lat: location.x, lng: location.y };
                                        const R = 6371;
                                        const dLat = (a.location.x - center.lat) * (Math.PI / 180);
                                        const dLon = (a.location.y - center.lng) * (Math.PI / 180);
                                        const lat1 = center.lat * (Math.PI / 180);
                                        const lat2 = a.location.x * (Math.PI / 180);
                                        const haversine = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
                                        const distance = R * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

                                        return distance <= 20;
                                    }).map(a => (
                                        <li key={a.id} className="text-sm text-brand-danger flex items-center bg-brand-danger/10 p-2 rounded justify-between">
                                            <div className="flex items-center">
                                                <ShieldAlert className="w-4 h-4 mr-2" />
                                                <span>{a.type}</span>
                                            </div>
                                            <span className="text-[10px] bg-brand-danger/20 px-1 rounded text-brand-danger">
                                                {/* Calculate distance for display */}
                                                {(() => {
                                                    const center = cityLocation || { lat: location.x, lng: location.y };
                                                    const R = 6371;
                                                    const dLat = (a.location.x - center.lat) * (Math.PI / 180);
                                                    const dLon = (a.location.y - center.lng) * (Math.PI / 180);
                                                    const lat1 = center.lat * (Math.PI / 180);
                                                    const lat2 = a.location.x * (Math.PI / 180);
                                                    const h = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
                                                    return (R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))).toFixed(1);
                                                })()} km away
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <EmergencyContacts userId={user.id} />

                    </div>
                )}

                {/* Map Tab */}
                {activeTab === 'map' && (
                    <div className="h-full w-full absolute inset-0 pt-16 pb-20 bg-brand-900">
                        <MapVisualization
                            userLocation={location}
                            alerts={alerts}
                            showHeatmap={true}
                            cityLocation={cityLocation}
                        />
                    </div>
                )}

                {/* ID Card Tab - Scrollable */}
                {activeTab === 'id' && (
                    <div className="w-full min-h-full flex flex-col items-center py-8">
                        {/* Spacer to push content down if needed, or margin auto handles centering */}
                        <div className="my-auto w-full max-w-sm flex flex-col items-center">
                            <h2 className="text-xl font-bold text-white mb-6">Digital Identity</h2>
                            <div className="w-full mb-6">
                                <DigitalID user={user} />
                            </div>
                            <p className="text-xs text-slate-500 text-center max-w-xs">
                                This cryptographic token serves as proof of identity and travel authorization.
                                Scan to verify on the Sentinel Ledger.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Persistent Panic Button - Overlay */}
            <div className="fixed bottom-24 right-4 z-50">
                <button
                    onClick={onPanic}
                    className="w-16 h-16 rounded-full bg-brand-danger shadow-[0_0_20px_rgba(239,68,68,0.6)] flex items-center justify-center text-white border-4 border-red-400 animate-pulse-fast active:scale-95 transition-transform"
                    aria-label="PANIC"
                >
                    <ShieldAlert className="w-8 h-8" />
                </button>
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-brand-800 border-t border-slate-700 pb-safe z-40">
                <div className="flex justify-around items-center p-2">
                    <NavButton active={activeTab === 'status'} onClick={() => setActiveTab('status')} icon={<Navigation size={20} />} label="Status" />
                    <NavButton active={activeTab === 'map'} onClick={() => setActiveTab('map')} icon={<MapIcon size={20} />} label="Map" />
                    <NavButton active={activeTab === 'id'} onClick={() => setActiveTab('id')} icon={<CardIcon size={20} />} label="ID Card" />
                </div>
            </div>
        </div>
    );
};

const NavButton = ({ active, onClick, icon, label }: any) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center p-2 rounded-lg w-20 transition-all ${active ? 'text-brand-accent bg-brand-accent/10' : 'text-slate-500 hover:text-slate-300'}`}
    >
        {icon}
        <span className="text-[10px] mt-1 font-medium">{label}</span>
    </button>
);

// Helper Icons
const MapIcon = ({ size }: { size: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>;
const CardIcon = ({ size }: { size: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>;
const CheckCircleIcon = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;