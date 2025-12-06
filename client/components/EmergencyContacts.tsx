import React, { useState, useEffect } from 'react';
import { Phone, Trash2, UserPlus, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';

interface Contact {
    _id: string;
    name: string;
    phone: string;
}

interface EmergencyContactsProps {
    userId: string;
}

export const EmergencyContacts: React.FC<EmergencyContactsProps> = ({ userId }) => {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (userId) loadContacts();
    }, [userId]);

    const loadContacts = async () => {
        try {
            const data = await api.get(`/contacts?userId=${userId}`);
            if (Array.isArray(data)) {
                setContacts(data);
            }
        } catch (err) {
            console.warn("Failed to load contacts from backend.", err);
            // setError("Could not connect to server.");
        }
    };

    const addContact = async () => {
        if (!newName || !newPhone || !userId) return;
        try {
            const newContact = await api.post('/contacts', { name: newName, phone: newPhone, userId });
            setContacts(prev => [newContact, ...prev]);
            setNewName('');
            setNewPhone('');
            setError(null);
        } catch (err) {
            setError("Failed to save contact.");
        }
    };

    const removeContact = async (id: string) => {
        try {
            await api.delete(`/contacts/${id}`);
            setContacts(prev => prev.filter(c => c._id !== id));
        } catch (err) {
            setError("Failed to delete contact.");
        }
    };

    return (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl mt-4">
            <div className="flex items-center space-x-2 mb-4 text-rose-400">
                <ShieldAlert className="w-6 h-6" />
                <h2 className="text-lg font-bold text-white">Emergency Contacts</h2>
            </div>

            <div className="space-y-4">
                {error && (
                    <div className="p-2 bg-red-900/50 text-red-200 text-xs rounded border border-red-800">
                        {error}
                    </div>
                )}

                {contacts.map(contact => (
                    <div key={contact._id} className="flex items-center justify-between bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-slate-600 rounded-full">
                                <Phone className="w-4 h-4 text-slate-300" />
                            </div>
                            <div>
                                <p className="font-medium text-slate-200">{contact.name}</p>
                                <p className="text-sm text-slate-400">{contact.phone}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => removeContact(contact._id)}
                            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-900/20 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}

                <div className="flex space-x-2 pt-2">
                    <input
                        type="text"
                        placeholder="Name"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-brand-accent"
                    />
                    <input
                        type="tel"
                        placeholder="Phone"
                        value={newPhone}
                        onChange={e => setNewPhone(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-brand-accent"
                    />
                    <button
                        onClick={addContact}
                        disabled={!newName || !newPhone}
                        className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <UserPlus className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
