import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useCartQuery,
  useCheckoutMutation,
  usePlaceOrderMutation,
} from '../hooks/useShoppingQueries';
import { ArrowLeft, Ticket, Calendar, ShieldCheck, Loader2 } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();

  // Generate unique idempotency key once per checkout session mount
  const [idempotencyKey] = useState(
    () => `idemp-${Math.floor(100000 + Math.random() * 900000)}-${Date.now()}`,
  );

  const guestId = sessionStorage.getItem('guestId') || '';
  const { data: cartData } = useCartQuery(guestId);
  const checkoutMutation = useCheckoutMutation();
  const placeOrderMutation = usePlaceOrderMutation();

  const cartItems = cartData?.items || [];

  // Address Form State
  const [fullName, setFullName] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');

  // Preferences
  const [deliverySlot, setDeliverySlot] = useState('Standard (10 AM - 5 PM)');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');

  // Prices computed values
  const [prices, setPrices] = useState<any>(null);

  // Compute pricing totals on slot or coupon additions
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    checkoutMutation.mutate(
      {
        items: cartItems,
        deliverySlot,
        couponCode: couponCode.trim(),
        idempotencyKey,
      },
      {
        onSuccess: (data) => {
          if (data.success) {
            setPrices(data);
            setAppliedCoupon(couponCode.trim());
          }
        },
      },
    );
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !addressLine1 || !city || !state || !postalCode || !phone) {
      alert('Please fill out all address details.');
      return;
    }

    // Call computation if not already done
    let checkoutPrices = prices;
    if (!checkoutPrices) {
      try {
        const response = await checkoutMutation.mutateAsync({
          items: cartItems,
          deliverySlot,
          couponCode: appliedCoupon,
          idempotencyKey,
        });
        checkoutPrices = response;
      } catch (err) {
        alert('Pricing computation failed.');
        return;
      }
    }

    const address = {
      fullName,
      addressLine1,
      city,
      state,
      postalCode,
      country: 'India',
      phone,
    };

    placeOrderMutation.mutate(
      {
        idempotencyKey,
        shippingAddress: address,
        billingAddress: address,
        paymentMethod: 'card', // default method placeholder
        paymentProvider: 'stripe', // default provider placeholder
      },
      {
        onSuccess: (data) => {
          if (data.success) {
            // Redirect to Payment selection page passing order ID
            navigate('/payments', {
              state: { orderId: data.order._id, total: checkoutPrices.total },
            });
          }
        },
      },
    );
  };

  const subtotal = cartItems.reduce(
    (acc: number, item: any) => acc + item.price * item.quantity,
    0,
  );
  const taxEstimate = Math.round(subtotal * 0.18);
  const rawTotal = subtotal + taxEstimate;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm font-semibold hover:text-primary transition mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Checkout</h2>
        <p className="text-muted-foreground font-semibold">
          Provide delivery details and apply discount coupons.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3 items-start">
        {/* Address Inputs & slot Forms */}
        <form
          onSubmit={handlePlaceOrder}
          className="md:col-span-2 space-y-6 bg-card border rounded-3xl p-6 md:p-8 shadow-sm"
        >
          <h3 className="font-extrabold text-lg pb-2 border-b">Shipping Information</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full px-4 py-2.5 rounded-xl bg-secondary/30 border text-sm outline-none focus:ring-2 focus:ring-primary font-semibold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground">Phone Number</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 9999999999"
                className="w-full px-4 py-2.5 rounded-xl bg-secondary/30 border text-sm outline-none focus:ring-2 focus:ring-primary font-semibold"
              />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-muted-foreground">Address Line 1</label>
              <input
                type="text"
                required
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder="e.g. Flat/House No, Building name, Street"
                className="w-full px-4 py-2.5 rounded-xl bg-secondary/30 border text-sm outline-none focus:ring-2 focus:ring-primary font-semibold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground">City</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. New Delhi"
                className="w-full px-4 py-2.5 rounded-xl bg-secondary/30 border text-sm outline-none focus:ring-2 focus:ring-primary font-semibold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground">State</label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Delhi"
                className="w-full px-4 py-2.5 rounded-xl bg-secondary/30 border text-sm outline-none focus:ring-2 focus:ring-primary font-semibold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground">Postal Code (PIN)</label>
              <input
                type="text"
                required
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="e.g. 110001"
                className="w-full px-4 py-2.5 rounded-xl bg-secondary/30 border text-sm outline-none focus:ring-2 focus:ring-primary font-semibold"
              />
            </div>
          </div>

          <div className="pt-4 border-t space-y-4">
            <h3 className="font-extrabold text-lg flex items-center gap-1.5">
              <Calendar className="w-5 h-5 text-indigo-500" />
              Delivery Preference
            </h3>
            <select
              value={deliverySlot}
              onChange={(e) => setDeliverySlot(e.target.value)}
              className="w-full px-3 py-2.5 bg-secondary/50 border rounded-xl text-sm outline-none font-semibold"
            >
              <option value="Morning (7 AM - 9 AM)">Morning Slot (7 AM - 9 AM)</option>
              <option value="Standard (10 AM - 5 PM)">Standard delivery (10 AM - 5 PM)</option>
              <option value="Evening (6 PM - 9 PM)">Evening Slot (6 PM - 9 PM)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={placeOrderMutation.isPending}
            className="w-full py-3.5 bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-700 transition flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/10 text-sm"
          >
            {placeOrderMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Confirm Order Details'
            )}
          </button>
        </form>

        {/* Pricing calculations summaries & Coupons apply widget */}
        <div className="space-y-6">
          {/* Coupon Entry widget */}
          <div className="bg-card border rounded-3xl p-6 shadow-sm">
            <h4 className="font-bold text-sm mb-3 flex items-center gap-1.5">
              <Ticket className="w-4 h-4 text-indigo-500" />
              Apply Discount Coupon
            </h4>
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="e.g. KART500"
                className="flex-grow px-3 py-2 border rounded-xl text-xs font-semibold bg-secondary/40 outline-none uppercase"
              />
              <button
                type="submit"
                disabled={checkoutMutation.isPending}
                className="px-4 py-2 bg-secondary text-foreground hover:bg-muted border rounded-xl text-xs font-bold transition"
              >
                Apply
              </button>
            </form>
            {appliedCoupon && (
              <p className="text-xs text-green-600 dark:text-green-400 font-bold mt-2">
                ✓ Coupon code **{appliedCoupon}** applied successfully.
              </p>
            )}
          </div>

          {/* Pricing breakdowns */}
          <div className="bg-card border rounded-3xl p-6 shadow-sm space-y-4">
            <h4 className="font-extrabold text-sm pb-3 border-b">Checkout Summary</h4>
            <div className="space-y-2 text-xs font-semibold text-muted-foreground">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="text-foreground">₹{prices ? prices.subtotal : subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>GST Tax:</span>
                <span className="text-foreground">₹{prices ? prices.tax : taxEstimate}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee:</span>
                <span className="text-foreground">₹{prices ? prices.shippingCharges : 0}</span>
              </div>
              {prices && prices.discount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Discount:</span>
                  <span>-₹{prices.discount}</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t text-sm font-extrabold text-foreground">
                <span>Payable Total:</span>
                <span>₹{prices ? prices.total : rawTotal}</span>
              </div>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 rounded-xl flex gap-1.5 mt-2">
              <ShieldCheck className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              <p className="text-[10px] text-indigo-800 dark:text-indigo-300 font-semibold leading-relaxed">
                Security guarantee: Idempotency protections active. Duplicate payments are
                automatically blocked.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CheckoutPage;
