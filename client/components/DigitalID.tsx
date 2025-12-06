import React from 'react';
import { UserProfile } from '../types';
import { ShieldCheck, Fingerprint, Activity } from 'lucide-react';
import QRCode from "react-qr-code";

interface DigitalIDProps {
  user: UserProfile;
}

export const DigitalID: React.FC<DigitalIDProps> = ({ user }) => {
  const qrData = JSON.stringify({
    id: user.id,
    name: user.name,
    role: user.role,
    verified: true
  });

  return (
    <div className="relative group perspective-1000">
      <div className="relative w-full aspect-[1.586] rounded-2xl overflow-hidden transition-transform duration-500 transform group-hover:rotate-y-6 shadow-2xl bg-gradient-to-br from-brand-800 to-black border border-slate-700">

        {/* Holographic Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-30 pointer-events-none" />

        <div className="p-6 flex flex-col h-full justify-between relative z-10">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-8 h-8 text-brand-accent animate-pulse" />
              <div>
                <h3 className="text-brand-accent font-bold tracking-widest text-sm">TRV-01 SECURE ID</h3>
                <p className="text-[10px] text-slate-400">BLOCKCHAIN VERIFIED</p>
              </div>
            </div>
            <div className="text-right">
              <Fingerprint className="w-8 h-8 text-slate-600 ml-auto opacity-50" />
            </div>
          </div>

          <div className="flex items-end space-x-4 mt-4">
            <div className="w-24 h-24 rounded-lg bg-slate-700 overflow-hidden border-2 border-brand-accent/50 shadow-inner">
              <img src={user.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"} alt="User" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 space-y-1">
              <div>
                <label className="text-[10px] uppercase text-slate-500 tracking-wider">Name</label>
                <p className="font-semibold text-white text-lg leading-none">{user.name}</p>
              </div>
              <div>
                <label className="text-[10px] uppercase text-slate-500 tracking-wider">Role</label>
                <p className="text-slate-300 leading-none">{user.role}</p>
              </div>
              <div>
                <label className="text-[10px] uppercase text-slate-500 tracking-wider">ID Hash</label>
                <p className="text-[10px] text-brand-accent font-mono truncate w-32 md:w-48">{user.id}</p>
              </div>
            </div>
            {/* Real QR Code */}
            <div className="hidden sm:block bg-white p-1 rounded">
              <div className="w-16 h-16">
                <QRCode
                  size={256}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  value={qrData}
                  viewBox={`0 0 256 256`}
                  level="L"
                  fgColor="#000000"
                  bgColor="#FFFFFF"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
            <div className="flex items-center space-x-2 text-emerald-500">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              <span className="text-xs font-mono">ID ACTIVE</span>
            </div>
            <Activity className="w-4 h-4 text-slate-600" />
          </div>
        </div>
      </div>
    </div>
  );
};