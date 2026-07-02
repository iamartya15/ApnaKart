import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useLoginMutation,
  useGenerateOTPMutation,
  useVerifyOTPMutation,
} from '../hooks/useAuthQueries';
import { Github, Key, Mail, ShieldAlert } from 'lucide-react';
import api from '../services/api';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isOtpMode, setIsOtpMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loginMutation = useLoginMutation();
  const sendOtpMutation = useGenerateOTPMutation();
  const verifyOtpMutation = useVerifyOTPMutation();

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          navigate('/profile');
        },
        onError: (err: any) => {
          setErrorMessage(
            err.response?.data?.message || 'Login failed. Please check your credentials.',
          );
        },
      },
    );
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    sendOtpMutation.mutate(
      { identifier: email, purpose: 'login' },
      {
        onSuccess: () => {
          setOtpSent(true);
          setSuccessMessage('OTP sent successfully! Please check your email or console logs.');
        },
        onError: (err: any) => {
          setErrorMessage(err.response?.data?.message || 'Failed to send OTP.');
        },
      },
    );
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    verifyOtpMutation.mutate(
      { identifier: email, otp: otpCode, purpose: 'login' },
      {
        onSuccess: () => {
          navigate('/profile');
        },
        onError: (err: any) => {
          setErrorMessage(err.response?.data?.message || 'Incorrect or expired OTP.');
        },
      },
    );
  };

  // Simulated Social Logins - exchanges mock codes for profile/JWT tokens instantly
  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      setErrorMessage('');
      const mockProfile =
        provider === 'google'
          ? {
              email: 'google.user@example.com',
              name: 'Google User',
              provider,
              providerId: 'google123',
            }
          : {
              email: 'github.user@example.com',
              name: 'Github User',
              provider,
              providerId: 'github456',
            };

      const response = await api.post('/auth/social-login', mockProfile);

      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      dispatch(setCredentials({ user: response.data.user, token: response.data.accessToken }));

      navigate('/profile');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Social authentication failed.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[75vh] px-4">
      <div className="w-full max-w-md p-8 rounded-3xl glass-panel shadow-2xl transition-all duration-300">
        <h2 className="text-3xl font-extrabold tracking-tight text-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
          Welcome back
        </h2>
        <p className="text-center text-sm text-muted-foreground mb-6">
          Access your personalized AI shopping experience
        </p>

        {errorMessage && (
          <div className="flex items-center gap-2 p-4 mb-4 text-sm text-red-800 rounded-2xl bg-red-50 dark:bg-red-950/30 dark:text-red-300 border border-red-200 dark:border-red-900/50">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 mb-4 text-sm text-green-800 rounded-2xl bg-green-50 dark:bg-green-950/30 dark:text-green-300 border border-green-200 dark:border-green-900/50">
            {successMessage}
          </div>
        )}

        {/* Login Form */}
        {!isOtpMode ? (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-muted-foreground">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all pl-10"
                />
                <Mail className="absolute left-3.5 top-3.5 text-muted-foreground w-4 h-4" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5 text-muted-foreground">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all pl-10"
                />
                <Key className="absolute left-3.5 top-3.5 text-muted-foreground w-4 h-4" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full py-3 rounded-2xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              {loginMutation.isPending ? 'Logging in...' : 'Sign In with Password'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-muted-foreground">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all pl-10"
                    />
                    <Mail className="absolute left-3.5 top-3.5 text-muted-foreground w-4 h-4" />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={sendOtpMutation.isPending}
                  className="w-full py-3 rounded-2xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors shadow-lg disabled:opacity-50"
                >
                  {sendOtpMutation.isPending ? 'Sending...' : 'Send Verification OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-muted-foreground">
                    One-Time Password
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    className="w-full px-4 py-3 text-center text-lg tracking-widest rounded-2xl bg-secondary/50 border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={verifyOtpMutation.isPending}
                  className="w-full py-3 rounded-2xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors shadow-lg disabled:opacity-50"
                >
                  {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify OTP & Login'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Toggle switches */}
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setIsOtpMode(!isOtpMode);
              setOtpSent(false);
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className="text-sm text-primary font-semibold hover:underline"
          >
            {isOtpMode
              ? 'Use Email & Password login instead'
              : 'Use Passwordless OTP login instead'}
          </button>
        </div>

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink mx-4 text-muted-foreground text-xs uppercase font-bold">
            Or continue with
          </span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        {/* Social Authentication buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleSocialLogin('google')}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-card border border-border hover:bg-secondary/50 transition-colors text-sm font-semibold"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </button>
          <button
            onClick={() => handleSocialLogin('github')}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-card border border-border hover:bg-secondary/50 transition-colors text-sm font-semibold"
          >
            <Github className="w-4 h-4" />
            GitHub
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Don't have an account?{' '}
          <a href="/register" className="text-primary font-semibold hover:underline">
            Register here
          </a>
        </p>
      </div>
    </div>
  );
};
export default LoginPage;
