import React, { useState } from 'react';
import { useForgotPasswordMutation } from '../hooks/useAuthQueries';
import { Mail, ShieldAlert, CheckCircle } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const forgotPasswordMutation = useForgotPasswordMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    forgotPasswordMutation.mutate(
      { email },
      {
        onSuccess: (data) => {
          setSuccessMsg(data.message || 'If an account matches, a reset link was dispatched.');
        },
        onError: (err: any) => {
          setErrorMsg(err.response?.data?.message || 'Failed to submit reset request.');
        },
      },
    );
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-md p-8 rounded-3xl glass-panel shadow-2xl transition-all duration-300">
        <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
          Reset Password
        </h2>
        <p className="text-center text-sm text-muted-foreground mb-6">
          Enter your email to receive password recovery details.
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
            disabled={forgotPasswordMutation.isPending}
            className="w-full py-3 rounded-2xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors shadow-lg disabled:opacity-50"
          >
            {forgotPasswordMutation.isPending ? 'Sending...' : 'Send Recovery Email'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Remembered credentials?{' '}
          <a href="/login" className="text-primary font-semibold hover:underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
};
export default ForgotPasswordPage;
