import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import { Sparkles, AlertCircle, Loader2, Lock, Mail, KeyRound } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // OTP States
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.requiresOtp) {
          setOtpStep(true);
          setError(result.error); // Show the message "A new OTP has been sent"
          return;
        }
        throw new Error(result.error || 'Login failed. Please check your credentials.');
      }

      login(result.token, result.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An unexpected connection error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'OTP verification failed.');
      }

      login(result.token, result.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Verification error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans antialiased text-gray-300">
      {/* Subtle ambient orange gradient orbs */}
      <div
        className="absolute top-1/4 -left-32 w-96 h-96 rounded-full pointer-events-none opacity-20 blur-[100px]"
        style={{ background: 'radial-gradient(circle, rgba(234, 88, 12, 0.4) 0%, rgba(245, 158, 11, 0.1) 60%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full pointer-events-none opacity-20 blur-[100px]"
        style={{ background: 'radial-gradient(circle, rgba(249, 115, 22, 0.35) 0%, rgba(217, 119, 6, 0.1) 60%, transparent 70%)' }}
      />
      <div
        className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full pointer-events-none opacity-15 blur-[120px]"
        style={{ background: 'radial-gradient(circle, rgba(249, 115, 22, 0.4) 0%, transparent 70%)' }}
      />

      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        {/* Logo above card */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-3 mb-4 group focus:outline-none">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 p-[1px] flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition duration-300">
              <div className="w-full h-full bg-[#0a0a0a] rounded-[11px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              Talent<span className="bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">AI</span>
            </span>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {otpStep ? 'Verify your Email' : 'TalentAI Portal'}
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {otpStep ? `We've sent a 6-digit code to ${email}` : 'Resume intelligence and adaptive skill assessments.'}
          </p>
        </div>

        {/* Centered card */}
        <div className="w-full bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl p-8 sm:p-10 relative overflow-hidden">
          {/* Top accent line on card */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-600 to-amber-500" />

          <h3 className="text-xl font-bold text-white mb-6">
            {otpStep ? 'Enter OTP' : 'Welcome Back'}
          </h3>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!otpStep ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-600" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 bg-[#0a0a0a] border border-white/10 text-white placeholder-gray-600 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition text-sm"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-400 mb-1.5">
                  Password
                </label>
                <div className="relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-600" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 bg-[#0a0a0a] border border-white/10 text-white placeholder-gray-600 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center py-3 px-4 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin text-orange-400" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-5" onSubmit={handleVerifyOtp}>
              <div>
                <label htmlFor="otp" className="block text-sm font-semibold text-gray-400 mb-1.5">
                  Enter 6-Digit OTP
                </label>
                <div className="relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-gray-600" />
                  </div>
                  <input
                    id="otp"
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="block w-full pl-10 pr-3 py-3 bg-[#0a0a0a] border border-white/10 text-white placeholder-gray-600 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition text-center text-2xl tracking-[0.5em] font-mono"
                    placeholder="000000"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading || otp.length < 6}
                  className="w-full flex items-center justify-center py-3 px-4 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin text-orange-400" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Email & Login'
                  )}
                </button>
              </div>
            </form>
          )}

          {!otpStep && (
            <div className="mt-6 text-center border-t border-white/[0.06] pt-6">
              <p className="text-sm text-gray-400">
                Don't have an account yet?{' '}
                <Link to="/register" className="text-orange-400 hover:text-orange-300 underline font-medium transition-colors">
                  Create an account
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
