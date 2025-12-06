import React, { useState } from 'react';
import { AlertTriangle, Ambulance, UserX, HelpCircle, Mic } from 'lucide-react';
import { IncidentAlert } from '../types';

interface SOSModalProps {
    onConfirm: (type: IncidentAlert['type'], description: string) => void;
    onCancel: () => void;
}

export const SOSModal: React.FC<SOSModalProps> = ({ onConfirm, onCancel }) => {
    const [selectedType, setSelectedType] = useState<IncidentAlert['type'] | null>(null);
    const [description, setDescription] = useState('');

    const emergencyTypes = [
        { type: 'HARASSMENT', label: 'Harassment', icon: <UserX className="w-6 h-6" />, color: 'bg-orange-500' },
        { type: 'MEDICAL', label: 'Medical', icon: <Ambulance className="w-6 h-6" />, color: 'bg-red-500' },
        { type: 'LOST', label: 'I am Lost', icon: <HelpCircle className="w-6 h-6" />, color: 'bg-blue-500' },
        { type: 'OTHER', label: 'Other', icon: <AlertTriangle className="w-6 h-6" />, color: 'bg-slate-500' },
    ];

    const handleSubmit = () => {
        if (selectedType) {
            onConfirm(selectedType, description);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">

                <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
                    <AlertTriangle className="text-red-500 mr-2 w-8 h-8" />
                    Emergency Assistance
                </h2>
                <p className="text-slate-400 text-sm mb-6">Select the type of emergency. Help is on the way.</p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    {emergencyTypes.map((item) => (
                        <button
                            key={item.type}
                            onClick={() => setSelectedType(item.type as any)}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${selectedType === item.type
                                    ? 'border-white bg-slate-800 scale-105 shadow-lg'
                                    : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-slate-500'
                                }`}
                        >
                            <div className={`p-3 rounded-full mb-2 ${item.color} text-white shadow-inner`}>
                                {item.icon}
                            </div>
                            <span className="text-white font-bold text-sm">{item.label}</span>
                        </button>
                    ))}
                </div>

                <div className="mb-6">
                    <label className="text-slate-400 text-xs uppercase font-bold mb-2 block">Additional Details (Optional)</label>
                    <div className="relative">
                        <textarea
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                            rows={3}
                            placeholder="Describe the situation or location markers..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <button className="absolute right-2 bottom-2 text-slate-500 hover:text-white">
                            <Mic className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex space-x-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={!selectedType}
                        onClick={handleSubmit}
                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-bold shadow-lg shadow-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
                    >
                        REQUEST HELP
                    </button>
                </div>

            </div>
        </div>
    );
};
