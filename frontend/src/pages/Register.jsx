import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', company: '', role: 'procurement_officer', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
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
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              Vendor<span className="text-green-400">Bridge</span>
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
            <input name="password" type="password" value={form.password} onChange={handleChange} required minLength={6}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-\[#9A8678\]/40 transition-all"
              placeholder="Min 6 characters" />
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
