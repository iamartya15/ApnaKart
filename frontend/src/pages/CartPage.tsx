import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartQuery, useUpdateQtyMutation } from '../hooks/useShoppingQueries';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Heart, Loader2 } from 'lucide-react';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();

  // Get guest identifier from session storage
  const guestId = (() => {
    const saved = sessionStorage.getItem('guestId');
    if (saved) return saved;
    const newId = `guest-${Math.floor(100000 + Math.random() * 900000)}`;
    sessionStorage.setItem('guestId', newId);
    return newId;
  })();

  const { data: cartData, isLoading } = useCartQuery(guestId);
  const updateQtyMutation = useUpdateQtyMutation();

  const items = cartData?.items || [];
  const savedItems = cartData?.savedForLater || [];

  const handleUpdateQty = (productId: string, currentQty: number, change: number) => {
    updateQtyMutation.mutate({
      guestId,
      productId,
      quantity: currentQty + change,
    });
  };

  const handleRemoveItem = (productId: string) => {
    updateQtyMutation.mutate({
      guestId,
      productId,
      quantity: 0,
    });
  };

  // Subtotal pricing
  const subtotal = items.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-semibold">Resolving shopping cart items...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Shopping Cart</h2>
        <p className="text-muted-foreground font-semibold">
          Verify selections and checkout across aggregated marketplaces.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-3xl border-border">
          <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-bold">Your Cart is Empty</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-6 font-semibold">
            Explore products across Indian platforms and add them here.
          </p>
          <button
            onClick={() => navigate('/search')}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition"
          >
            Explore Search Engine
          </button>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-3 items-start">
          {/* Items lists */}
          <div className="md:col-span-2 space-y-4">
            {items.map((item: any) => (
              <div
                key={item.productId}
                className="bg-card border rounded-3xl p-5 flex gap-4 items-center justify-between hover:shadow-md transition border-border/80"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-20 h-20 rounded-2xl object-cover border"
                />

                <div className="flex-grow min-w-0">
                  <span className="text-[10px] font-extrabold bg-secondary px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {item.marketplace}
                  </span>
                  <h4 className="font-bold text-sm tracking-tight text-foreground truncate mt-1.5">
                    {item.title}
                  </h4>
                  <p className="text-xs text-muted-foreground font-bold mt-0.5">
                    ₹{item.price} each
                  </p>
                </div>

                {/* Adjust buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateQty(item.productId, item.quantity, -1)}
                    className="p-1.5 border rounded-xl hover:bg-muted transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => handleUpdateQty(item.productId, item.quantity, 1)}
                    className="p-1.5 border rounded-xl hover:bg-muted transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => handleRemoveItem(item.productId)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Pricing calculations summaries */}
          <div className="bg-card border rounded-3xl p-6 space-y-6">
            <h3 className="font-extrabold text-lg pb-4 border-b">Order Summary</h3>

            <div className="space-y-3 text-sm font-semibold text-muted-foreground">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="text-foreground">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated GST (18%):</span>
                <span className="text-foreground">₹{tax}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Charges:</span>
                <span className="text-foreground">FREE</span>
              </div>
              <div className="flex justify-between pt-4 border-t text-base font-extrabold text-foreground">
                <span>Order Total:</span>
                <span>₹{total}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-700 transition flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/10 text-sm"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Save for later block */}
      {savedItems.length > 0 && (
        <div className="space-y-4 pt-8 border-t">
          <h3 className="text-xl font-extrabold flex items-center gap-1.5">
            <Heart className="w-5 h-5 text-red-500 fill-current" />
            Saved for Later
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {savedItems.map((item: any) => (
              <div key={item.productId} className="bg-card border rounded-2xl p-4 flex gap-3">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-16 h-16 rounded-xl object-cover border"
                />
                <div>
                  <h4 className="font-bold text-xs line-clamp-2">{item.title}</h4>
                  <p className="text-xs text-primary font-bold mt-1">₹{item.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default CartPage;
