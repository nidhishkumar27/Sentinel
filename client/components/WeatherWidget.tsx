import React, { useEffect, useState } from 'react';
import { WeatherService, WeatherData } from '../services/weather';
import { Cloud, Sun, CloudRain, Wind, Droplets, AlertTriangle, ChevronRight, AlertOctagon, Umbrella } from 'lucide-react';

interface WeatherWidgetProps {
    location: { lat: number; lng: number } | string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ location }) => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        const fetchWeather = async () => {
            setLoading(true);
            const data = await WeatherService.getWeather(location);
            setWeather(data);
            setLoading(false);
        };
        fetchWeather();
    }, [location]);

    if (loading) return <div className="p-4 text-center text-slate-400 animate-pulse">Loading Weather...</div>;
    if (!weather) return null;

    const current = weather.currentConditions;
    const today = weather.days[0];
    const alerts = weather.alerts || [];

    // Filter hourly to show current hour onwards
    const currentHour = new Date().getHours();
    const nextHours = today.hours.filter(h => parseInt(h.datetime.split(':')[0]) >= currentHour).slice(0, 6);

    const getIcon = (icon: string) => {
        if (icon.includes('rain')) return <CloudRain className="w-6 h-6 text-blue-400" />;
        if (icon.includes('cloud')) return <Cloud className="w-6 h-6 text-slate-400" />;
        return <Sun className="w-6 h-6 text-amber-400" />;
    };

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-4 shadow-lg backdrop-blur-sm">

            {/* Header & Current Temp */}
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-sm font-bold text-slate-300 uppercase flex items-center">
                        {getIcon(current.icon)}
                        <span className="ml-2">Current Weather</span>
                    </h3>
                    <p className="text-3xl font-bold text-white mt-1">{current.temp}°C</p>
                    <p className="text-xs text-slate-400">{current.conditions}</p>
                </div>
                <div className="text-right text-xs text-slate-400 space-y-1">
                    <div className="flex items-center justify-end">
                        <Wind className="w-3 h-3 mr-1" /> {current.windspeed} km/h
                    </div>
                    <div className="flex items-center justify-end">
                        <Droplets className="w-3 h-3 mr-1" /> {current.humidity}%
                    </div>
                </div>
            </div>

            {/* ALERTS SECTION */}
            {alerts.length > 0 && (
                <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 animate-pulse-slow">
                    <div className="flex items-center text-red-500 font-bold text-sm mb-1">
                        <AlertOctagon className="w-4 h-4 mr-2" />
                        WEATHER ALERT
                    </div>
                    {alerts.map((alert, idx) => (
                        <div key={idx} className="mb-2 last:mb-0">
                            <p className="text-xs font-bold text-red-300">{alert.event}</p>
                            <p className="text-[10px] text-slate-400 line-clamp-2">{alert.description}</p>
                            <p className="text-[10px] text-red-400 mt-1 font-mono italic">
                                <Umbrella className="w-3 h-3 inline mr-1" />
                                Recommended: Stay indoors.
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Precautions based on generic conditions */}
            {current.temp > 35 && (
                <div className="bg-orange-900/20 border border-orange-500/30 rounded p-2 text-xs text-orange-300 flex items-start">
                    <AlertTriangle className="w-3 h-3 mr-2 mt-0.5 shrink-0" />
                    <span>High Heat: Stay hydrated and avoid direct sun.</span>
                </div>
            )}
            {current.conditions.toLowerCase().includes('rain') && (
                <div className="bg-blue-900/20 border border-blue-500/30 rounded p-2 text-xs text-blue-300 flex items-start">
                    <Umbrella className="w-3 h-3 mr-2 mt-0.5 shrink-0" />
                    <span>Rain detected: Carry an umbrella and drive carefully.</span>
                </div>
            )}

            {/* Hourly Forecast */}
            <div>
                <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Hourly Forecast</h4>
                <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                    {nextHours.map((hour, idx) => (
                        <div key={idx} className="flex flex-col items-center justify-center min-w-[50px] bg-slate-700/30 rounded p-2">
                            <span className="text-[10px] text-slate-400">{hour.datetime.split(':')[0]}:00</span>
                            <div className="my-1 scale-75">{getIcon(hour.icon)}</div>
                            <span className="text-xs font-bold text-white">{Math.round(hour.temp)}°</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Daily Forecast Toggle */}
            <div className="pt-2 border-t border-slate-700/50">
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="w-full flex items-center justify-center text-xs text-slate-400 hover:text-white transition-colors py-1"
                >
                    <span className="mr-1">{expanded ? 'Hide 7-Day Forecast' : 'Show 7-Day Forecast'}</span>
                    <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? '-rotate-90' : 'rotate-90'}`} />
                </button>

                {/* Collapsible Content */}
                {expanded && (
                    <div className="mt-2 space-y-2 animate-in slide-in-from-top-2 duration-300">
                        {weather.days.slice(1, 8).map((day, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs p-1 hover:bg-slate-700/30 rounded transition-colors">
                                <span className="text-slate-300 w-24">
                                    {new Date(day.datetime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                </span>
                                <div className="flex items-center text-slate-400">
                                    {getIcon(day.icon)}
                                    <span className="ml-2 w-20 truncate">{day.conditions}</span>
                                </div>
                                <div className="flex items-center space-x-2 w-16 justify-end">
                                    <span className="font-bold text-white">{Math.round(day.tempmax)}°</span>
                                    <span className="text-slate-500">{Math.round(day.tempmin)}°</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
