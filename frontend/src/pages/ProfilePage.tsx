import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useProfileQuery,
  useUpdateProfileMutation,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useLogoutMutation,
} from '../hooks/useAuthQueries';
import {
  useOrdersHistoryQuery,
  useCancelOrderMutation,
  useReturnOrderMutation,
} from '../hooks/useShoppingQueries';
import {
  Plus,
  Trash2,
  Edit,
  Check,
  Wallet,
  MapPin,
  Loader2,
  LogOut,
  Download,
  Clock,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { data: user, isLoading, isError } = useProfileQuery();
  const updateProfileMutation = useUpdateProfileMutation();
  const addAddressMutation = useAddAddressMutation();
  const updateAddressMutation = useUpdateAddressMutation();
  const deleteAddressMutation = useDeleteAddressMutation();
  const logoutMutation = useLogoutMutation();

  // Orders queries
  const { data: orders = [] } = useOrdersHistoryQuery();
  const cancelOrderMutation = useCancelOrderMutation();
  const returnOrderMutation = useReturnOrderMutation();

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileMobile, setProfileMobile] = useState('');

  // Address Dialog / Edit State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addrLabel, setAddrLabel] = useState('Home');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrPostal, setAddrPostal] = useState('');
  const [addrDefault, setAddrDefault] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-semibold">Loading profile information...</p>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-red-500 font-semibold text-lg">
          Failed to retrieve profile. Session expired.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate('/login');
      },
    });
  };

  const handleStartEditProfile = () => {
    setProfileName(user.name);
    setProfileMobile(user.mobile || '');
    setIsEditingProfile(true);
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(
      { name: profileName, mobile: profileMobile },
      {
        onSuccess: () => setIsEditingProfile(false),
      },
    );
  };

  const handleStartAddAddress = () => {
    setEditingAddressId(null);
    setAddrLabel('Home');
    setAddrStreet('');
    setAddrCity('');
    setAddrState('');
    setAddrPostal('');
    setAddrDefault(false);
    setShowAddressForm(true);
  };

  const handleStartEditAddress = (addr: any) => {
    setEditingAddressId(addr._id);
    setAddrLabel(addr.label);
    setAddrStreet(addr.street);
    setAddrCity(addr.city);
    setAddrState(addr.state);
    setAddrPostal(addr.postalCode);
    setAddrDefault(addr.isDefault);
    setShowAddressForm(true);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const addressPayload = {
      label: addrLabel,
      street: addrStreet,
      city: addrCity,
      state: addrState,
      postalCode: addrPostal,
      isDefault: addrDefault,
    };

    if (editingAddressId) {
      updateAddressMutation.mutate(
        { addressId: editingAddressId, addressData: addressPayload },
        {
          onSuccess: () => setShowAddressForm(false),
        },
      );
    } else {
      addAddressMutation.mutate(addressPayload, {
        onSuccess: () => setShowAddressForm(false),
      });
    }
  };

  const handleDeleteAddress = (id: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      deleteAddressMutation.mutate(id);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header Profile Dashboard */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-6 rounded-3xl border border-border">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Account Hub</h2>
          <p className="text-muted-foreground">
            Manage profile, transactions, wallets, and addresses.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Profile Card & Wallet */}
        <div className="md:col-span-1 space-y-6">
          {/* General profile info */}
          <div className="bg-card border rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-4">Personal Details</h3>
            {!isEditingProfile ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground font-semibold block">
                    Full Name
                  </label>
                  <p className="text-sm font-semibold">{user.name}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-semibold block">
                    Email Address
                  </label>
                  <p className="text-sm font-semibold">{user.email}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-semibold block">
                    Mobile
                  </label>
                  <p className="text-sm font-semibold">{user.mobile || 'Not set'}</p>
                </div>
                <button
                  onClick={handleStartEditProfile}
                  className="w-full mt-2 py-2 rounded-2xl border text-sm font-semibold hover:bg-muted transition"
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground font-semibold block">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 rounded-xl border bg-secondary/50 text-sm focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-semibold block">
                    Mobile
                  </label>
                  <input
                    type="text"
                    value={profileMobile}
                    onChange={(e) => setProfileMobile(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 rounded-xl border bg-secondary/50 text-sm focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleSaveProfile}
                    className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="flex-1 py-2 rounded-xl border text-sm font-semibold hover:bg-muted transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Reward Wallet */}
          <div className="bg-card border rounded-3xl p-6 shadow-sm bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">ApnaWallet</h3>
              <Wallet className="w-5 h-5 text-indigo-500" />
            </div>
            <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-indigo-600">
              ₹{user.walletBalance || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Available referral cashback balance
            </p>
          </div>
        </div>

        {/* Addresses Management */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card border rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Saved Delivery Addresses</h3>
              <button
                onClick={handleStartAddAddress}
                className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 text-white px-3 py-1.5 rounded-full hover:bg-indigo-700 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add New Address
              </button>
            </div>

            {/* Address Form (Modal-like overlay block) */}
            {showAddressForm && (
              <form
                onSubmit={handleSaveAddress}
                className="mb-6 p-5 border rounded-2xl bg-muted/20 space-y-4"
              >
                <h4 className="text-sm font-bold">
                  {editingAddressId ? 'Edit Address' : 'New Shipping Address'}
                </h4>
                <div className="grid gap-3 grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">
                      Label
                    </label>
                    <input
                      type="text"
                      required
                      value={addrLabel}
                      onChange={(e) => setAddrLabel(e.target.value)}
                      placeholder="e.g. Home, Office"
                      className="w-full px-3 py-2 rounded-xl border bg-card text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">
                      Street
                    </label>
                    <input
                      type="text"
                      required
                      value={addrStreet}
                      onChange={(e) => setAddrStreet(e.target.value)}
                      placeholder="Flat/House no, Street name"
                      className="w-full px-3 py-2 rounded-xl border bg-card text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={addrCity}
                      onChange={(e) => setAddrCity(e.target.value)}
                      placeholder="City"
                      className="w-full px-3 py-2 rounded-xl border bg-card text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      required
                      value={addrState}
                      onChange={(e) => setAddrState(e.target.value)}
                      placeholder="State"
                      className="w-full px-3 py-2 rounded-xl border bg-card text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      required
                      value={addrPostal}
                      onChange={(e) => setAddrPostal(e.target.value)}
                      placeholder="6-digit ZIP code"
                      className="w-full px-3 py-2 rounded-xl border bg-card text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="addrDefaultCheck"
                      checked={addrDefault}
                      onChange={(e) => setAddrDefault(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-border rounded"
                    />
                    <label
                      htmlFor="addrDefaultCheck"
                      className="text-xs font-semibold text-muted-foreground"
                    >
                      Set as Default
                    </label>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
                  >
                    Save Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="px-4 py-2 rounded-xl border text-xs font-semibold hover:bg-muted"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Address List */}
            {user.addresses && user.addresses.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {user.addresses.map((addr: any) => (
                  <div
                    key={addr._id}
                    className="relative p-5 border rounded-2xl flex flex-col justify-between hover:border-primary/50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-secondary">
                          {addr.label}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" />
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium">{addr.street}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {addr.city}, {addr.state} - {addr.postalCode}
                      </p>
                    </div>
                    <div className="flex gap-3 mt-4 pt-3 border-t justify-end">
                      <button
                        onClick={() => handleStartEditAddress(addr)}
                        className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 font-semibold"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(addr._id)}
                        className="text-xs text-muted-foreground hover:text-red-500 flex items-center gap-1 font-semibold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed rounded-3xl border-border">
                <MapPin className="w-8 h-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground font-medium">
                  No saved addresses found.
                </p>
              </div>
            )}
          </div>

          {/* Orders History & Timeline Tracking */}
          <div className="bg-card border rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-1.5">
              <Clock className="w-5 h-5 text-indigo-500" />
              Order History & Shipment Tracking
            </h3>

            {orders.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed rounded-2xl">
                <p className="text-sm text-muted-foreground font-semibold">No orders placed yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order: any) => (
                  <div key={order._id} className="border rounded-2xl p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b">
                      <div>
                        <p className="text-xs text-muted-foreground font-bold">
                          ORDER ID: {order._id.substring(0, 12).toUpperCase()}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Placed on {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            order.paymentStatus === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-secondary uppercase">
                          {order.orderStatus}
                        </span>
                      </div>
                    </div>

                    {/* Order items */}
                    <div className="space-y-2">
                      {order.items.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex justify-between text-xs font-semibold text-muted-foreground"
                        >
                          <span>
                            {item.title} (x{item.quantity})
                          </span>
                          <span>₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Tracking Timeline */}
                    <div className="bg-secondary/20 p-4 rounded-xl space-y-2">
                      <p className="text-[10px] font-extrabold uppercase text-indigo-500 tracking-wider">
                        Shipment Tracking Timeline
                      </p>
                      <div className="space-y-1.5 text-xs">
                        <p>✓ Order Placed: Awaiting shipment</p>
                        {order.orderStatus === 'processing' && (
                          <p className="text-indigo-600 font-bold">
                            🕒 Reserved & Processing: Preparing package at warehouse
                          </p>
                        )}
                        {order.orderStatus === 'shipped' && (
                          <p className="text-blue-600 font-bold">
                            🚚 Shipped: In transit via logistics partner
                          </p>
                        )}
                        {order.orderStatus === 'delivered' && (
                          <p className="text-green-600 font-bold">
                            ✅ Delivered: Package handed over
                          </p>
                        )}
                        {order.orderStatus === 'cancelled' && (
                          <p className="text-red-500 font-bold">
                            ❌ Cancelled: Items released back to stock
                          </p>
                        )}
                      </div>
                    </div>

                    {/* CTA Actions */}
                    <div className="flex justify-between items-center pt-3 border-t">
                      <span className="text-sm font-extrabold">Total: ₹{order.total}</span>
                      <div className="flex gap-2">
                        <a
                          href={`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/api/orders/invoice/${order._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs font-semibold text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-xl hover:bg-indigo-50"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Invoice
                        </a>

                        {order.orderStatus !== 'cancelled' &&
                          order.orderStatus !== 'delivered' &&
                          order.orderStatus !== 'returned' && (
                            <button
                              onClick={() => {
                                if (confirm('Cancel this order?')) {
                                  cancelOrderMutation.mutate(order._id);
                                }
                              }}
                              className="text-xs font-semibold text-red-600 border border-red-200 px-3 py-1.5 rounded-xl hover:bg-red-50"
                            >
                              Cancel Order
                            </button>
                          )}

                        {order.orderStatus === 'delivered' && (
                          <button
                            onClick={() => {
                              if (confirm('Initiate return request?')) {
                                returnOrderMutation.mutate(order._id);
                              }
                            }}
                            className="text-xs font-semibold text-amber-600 border border-amber-200 px-3 py-1.5 rounded-xl hover:bg-amber-50"
                          >
                            Return Order
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfilePage;
