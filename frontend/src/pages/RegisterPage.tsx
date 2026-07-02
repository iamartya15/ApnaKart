import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../hooks/useAuthQueries';
import { Mail, ShieldAlert, User, Phone, Key } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const registerMutation = useRegisterMutation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    registerMutation.mutate(
      { name, email, mobile, password },
      {
        onSuccess: (data) => {
          setSuccessMessage(
            data.message || 'Registration successful! Verification email has been sent.',
          );
          setName('');
          setEmail('');
          setMobile('');
          setPassword('');
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        },
        onError: (err: any) => {
          setErrorMessage(
            err.response?.data?.message || 'Registration failed. Please check details.',
          );
        },
      },
    );
  };

  return (
    <div className="flex items-center justify-center min-h-[75vh] px-4">
      <div className="w-full max-w-md p-8 rounded-3xl glass-panel shadow-2xl transition-all duration-300">
        <h2 className="text-3xl font-extrabold tracking-tight text-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
          Create Account
        </h2>
        <p className="text-center text-sm text-muted-foreground mb-6">
          Start shopping smarter with ApnaKart AI aggregates
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-muted-foreground">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aarav Sharma"
                className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all pl-10"
              />
              <User className="absolute left-3.5 top-3.5 text-muted-foreground w-4 h-4" />
            </div>
          </div>

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
              Mobile (Optional)
            </label>
            <div className="relative">
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="9876543210"
                className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all pl-10"
              />
              <Phone className="absolute left-3.5 top-3.5 text-muted-foreground w-4 h-4" />
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
                placeholder="Min 6 characters"
                className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all pl-10"
              />
              <Key className="absolute left-3.5 top-3.5 text-muted-foreground w-4 h-4" />
            </div>
          </div>

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full py-3 rounded-2xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            {registerMutation.isPending ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Already have an account?{' '}
          <a href="/login" className="text-primary font-semibold hover:underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
};
export default RegisterPage;
