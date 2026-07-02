import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  ShoppingBag,
  Sparkles,
  Loader2,
  ArrowRight,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/api/admin/stats`, {
        headers: {
          Authorization: `Bearer ${token || ''}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-semibold">
          Compiling business statistics metrics...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Enterprise Seller Central</h1>
        <p className="text-muted-foreground font-semibold">
          Real-time consolidated analytics across aggregated platforms.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Revenue */}
        <div className="p-6 bg-card border rounded-3xl shadow-sm flex items-center justify-between hover:shadow-md transition">
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Total Sales Revenue
            </h3>
            <p className="text-3xl font-black mt-2 text-foreground">₹{stats?.totalRevenue || 0}</p>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-950/20 text-green-600 rounded-2xl">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        {/* Orders */}
        <div className="p-6 bg-card border rounded-3xl shadow-sm flex items-center justify-between hover:shadow-md transition">
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Total Orders Placed
            </h3>
            <p className="text-3xl font-black mt-2 text-foreground">{stats?.totalOrders || 0}</p>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 rounded-2xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Users */}
        <div className="p-6 bg-card border rounded-3xl shadow-sm flex items-center justify-between hover:shadow-md transition">
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Registered Accounts
            </h3>
            <p className="text-3xl font-black mt-2 text-foreground">{stats?.totalUsers || 0}</p>
          </div>
          <div className="p-3 bg-pink-50 dark:bg-pink-950/20 text-pink-600 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="p-6 bg-card border rounded-3xl shadow-sm flex items-center justify-between hover:shadow-md transition">
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Conversion Ratio
            </h3>
            <p className="text-3xl font-black mt-2 text-foreground">
              {stats?.conversionRate || 0}%
            </p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-600 rounded-2xl">
            <LayoutDashboard className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* AI stats and affiliate tracking */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-card border rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-extrabold flex items-center gap-1.5 border-b pb-3">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            AI Assistant Diagnostics
          </h3>
          <div className="space-y-2 text-sm font-semibold text-muted-foreground">
            <div className="flex justify-between">
              <span>Token Usage Count:</span>
              <span className="text-foreground">{stats?.tokenUsageCount} tokens</span>
            </div>
            <div className="flex justify-between">
              <span>Total Prompt Computations:</span>
              <span className="text-foreground">{stats?.aiRequestsCount} runs</span>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-extrabold flex items-center gap-1.5 border-b pb-3">
            <ArrowRight className="w-5 h-5 text-indigo-500" />
            Affiliate Revenue Logs
          </h3>
          <div className="space-y-2 text-sm font-semibold text-muted-foreground">
            <div className="flex justify-between">
              <span>Estimated Commissions:</span>
              <span className="text-green-600 font-bold">₹{stats?.affiliateEarningsAmount}</span>
            </div>
            <div className="flex justify-between">
              <span>Direct Click-throughs:</span>
              <span className="text-foreground">{stats?.marketplaceClicksCount} clicks</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
