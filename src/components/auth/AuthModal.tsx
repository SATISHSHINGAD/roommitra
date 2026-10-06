import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { UserRole } from '../../types/index.ts';
import { X, Lock, Mail, User as UserIcon, Phone, MapPin, AlertCircle, CheckCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: UserRole;
  initialMode?: 'LOGIN' | 'REGISTER';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultRole, initialMode = 'LOGIN' }) => {
  const { login, register, demoLogin } = useAuth();
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'FORGOT'>(initialMode);

  // Sync mode when initialMode changes or modal opens
  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode || 'LOGIN');
    }
  }, [isOpen, initialMode]);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [role, setRole] = useState<UserRole>(defaultRole || 'USER');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === 'LOGIN') {
        await login(email, password);
        onClose();
      } else if (mode === 'REGISTER') {
        await register({ name, email, password, phone, role, city });
        onClose();
      } else if (mode === 'FORGOT') {
        setSuccess('Password reset link has been dispatched to your email address.');
      }
    } catch (err: any) {
      setError(err.message || 'Operation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = async (selectedRole: UserRole) => {
    setError(null);
    setLoading(true);
    try {
      await demoLogin(selectedRole);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden relative">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900 font-display">
              {mode === 'LOGIN' && 'Sign in to RoomMitra'}
              {mode === 'REGISTER' && 'Create your account'}
              {mode === 'FORGOT' && 'Reset Password'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === 'LOGIN' && 'Access verified rooms, roommates, and tiffin bookings'}
              {mode === 'REGISTER' && 'Join India’s trusted zero-brokerage coliving network'}
              {mode === 'FORGOT' && 'Enter your registered email to receive reset code'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Selector */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-100">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            One-Click Instant Demo Login:
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => handleDemoSelect('USER')}
              className="px-2 py-1.5 bg-white border border-slate-200 hover:border-amber-500 rounded text-slate-700 font-medium hover:text-amber-600 transition-colors text-left"
            >
              👤 Tenant
            </button>
            <button
              type="button"
              onClick={() => handleDemoSelect('PROPERTY_OWNER')}
              className="px-2 py-1.5 bg-white border border-slate-200 hover:border-amber-500 rounded text-slate-700 font-medium hover:text-amber-600 transition-colors text-left"
            >
              🏠 Landlord
            </button>
            <button
              type="button"
              onClick={() => handleDemoSelect('ROOMMATE')}
              className="px-2 py-1.5 bg-white border border-slate-200 hover:border-amber-500 rounded text-slate-700 font-medium hover:text-amber-600 transition-colors text-left"
            >
              🤝 Roommate
            </button>
            <button
              type="button"
              onClick={() => handleDemoSelect('SERVICE_PROVIDER')}
              className="px-2 py-1.5 bg-white border border-slate-200 hover:border-amber-500 rounded text-slate-700 font-medium hover:text-amber-600 transition-colors text-left"
            >
              🍱 Tiffin Chef
            </button>
            <button
              type="button"
              onClick={() => handleDemoSelect('ADMIN')}
              className="px-2 py-1.5 bg-white border border-slate-200 hover:border-rose-500 rounded text-slate-700 font-medium hover:text-rose-600 transition-colors text-left"
            >
              🛡️ Admin
            </button>
            <button
              type="button"
              onClick={() => handleDemoSelect('SUPER_ADMIN')}
              className="px-2 py-1.5 bg-white border border-slate-200 hover:border-purple-500 rounded text-slate-700 font-medium hover:text-purple-600 transition-colors text-left"
            >
              🔑 Super Admin
            </button>
          </div>
        </div>

        {/* Content Form */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'REGISTER' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Satish Shingad"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                    <select
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                    >
                      <option value="Bengaluru">Bengaluru</option>
                      <option value="Pune">Pune</option>
                      <option value="Delhi NCR">Delhi NCR</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Chennai">Chennai</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">I want to:</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="USER">Find a Room / PG / Coliving (Tenant)</option>
                    <option value="ROOMMATE">Find a Compatible Roommate (Flatmate)</option>
                    <option value="PROPERTY_OWNER">List My Flat / PG / Room (Owner)</option>
                    <option value="SERVICE_PROVIDER">Offer Tiffin or Home Services (Provider)</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {mode !== 'FORGOT' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Password</label>
                  {mode === 'LOGIN' && (
                    <button
                      type="button"
                      onClick={() => setMode('FORGOT')}
                      className="text-xs text-amber-600 hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {loading
                ? 'Processing...'
                : mode === 'LOGIN'
                ? 'Sign In'
                : mode === 'REGISTER'
                ? 'Create Account'
                : 'Send Reset Link'}
            </button>
          </form>

          {/* Toggle link */}
          <div className="mt-4 pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
            {mode === 'LOGIN' ? (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('REGISTER');
                  }}
                  className="font-semibold text-amber-600 hover:underline"
                >
                  Register here
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('LOGIN');
                  }}
                  className="font-semibold text-amber-600 hover:underline"
                >
                  Sign in
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
