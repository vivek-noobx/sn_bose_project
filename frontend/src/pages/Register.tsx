import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import { Sparkles, AlertCircle, Loader2, User as UserIcon, Briefcase, Mail, Lock, KeyRound } from 'lucide-react';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'candidate' | 'recruiter'>('candidate');
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
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed.');
      }

      if (result.requiresOtp) {
        setOtpStep(true);
      } else {
        register(result.token, result.user);
        navigate('/');
      }
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

      register(result.token, result.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Verification error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-accent-mint flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans antialiased text-primary-dark">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm border border-accent-teal/30 mb-4">
          <Sparkles className="w-8 h-8 text-primary-dark" />
        </div>
        <h2 className="text-3xl font-black tracking-tight text-primary-dark">
          {otpStep ? 'Verify your Email' : 'Create Account'}
        </h2>
        <p className="mt-2 text-sm text-primary-dark/75">
          {otpStep ? `We've sent a 6-digit code to ${email}` : 'Join TalentAI to analyze resumes and run adaptive job matches.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-accent-teal/20 relative overflow-hidden">
          {/* Header Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-accent-seafoam" />

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl flex items-start border border-red-100">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!otpStep ? (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Role Selection Cards */}
              <div>
                <label className="block text-sm font-semibold text-primary-dark mb-2">
                  I am registering as a:
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole('candidate')}
                    className={`flex flex-col items-center p-4 rounded-xl border-2 text-center transition-all ${
                      role === 'candidate'
                        ? 'border-accent-seafoam bg-accent-mint text-primary-dark'
                        : 'border-slate-200 hover:border-accent-teal/50 hover:bg-slate-50 text-slate-500'
                    }`}
                  >
                    <UserIcon className="w-6 h-6 mb-2 text-primary-dark" />
                    <span className="text-sm font-bold block">Candidate</span>
                    <span className="text-xxs text-slate-400 mt-1">Upload resume & match jobs</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('recruiter')}
                    className={`flex flex-col items-center p-4 rounded-xl border-2 text-center transition-all ${
                      role === 'recruiter'
                        ? 'border-accent-seafoam bg-accent-mint text-primary-dark'
                        : 'border-slate-200 hover:border-accent-teal/50 hover:bg-slate-50 text-slate-500'
                    }`}
                  >
                    <Briefcase className="w-6 h-6 mb-2 text-primary-dark" />
                    <span className="text-sm font-bold block">Recruiter</span>
                    <span className="text-xxs text-slate-400 mt-1">Review profiles & assessments</span>
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-primary-dark">
                  Full Name
                </label>
                <div className="mt-1 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-accent-teal" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-accent-teal/40 rounded-xl text-sm placeholder-accent-teal focus:outline-none focus:ring-2 focus:ring-accent-seafoam focus:border-transparent transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-primary-dark">
                  Email Address
                </label>
                <div className="mt-1 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-accent-teal" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-accent-teal/40 rounded-xl text-sm placeholder-accent-teal focus:outline-none focus:ring-2 focus:ring-accent-seafoam focus:border-transparent transition-all"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-primary-dark">
                  Password
                </label>
                <div className="mt-1 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-accent-teal" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-accent-teal/40 rounded-xl text-sm placeholder-accent-teal focus:outline-none focus:ring-2 focus:ring-accent-seafoam focus:border-transparent transition-all"
                    placeholder="At least 6 characters"
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border-0 rounded-xl shadow-md text-sm font-bold text-primary-dark bg-accent-seafoam hover:bg-accent-seafoam/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-seafoam transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin text-primary-dark" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-5" onSubmit={handleVerifyOtp}>
              <div>
                <label htmlFor="otp" className="block text-sm font-semibold text-primary-dark">
                  Enter 6-Digit OTP
                </label>
                <div className="mt-1 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-accent-teal" />
                  </div>
                  <input
                    id="otp"
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="block w-full pl-10 pr-3 py-3 border border-accent-teal/40 rounded-xl text-center text-xl tracking-[0.5em] font-mono placeholder-accent-teal focus:outline-none focus:ring-2 focus:ring-accent-seafoam focus:border-transparent transition-all"
                    placeholder="000000"
                  />
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={isLoading || otp.length < 6}
                  className="w-full flex justify-center py-3 px-4 border-0 rounded-xl shadow-md text-sm font-bold text-primary-dark bg-accent-seafoam hover:bg-accent-seafoam/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-seafoam transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin text-primary-dark" />
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
            <div className="mt-6 text-center border-t border-accent-mint pt-6">
              <p className="text-sm text-primary-dark/80">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-primary-dark underline hover:text-accent-teal transition-colors">
                  Sign in instead
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
