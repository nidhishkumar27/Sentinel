import React, { useState } from 'react';
import { IncidentAlert, Coordinate } from '../types';
import { MapVisualization } from './MapVisualization';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertOctagon, Radio, Shield, Users, Map as MapIcon, LogOut, CheckCircle, Phone, Navigation, ArrowRight, Clock, UserCheck, Play, Siren, Ambulance, User } from 'lucide-react';
import { api } from '../services/api';

interface AuthorityDashboardProps {
    alerts: IncidentAlert[];
    userLocation: Coordinate;
    onLogout: () => void;
}



export const AuthorityDashboard: React.FC<AuthorityDashboardProps> = ({ alerts, userLocation, onLogout }) => {
    const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
    const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
    const selectedAlert = alerts.find(a => a.id === selectedAlertId);

    const getPriorityScore = (type: string) => {
        switch (type) {
            case 'MEDICAL': return 3;
            case 'PANIC': return 2;
            case 'HARASSMENT': return 2;
            case 'LOST': return 1;
            default: return 0;
        }
    };

    // Sort by Priority (Descending) then Time (Ascending - oldest first for fairness within same priority)
    const pendingAlerts = alerts
        .filter(a => a.status === 'PENDING')
        .sort((a, b) => {
            const priorityDiff = getPriorityScore(b.type) - getPriorityScore(a.type);
            if (priorityDiff !== 0) return priorityDiff;
            return a.timestamp - b.timestamp;
        });

    const activeAlerts = alerts.filter(a => a.status === 'IN_PROGRESS');

    // Generate Real Stats for Chart
    const generateStats = () => {
        if (alerts.length === 0) return [];

        const now = Date.now();
        const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

        // Create 6 buckets of 4 hours
        const stats = [];
        for (let i = 0; i <= 6; i++) {
            const timePoint = twentyFourHoursAgo + (i * 4 * 60 * 60 * 1000);
            const date = new Date(timePoint);
            const label = date.getHours().toString().padStart(2, '0') + ':00';

            // Count cumulative totals up to this timePoint
            const requestedCount = alerts.filter(a => a.timestamp <= timePoint).length;
            const resolvedCount = alerts.filter(a => {
                // Find if it was resolved before this timePoint
                const resolutionEvent = a.timeline?.find(e => e.status === 'RESOLVED');
                return resolutionEvent && resolutionEvent.timestamp <= timePoint;
            }).length;

            stats.push({
                name: label,
                requested: requestedCount,
                resolved: resolvedCount
            });
        }
        return stats;
    };

    const realStats = generateStats();

    const handleOpenDispatch = () => {
        setDispatchModalOpen(true);
    };

    const handleConfirmDispatch = async (teamType: string) => {
        if (!selectedAlert) return;

        try {
            await api.updateAlert(selectedAlert.id, {
                status: 'IN_PROGRESS',
                responder: {
                    name: `${teamType} Unit`,
                    designation: `Rapid Response ${teamType}`,
                    contact: '112'
                },
                timeline: [
                    ...(selectedAlert.timeline || []),
                    { status: 'IN_PROGRESS', note: `Team Dispatched: ${teamType}`, timestamp: Date.now() }
                ]
            });
            setDispatchModalOpen(false);
            window.alert(`✅ DISPATCHED: ${teamType} Unit sent to location.`);
        } catch (err) {
            console.error("Failed to dispatch", err);
            window.alert("Failed to update status.");
        }
    };

    const handleStatusUpdate = async (incident: IncidentAlert, note: string) => {
        try {
            await api.updateAlert(incident.id, {
                timeline: [
                    ...(incident.timeline || []),
                    { status: 'IN_PROGRESS', note: note, timestamp: Date.now() }
                ]
            });
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    const handleResolve = async (alertId: string, notes: string) => {
        const incident = alerts.find(a => a.id === alertId);
        try {
            await api.updateAlert(alertId, {
                status: 'RESOLVED',
                resolutionNotes: notes,
                timeline: [
                    ...(incident?.timeline || []),
                    { status: 'RESOLVED', note: `Case Resolved: ${notes}`, timestamp: Date.now() }
                ]
            });
            setSelectedAlertId(null); // Go back to dashboard
        } catch (err) {
            console.error("Failed to resolve alert", err);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans relative">

            {/* Dispatch Modal */}
            {dispatchModalOpen && selectedAlert && (
                <div className="absolute inset-0 z-[500] bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                            <Siren className="w-6 h-6 mr-2 text-red-500 animate-pulse" /> Dispatch Emergency Unit
                        </h2>
                        <p className="text-slate-400 mb-6">Select the appropriate response team for <strong>{selectedAlert.type}</strong> at Sector A-9.</p>

                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => handleConfirmDispatch('POLICE')} className="p-4 bg-blue-900/30 border border-blue-500/50 hover:bg-blue-900/50 rounded-xl flex flex-col items-center gap-2 transition-all hover:scale-105 group">
                                <Shield className="w-8 h-8 text-blue-400 group-hover:text-blue-300" />
                                <span className="text-blue-200 font-bold">POLICE</span>
                            </button>
                            <button onClick={() => handleConfirmDispatch('AMBULANCE')} className="p-4 bg-red-900/30 border border-red-500/50 hover:bg-red-900/50 rounded-xl flex flex-col items-center gap-2 transition-all hover:scale-105 group">
                                <Ambulance className="w-8 h-8 text-red-400 group-hover:text-red-300" />
                                <span className="text-red-200 font-bold">MEDICAL</span>
                            </button>
                            <button onClick={() => handleConfirmDispatch('VOLUNTEER')} className="p-4 bg-amber-900/30 border border-amber-500/50 hover:bg-amber-900/50 rounded-xl flex flex-col items-center gap-2 transition-all hover:scale-105 group">
                                <Users className="w-8 h-8 text-amber-400 group-hover:text-amber-300" />
                                <span className="text-amber-200 font-bold">VOLUNTEER</span>
                            </button>
                            <button onClick={() => handleConfirmDispatch('FIRE')} className="p-4 bg-orange-900/30 border border-orange-500/50 hover:bg-orange-900/50 rounded-xl flex flex-col items-center gap-2 transition-all hover:scale-105 group">
                                <AlertOctagon className="w-8 h-8 text-orange-400 group-hover:text-orange-300" />
                                <span className="text-orange-200 font-bold">FIRE / RESCUE</span>
                            </button>
                        </div>

                        <button
                            onClick={() => setDispatchModalOpen(false)}
                            className="w-full mt-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900 shadow-lg z-10 shrink-0">
                <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setSelectedAlertId(null)}>
                    <Shield className="text-brand-accent w-8 h-8" />
                    <div>
                        <h1 className="text-lg font-bold tracking-widest text-white">TRV-01 COMMAND</h1>
                        <p className="text-[10px] text-slate-400 font-mono">INCIDENT RESPONSE SYSTEM v2.1</p>
                    </div>
                </div>
                <div className="flex items-center space-x-6">
                    {selectedAlert && (
                        <div className="hidden md:flex items-center space-x-2 bg-slate-800 px-3 py-1 rounded-full animate-fadeIn">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            <span className="text-xs font-bold text-red-100">ACTIVE INCIDENT: {selectedAlert.id}</span>
                        </div>
                    )}
                    <div className="h-8 w-px bg-slate-700 mx-2"></div>
                    <button
                        onClick={onLogout}
                        className="flex items-center space-x-2 text-slate-400 hover:text-red-500 transition-colors text-sm font-medium"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Exit</span>
                    </button>
                </div>
            </header>

            {/* Content Grid */}
            <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">

                {/* Left Sidebar - Alert Feed */}
                <aside className="col-span-12 md:col-span-3 border-r border-slate-800 bg-slate-900/50 flex flex-col h-full min-h-0">

                    {/* Pending Section */}
                    {pendingAlerts.length > 0 && (
                        <div className="flex-shrink-0 max-h-[50%] flex flex-col border-b border-slate-800">
                            <div className="p-4 bg-red-900/20 shrink-0 sticky top-0">
                                <h3 className="text-xs font-bold text-red-400 uppercase flex items-center animate-pulse">
                                    <Radio className="w-4 h-4 mr-2" /> Pending Dispatch ({pendingAlerts.length})
                                </h3>
                            </div>
                            <div className="overflow-y-auto p-2 space-y-2">
                                {pendingAlerts.map(alert => (
                                    <div
                                        key={alert.id}
                                        onClick={() => setSelectedAlertId(alert.id)}
                                        className={`border-l-4 p-3 rounded cursor-pointer transition-all ${selectedAlertId === alert.id
                                            ? 'bg-slate-800 border-white shadow-lg'
                                            : 'bg-slate-800/30 border-red-500 hover:bg-slate-800'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-bold uppercase text-red-400">{alert.type}</span>
                                            <span className="text-[10px] text-slate-500 font-mono">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                        <p className="text-xs text-slate-300 mb-1 font-semibold truncate">{alert.description || "Emergency reported"}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Active Section */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="p-4 bg-slate-900 shrink-0 sticky top-0 border-b border-slate-800">
                            <h3 className="text-xs font-bold text-emerald-500 uppercase flex items-center">
                                <Shield className="w-4 h-4 mr-2" /> Active Operations ({activeAlerts.length})
                            </h3>
                        </div>
                        <div className="overflow-y-auto p-2 space-y-2 flex-1">
                            {activeAlerts.length === 0 ? (
                                <div className="text-center py-10 text-slate-600 italic text-xs">No active missions.</div>
                            ) : (
                                activeAlerts.map(alert => (
                                    <div
                                        key={alert.id}
                                        onClick={() => setSelectedAlertId(alert.id)}
                                        className={`border-l-4 p-3 rounded cursor-pointer transition-all ${selectedAlertId === alert.id
                                            ? 'bg-slate-800 border-white shadow-lg'
                                            : 'bg-slate-800/30 border-emerald-500 hover:bg-slate-800'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-bold uppercase text-emerald-400">{alert.type}</span>
                                            <span className="text-[10px] text-slate-500 font-mono">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                        <p className="text-xs text-slate-300 truncate">{alert.description || "Operation in progress"}</p>
                                        <p className="text-[10px] text-brand-accent mt-1">{alert.responder?.name || "Unit Assigned"}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </aside>

                {/* Center & Right Area */}
                <main className="col-span-12 md:col-span-9 bg-slate-950 relative flex flex-col md:flex-row h-full overflow-hidden">

                    {/* View Switcher based on selection */}
                    {!selectedAlert ? (
                        <>
                            {/* Dashboard Mode (Map + Stats) */}
                            <div className="flex-1 bg-slate-950 relative border-r border-slate-800 h-full">
                                <div className="absolute top-4 left-4 z-[400] bg-black/50 backdrop-blur px-3 py-1 rounded border border-slate-700">
                                    <span className="text-xs text-brand-accent font-mono">GLOBAL OVERVIEW</span>
                                </div>
                                <MapVisualization key="global-map" userLocation={userLocation} alerts={alerts} showHeatmap={true} />
                            </div>
                            <div className="w-full md:w-80 bg-slate-900/30 border-l border-slate-800 p-4 space-y-6 overflow-y-auto hidden md:block">
                                <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">System Stats</h3>
                                <div className="h-40 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={realStats}>
                                            <defs>
                                                <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                                                itemStyle={{ fontSize: '12px' }}
                                            />
                                            <Area type="monotone" dataKey="requested" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorReq)" name="Total Requested" strokeWidth={2} />
                                            <Area type="monotone" dataKey="resolved" stroke="#10b981" fillOpacity={1} fill="url(#colorRes)" name="Cases Resolved" strokeWidth={2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Incident Detail Mode */}
                            {/* Incident Map (Left/Top) */}
                            <div className="flex-1 bg-slate-950 relative border-r border-slate-800 h-1/2 md:h-full">
                                <div className="absolute top-4 left-4 z-[400] bg-red-900/80 backdrop-blur px-3 py-1 rounded border border-red-500 animate-pulse">
                                    <span className="text-xs text-white font-mono font-bold">INCIDENT COMMAND: {selectedAlert.id}</span>
                                </div>
                                {/* Focus map on specific alert */}
                                <MapVisualization
                                    key={`incident-map-${selectedAlert.id}`}
                                    userLocation={userLocation}
                                    alerts={[selectedAlert]}
                                    cityLocation={{ name: "Incident Loc", lat: selectedAlert.location.x, lng: selectedAlert.location.y }}
                                    zoom={16}
                                    markerLabel="Subject Location"
                                />
                            </div>

                            {/* Action Panel (Right/Bottom) */}
                            <div className="w-full md:w-96 bg-slate-900 border-l border-slate-800 p-0 flex flex-col h-1/2 md:h-full overflow-hidden">
                                <div className="p-6 border-b border-slate-800 bg-slate-800/50">
                                    <h2 className="text-xl font-bold text-white mb-1">{selectedAlert.type} EMERGENCY</h2>
                                    <p className="text-sm text-slate-400">{selectedAlert.description || "No specific details provided."}</p>
                                    <div className="flex space-x-2 mt-4">
                                        <button
                                            onClick={() => {
                                                window.alert(`Calling Tourist at: +91 98765 43210...`);
                                                window.location.href = 'tel:+919876543210';
                                            }}
                                            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded flex items-center justify-center text-xs font-bold transition">
                                            <Phone className="w-3 h-3 mr-2" /> CALL TOURIST
                                        </button>
                                        <button
                                            onClick={() => {
                                                window.open(`https://www.google.com/maps/search/?api=1&query=${selectedAlert.location.x},${selectedAlert.location.y}`, '_blank');
                                            }}
                                            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded flex items-center justify-center text-xs font-bold transition">
                                            <Navigation className="w-3 h-3 mr-2" /> NAVIGATE
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                    {/* Workflow Actions */}
                                    {selectedAlert.status === 'PENDING' && (
                                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                                            <h3 className="text-red-400 font-bold text-sm mb-2">Incoming Alert</h3>
                                            <button
                                                onClick={handleOpenDispatch}
                                                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded shadow-lg shadow-red-900/20 flex items-center justify-center"
                                            >
                                                <UserCheck className="w-4 h-4 mr-2" /> DISPATCH UNIT
                                            </button>
                                        </div>
                                    )}

                                    {selectedAlert.status === 'IN_PROGRESS' && (
                                        <div className="space-y-4">
                                            <div className="p-3 bg-emerald-900/20 border border-emerald-500/30 rounded flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <CheckCircle className="w-5 h-5 text-emerald-500 mr-2" />
                                                    <div>
                                                        <p className="text-sm font-bold text-emerald-400">Response Active</p>
                                                        <p className="text-xs text-slate-400">{selectedAlert.responder?.name}</p>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded">ON DUTY</span>
                                            </div>

                                            <h3 className="text-xs font-bold text-slate-500 uppercase mt-4">Update Status</h3>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button onClick={() => handleStatusUpdate(selectedAlert, "Unit Dispatching")} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-700">Team Dispatched</button>
                                                <button onClick={() => handleStatusUpdate(selectedAlert, "Unit On-Scene")} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-700">Reached Scene</button>
                                            </div>

                                            <div className="pt-4 border-t border-slate-800">
                                                <h3 className="text-xs font-bold text-emerald-500 uppercase mb-2">Resolution</h3>
                                                <button
                                                    onClick={() => {
                                                        const notes = window.prompt("Enter Resolution Notes:");
                                                        if (notes) handleResolve(selectedAlert.id, notes);
                                                    }}
                                                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded flex items-center justify-center"
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-2" /> MARK RESOLVED
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Timeline */}
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center">
                                            <Clock className="w-3 h-3 mr-2" /> Activity Log
                                        </h3>
                                        <div className="space-y-4 border-l-2 border-slate-700 ml-1 pl-4 relative">
                                            {selectedAlert.timeline?.slice().reverse().map((log, idx) => (
                                                <div key={idx} className="relative">
                                                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-slate-600 border-2 border-slate-900"></div>
                                                    <p className="text-xs text-slate-300">{log.note}</p>
                                                    <p className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</p>
                                                </div>
                                            ))}
                                            <div className="relative">
                                                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-red-500 border-2 border-slate-900"></div>
                                                <p className="text-xs text-white">Emergency Reported</p>
                                                <p className="text-[10px] text-slate-500">{new Date(selectedAlert.timestamp).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};