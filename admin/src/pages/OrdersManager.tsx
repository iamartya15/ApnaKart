import React, { useState, useEffect } from 'react';
import { ShoppingBag, Loader2, Download, RefreshCw } from 'lucide-react';

export const OrdersManager: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      // Requesting orders history list using customer endpoint (reusing core structures)
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/api/orders/history`, {
        headers: {
          Authorization: `Bearer ${token || ''}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to load orders history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleRefund = async (orderId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/api/orders/return/${orderId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token || ''}`,
        },
      });
      if (response.ok) {
        alert('Refund approved. Payment reversed.');
        fetchOrders();
      } else {
        alert('Refund permission denied.');
      }
    } catch (err) {
      alert('Network request error.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-semibold">Resolving order list...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Order Management</h2>
        <p className="text-muted-foreground">
          Monitor transaction status, track logistics, and approve refund claims.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-3xl">
          <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-bold">No Orders Placed</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-card border rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b">
                <div>
                  <p className="text-xs text-muted-foreground font-bold">
                    ORDER ID: {order._id.toUpperCase()}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Date: {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      order.paymentStatus === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-secondary uppercase">
                    {order.orderStatus}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-1.5 text-xs font-semibold text-muted-foreground">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between">
                    <span>
                      {item.title} (x{item.quantity}) -{' '}
                      <span className="uppercase text-[9px] bg-secondary px-1.5 py-0.5 rounded">
                        {item.marketplace}
                      </span>
                    </span>
                    <span className="text-foreground">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Invoicing actions */}
              <div className="flex justify-between items-center pt-3 border-t">
                <span className="text-sm font-extrabold">Payable: ₹{order.total}</span>

                <div className="flex gap-2">
                  <a
                    href={`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/api/orders/invoice/${order._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-xl hover:bg-indigo-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Invoice HTML
                  </a>

                  {order.paymentStatus === 'paid' && order.orderStatus !== 'returned' && (
                    <button
                      onClick={() => handleRefund(order._id)}
                      className="flex items-center gap-1 text-xs font-semibold text-red-600 border border-red-200 px-3 py-1.5 rounded-xl hover:bg-red-50"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Approve Refund
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default OrdersManager;
