import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useResetPasswordMutation } from '../hooks/useAuthQueries';
import { Key, ShieldAlert, CheckCircle } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const resetPasswordMutation = useResetPasswordMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    if (!token) {
      setErrorMsg('Invalid or missing password reset token.');
      return;
    }

    resetPasswordMutation.mutate(
      { token, password },
      {
        onSuccess: (data) => {
          setSuccessMsg(data.message || 'Password reset successfully! Redirecting...');
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        },
        onError: (err: any) => {
          setErrorMsg(err.response?.data?.message || 'Failed to reset password.');
        },
      },
    );
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-md p-8 rounded-3xl glass-panel shadow-2xl transition-all duration-300">
        <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
          New Password
        </h2>
        <p className="text-center text-sm text-muted-foreground mb-6">
          Enter your new account password details.
        </p>

        {errorMsg && (
          <div className="flex items-center gap-2 p-4 mb-4 text-sm text-red-800 rounded-2xl bg-red-50 dark:bg-red-950/30 dark:text-red-300 border border-red-200">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 p-4 mb-4 text-sm text-green-800 rounded-2xl bg-green-50 dark:bg-green-950/30 dark:text-green-300 border border-green-200">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-muted-foreground">
              New Password
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

          <div>
            <label className="block text-sm font-semibold mb-1.5 text-muted-foreground">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all pl-10"
              />
              <Key className="absolute left-3.5 top-3.5 text-muted-foreground w-4 h-4" />
            </div>
          </div>

          <button
            type="submit"
            disabled={resetPasswordMutation.isPending}
            className="w-full py-3 rounded-2xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors shadow-lg disabled:opacity-50"
          >
            {resetPasswordMutation.isPending ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};
export default ResetPasswordPage;
