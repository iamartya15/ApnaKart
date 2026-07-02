import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCreatePaymentMutation } from '../hooks/useShoppingQueries';
import { ArrowLeft, CreditCard, Wallet, Truck, Loader2 } from 'lucide-react';

export const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract orderState from navigation state
  const { orderId, total } = location.state || {};

  const [provider, setProvider] = useState<'stripe' | 'razorpay' | 'cod'>('stripe');
  const createPaymentMutation = useCreatePaymentMutation();

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) {
      alert('Order reference missing. Return to checkout.');
      return;
    }

    createPaymentMutation.mutate(
      {
        orderId,
        provider,
      },
      {
        onSuccess: (data) => {
          if (data.success && data.paymentUrl) {
            // Redirect the user's browser to complete payment (Stripe/Razorpay simulated success route)
            window.location.href = data.paymentUrl;
          } else if (data.success && data.redirectUrl) {
            // COD redirects internally
            window.location.href = data.redirectUrl;
          }
        },
        onError: () => {
          alert('Failed to initiate transaction session.');
        },
      },
    );
  };

  if (!orderId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-red-500 font-semibold">Invalid order session parameters.</p>
        <button
          onClick={() => navigate('/search')}
          className="px-6 py-2 border rounded-full font-bold"
        >
          Return to search
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm font-semibold hover:text-primary transition mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight">Select Payment</h2>
        <p className="text-muted-foreground font-semibold">
          Total Payable Due:{' '}
          <span className="text-foreground font-extrabold text-lg">₹{total}</span>
        </p>
      </div>

      <form
        onSubmit={handleProcessPayment}
        className="bg-card border rounded-3xl p-6 shadow-xl space-y-6"
      >
        <div className="space-y-3">
          {/* Stripe Option */}
          <label
            className={`flex items-center gap-3 p-4 border rounded-2xl cursor-pointer hover:bg-secondary/20 transition ${provider === 'stripe' ? 'border-indigo-500 bg-indigo-50/10' : ''}`}
          >
            <input
              type="radio"
              checked={provider === 'stripe'}
              onChange={() => setProvider('stripe')}
              className="accent-indigo-600 w-4 h-4"
            />
            <CreditCard className="w-5 h-5 text-indigo-500" />
            <div className="text-sm font-semibold">
              <p>Stripe Payment</p>
              <span className="text-xs text-muted-foreground">Credit/Debit Cards, NetBanking</span>
            </div>
          </label>

          {/* Razorpay Option */}
          <label
            className={`flex items-center gap-3 p-4 border rounded-2xl cursor-pointer hover:bg-secondary/20 transition ${provider === 'razorpay' ? 'border-indigo-500 bg-indigo-50/10' : ''}`}
          >
            <input
              type="radio"
              checked={provider === 'razorpay'}
              onChange={() => setProvider('razorpay')}
              className="accent-indigo-600 w-4 h-4"
            />
            <Wallet className="w-5 h-5 text-indigo-500" />
            <div className="text-sm font-semibold">
              <p>Razorpay Payment</p>
              <span className="text-xs text-muted-foreground">UPI, Wallets, NetBanking</span>
            </div>
          </label>

          {/* COD Option */}
          <label
            className={`flex items-center gap-3 p-4 border rounded-2xl cursor-pointer hover:bg-secondary/20 transition ${provider === 'cod' ? 'border-indigo-500 bg-indigo-50/10' : ''}`}
          >
            <input
              type="radio"
              checked={provider === 'cod'}
              onChange={() => setProvider('cod')}
              className="accent-indigo-600 w-4 h-4"
            />
            <Truck className="w-5 h-5 text-indigo-500" />
            <div className="text-sm font-semibold">
              <p>Cash on Delivery</p>
              <span className="text-xs text-muted-foreground">Pay when package arrives</span>
            </div>
          </label>
        </div>

        <button
          type="submit"
          disabled={createPaymentMutation.isPending}
          className="w-full py-3.5 bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-700 transition flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/10 text-sm"
        >
          {createPaymentMutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            `Pay ₹${total}`
          )}
        </button>
      </form>
    </div>
  );
};
export default PaymentPage;
