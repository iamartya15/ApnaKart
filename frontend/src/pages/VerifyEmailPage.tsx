import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { CheckCircle, ShieldAlert, Loader2 } from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setErrorMsg('Invalid or missing email verification token.');
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/auth/verify-email?token=${token}`);
        setSuccessMsg(response.data.message || 'Email verified successfully!');
      } catch (err: any) {
        setErrorMsg(
          err.response?.data?.message || 'Verification failed. The token may be expired.',
        );
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-md p-8 rounded-3xl glass-panel shadow-2xl text-center">
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="font-semibold text-muted-foreground">Verifying your email address...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {successMsg ? (
              <div className="flex flex-col items-center gap-3">
                <CheckCircle className="w-12 h-12 text-green-500" />
                <h3 className="text-2xl font-extrabold">Verified!</h3>
                <p className="text-sm text-muted-foreground">{successMsg}</p>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full mt-4 py-2 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition"
                >
                  Proceed to Login
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <ShieldAlert className="w-12 h-12 text-red-500" />
                <h3 className="text-2xl font-extrabold">Verification Failed</h3>
                <p className="text-sm text-muted-foreground">{errorMsg}</p>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full mt-4 py-2 border rounded-full font-semibold hover:bg-muted transition"
                >
                  Back to Login
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default VerifyEmailPage;
