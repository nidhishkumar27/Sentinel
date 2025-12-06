import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Briefcase, Building2, MapPin, Mail, Phone, BadgeCheck, Camera, ArrowLeft } from 'lucide-react';
import { AppMode } from '../types';
import { api } from '../services/api';

interface AuthScreenProps {
  onLogin: (mode: AppMode, user: any) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [step, setStep] = useState<'SELECTION' | 'AUTH'>('SELECTION');
  const [isRegistering, setIsRegistering] = useState(false);
  const [role, setRole] = useState<'TOURIST' | 'AUTHORITY'>('TOURIST');

  // Common Fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Tourist Fields
  const [name, setName] = useState('');

  // Agency Fields
  const [agencyName, setAgencyName] = useState('');
  const [agencyType, setAgencyType] = useState('Police');
  const [officialEmail, setOfficialEmail] = useState('');
  const [officialPhone, setOfficialPhone] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [officerName, setOfficerName] = useState('');
  const [designation, setDesignation] = useState('');
  const [officerId, setOfficerId] = useState('');
  const [geoRadius, setGeoRadius] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (selectedRole: 'TOURIST' | 'AUTHORITY') => {
    setRole(selectedRole);
    setStep('AUTH');
    setIsRegistering(false); // Default to login
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;
      if (isRegistering) {
        const payload = role === 'TOURIST'
          ? { username, password, name, role }
          : {
            username, password, role: 'AUTHORITY',
            name: agencyName, // Agency Name as main name
            agencyType, officialEmail, officialPhone, jurisdiction,
            officerName, designation, officerId, geoRadius
          };

        response = await api.register(payload);
        response = await api.login({ username, password, role });
      } else {
        response = await api.login({ username, password, role });
      }

      if (response.token) {
        localStorage.setItem('sentinel_token', response.token);
        const mappedMode = response.user.role === 'AUTHORITY' || response.user.role === 'AGENCY'
          ? AppMode.AUTHORITY
          : AppMode.TOURIST;
        onLogin(mappedMode, response.user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full bg-brand-900 relative overflow-y-auto">
      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-accent/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="flex flex-col items-center justify-center min-h-full p-6">

        {/* --- STEP 1: ROLE SELECTION --- */}
        {step === 'SELECTION' && (
          <div className="w-full max-w-4xl z-10 animate-fade-in-up">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-accent/20 rounded-full mb-4 ring-4 ring-brand-accent/40 shadow-[0_0_30px_rgba(14,165,233,0.3)]">
                <ShieldCheck className="w-10 h-10 text-brand-accent" />
              </div>
              <h1 className="text-4xl font-bold text-white tracking-tight mb-2">SENTINEL</h1>
              <p className="text-slate-400 text-lg">Select your portal to continue</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tourist Card */}
              <button
                onClick={() => handleRoleSelect('TOURIST')}
                className="group relative overflow-hidden bg-brand-800/50 backdrop-blur-sm border border-slate-700 rounded-3xl p-8 transition-all duration-300 hover:border-brand-accent hover:bg-brand-800 hover:shadow-[0_0_30px_rgba(14,165,233,0.2)] text-left"
              >
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Briefcase className="w-32 h-32" />
                </div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4 text-blue-400 group-hover:scale-110 transition-transform">
                    <User className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Tourist</h3>
                  <p className="text-sm text-slate-400 text-center">Safety companion, risk alerts, and emergency assistance.</p>
                </div>
              </button>

              {/* Authority Card */}
              <button
                onClick={() => handleRoleSelect('AUTHORITY')}
                className="group relative overflow-hidden bg-brand-800/50 backdrop-blur-sm border border-slate-700 rounded-3xl p-8 transition-all duration-300 hover:border-indigo-500 hover:bg-brand-800 hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] text-left"
              >
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Building2 className="w-32 h-32" />
                </div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-4 text-indigo-400 group-hover:scale-110 transition-transform">
                    <BadgeCheck className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Agency</h3>
                  <p className="text-sm text-slate-400 text-center">Command center for Authorities, Police, and Responders.</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* --- STEP 2: LOGIN / REGISTER FORM --- */}
        {step === 'AUTH' && (
          <div className={`bg-brand-800/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-slate-700 w-full z-10 transition-all duration-300 animate-fade-in ${role === 'AUTHORITY' && isRegistering ? 'max-w-2xl' : 'max-w-sm'}`}>
            <button onClick={() => setStep('SELECTION')} className="text-slate-500 hover:text-white mb-4 flex items-center text-sm transition-colors">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </button>

            <div className="flex flex-col items-center mb-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg ${role === 'TOURIST' ? 'bg-blue-500/20 text-blue-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                {role === 'TOURIST' ? <User className="w-7 h-7" /> : <BadgeCheck className="w-7 h-7" />}
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">{role === 'TOURIST' ? 'Tourist Portal' : 'Agency Portal'}</h1>
            </div>

            {error && <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 text-xs text-center">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* --- AGENCY REGISTRATION FORM --- */}
              {isRegistering && role === 'AUTHORITY' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="md:col-span-2"><h3 className="text-white text-sm font-bold border-b border-slate-700 pb-1 mb-2">A. Agency Info</h3></div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-slate-400 ml-1">Agency Name</label>
                    <input className="w-full bg-brand-900 border border-slate-600 rounded-lg p-2 text-white" placeholder="e.g. Mysuru Tourist Police" value={agencyName} onChange={e => setAgencyName(e.target.value)} required />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 ml-1">Type</label>
                    <select className="w-full bg-brand-900 border border-slate-600 rounded-lg p-2 text-white" value={agencyType} onChange={e => setAgencyType(e.target.value)}>
                      <option>Police</option><option>Emergency</option><option>Tourism Department</option><option>Hospital</option><option>Volunteer</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 ml-1">Geo Radius (km)</label>
                    <input type="number" className="w-full bg-brand-900 border border-slate-600 rounded-lg p-2 text-white" placeholder="e.g. 5" value={geoRadius} onChange={e => setGeoRadius(e.target.value)} />
                  </div>

                  <div className="md:col-span-2 mt-2"><h3 className="text-white text-sm font-bold border-b border-slate-700 pb-1 mb-2">B. Contact & Jurisdiction</h3></div>
                  <div>
                    <label className="text-xs text-slate-400 ml-1">Official Email</label>
                    <input type="email" className="w-full bg-brand-900 border border-slate-600 rounded-lg p-2 text-white" placeholder="official@gov.in" value={officialEmail} onChange={e => setOfficialEmail(e.target.value)} required />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 ml-1">Hotline / Phone</label>
                    <input type="tel" className="w-full bg-brand-900 border border-slate-600 rounded-lg p-2 text-white" placeholder="+91 9900..." value={officialPhone} onChange={e => setOfficialPhone(e.target.value)} required />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-slate-400 ml-1">Jurisdiction Area</label>
                    <input className="w-full bg-brand-900 border border-slate-600 rounded-lg p-2 text-white" placeholder="e.g. Mysore Palace & Surroundings" value={jurisdiction} onChange={e => setJurisdiction(e.target.value)} required />
                  </div>

                  <div className="md:col-span-2 mt-2"><h3 className="text-white text-sm font-bold border-b border-slate-700 pb-1 mb-2">C. Officer Details</h3></div>
                  <div>
                    <label className="text-xs text-slate-400 ml-1">Officer Name</label>
                    <input className="w-full bg-brand-900 border border-slate-600 rounded-lg p-2 text-white" placeholder="Name" value={officerName} onChange={e => setOfficerName(e.target.value)} required />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 ml-1">Designation</label>
                    <input className="w-full bg-brand-900 border border-slate-600 rounded-lg p-2 text-white" placeholder="Rank/Role" value={designation} onChange={e => setDesignation(e.target.value)} required />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-slate-400 ml-1">Officer ID / Badge No</label>
                    <input className="w-full bg-brand-900 border border-slate-600 rounded-lg p-2 text-white" placeholder="GOV-ID-1234" value={officerId} onChange={e => setOfficerId(e.target.value)} required />
                  </div>

                  <div className="md:col-span-2 mt-2"><h3 className="text-white text-sm font-bold border-b border-slate-700 pb-1 mb-2">D. Login Credentials</h3></div>
                </div>
              )}

              {/* --- TOURIST / SIMPLE LOGIN FORM --- */}
              {(!isRegistering || role === 'TOURIST') && (
                <>
                  {isRegistering && (
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 text-slate-500 w-5 h-5" />
                      <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-brand-900 border border-slate-600 rounded-xl py-3 pl-10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-accent" required />
                    </div>
                  )}
                </>
              )}

              {/* --- CREDENTIALS (COMMON) --- */}
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-slate-500 w-5 h-5" />
                <input type="text" placeholder={role === 'AUTHORITY' ? "Agency Code / Username" : "Username"} value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-brand-900 border border-slate-600 rounded-xl py-3 pl-10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-accent" required />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-slate-500 w-5 h-5" />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-brand-900 border border-slate-600 rounded-xl py-3 pl-10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-accent" required />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full text-white py-3 rounded-xl font-bold transition-all duration-300 transform active:scale-95 disabled:opacity-50 mt-4 ${role === 'TOURIST' ? 'bg-gradient-to-r from-blue-500 to-blue-700 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]' : 'bg-gradient-to-r from-indigo-500 to-indigo-700 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]'}`}
              >
                {loading ? 'Processing...' : (isRegistering ? (role === 'AUTHORITY' ? 'Register Agency' : 'Create Account') : 'Access Portal')}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                className="text-xs text-slate-400 hover:text-white underline decoration-slate-600 underline-offset-4 transition-colors"
              >
                {isRegistering ? 'Already have an account? Login' : 'New User? Create Account'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};