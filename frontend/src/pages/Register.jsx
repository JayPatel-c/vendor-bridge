import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', company: '', role: 'procurement_officer', phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (form.name.trim().length < 2) return setError('Name must be at least 2 characters');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError('Please enter a valid email address');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    if (form.phone && !/^\+?[\d\s-]{7,15}$/.test(form.phone)) return setError('Please enter a valid phone number');

    setLoading(true);
    try {
      await register(form);
      navigate('/verify-email', { state: { email: form.email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: 'procurement_officer', label: 'Procurement Officer' },
    { value: 'manager', label: 'Manager / Approver' },
    { value: 'vendor', label: 'Vendor' },
    { value: 'admin', label: 'Admin' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0E0D] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-[40vw] h-[40vw] bg-green-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2 15h20" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 19V5M17 19V5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 5c2.5 6 7.5 6 10 0" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 5C4 7 2 11 2 15M17 5c3 2 5 6 5 10" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v5M9.5 8v7M14.5 8v7" />
            </svg>
            <span className="text-2xl font-bold tracking-tight text-white">
              VendorBridge
            </span>
          </Link>
          <p className="text-green-400 text-sm font-light">Create your procurement account</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-8 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-green-400 uppercase tracking-wider mb-2">Full Name *</label>
              <input name="name" value={form.name} onChange={handleChange} required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-\[#9A8678\]/40 transition-all"
                placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-xs font-medium text-green-400 uppercase tracking-wider mb-2">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-\[#9A8678\]/40 transition-all"
                placeholder="+91 9876543210" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-green-400 uppercase tracking-wider mb-2">Email *</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-\[#9A8678\]/40 transition-all"
              placeholder="you@company.com" />
          </div>

          <div>
            <label className="block text-xs font-medium text-green-400 uppercase tracking-wider mb-2">Password *</label>
            <div className="relative">
              <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} required minLength={6}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-\[#9A8678\]/40 transition-all"
                placeholder="Min 6 characters" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-400 transition-colors p-1"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                )}
              </button>
            </div>
            <p className="text-[10px] text-gray-600 mt-1.5">Must be at least 6 characters</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-green-400 uppercase tracking-wider mb-2">Company</label>
              <input name="company" value={form.company} onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-\[#9A8678\]/40 transition-all"
                placeholder="Acme Corp" />
            </div>
            <div>
              <label className="block text-xs font-medium text-green-400 uppercase tracking-wider mb-2">Role *</label>
              <select name="role" value={form.role} onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-\[#9A8678\]/40 transition-all appearance-none">
                {roles.map(r => <option key={r.value} value={r.value} className="bg-[#151C1A]">{r.label}</option>)}
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 text-sm">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-green-400 hover:text-green-400 font-medium transition-colors">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
