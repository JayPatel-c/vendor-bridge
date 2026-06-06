import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E0D] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] bg-green-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] bg-green-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
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
          <p className="text-green-400 text-sm font-light">Sign in to your procurement workspace</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-8 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-green-400 uppercase tracking-wider mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-\[#9A8678\]/40 focus:bg-white/[0.05] transition-all"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-green-400 uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-\[#9A8678\]/40 focus:bg-white/[0.05] transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-green-400 hover:text-green-400 font-medium transition-colors">
              Create account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
