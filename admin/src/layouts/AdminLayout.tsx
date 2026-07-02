import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Cable,
  ArrowLeft,
  Users,
  ShoppingBag,
  Send,
  Activity,
  ShieldCheck,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <span className="text-xl font-bold tracking-tight text-primary">ApnaKart Console</span>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-lg hover:bg-muted transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
            Dashboard
          </Link>
          <Link
            to="/adapters"
            className="flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-lg hover:bg-muted transition-colors"
          >
            <Cable className="w-4 h-4 text-muted-foreground" />
            Marketplace Adapters
          </Link>
          <Link
            to="/users"
            className="flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-lg hover:bg-muted transition-colors"
          >
            <Users className="w-4 h-4 text-muted-foreground" />
            Accounts & RBAC
          </Link>
          <Link
            to="/orders"
            className="flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-lg hover:bg-muted transition-colors"
          >
            <ShoppingBag className="w-4 h-4 text-muted-foreground" />
            Order Registry
          </Link>
          <Link
            to="/campaigns"
            className="flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-lg hover:bg-muted transition-colors"
          >
            <Send className="w-4 h-4 text-muted-foreground" />
            Campaigns Center
          </Link>
          <Link
            to="/metrics"
            className="flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-lg hover:bg-muted transition-colors"
          >
            <Activity className="w-4 h-4 text-muted-foreground" />
            System Metrics
          </Link>
          <Link
            to="/logs"
            className="flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-lg hover:bg-muted transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-muted-foreground" />
            Audit Logs
          </Link>
        </nav>
        <div className="p-4 border-t">
          <a
            href={(import.meta as any).env.VITE_FRONTEND_URL || 'http://localhost:5173'}
            className="flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Exit to Store
          </a>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b bg-card flex items-center px-8 justify-between">
          <span className="text-sm font-semibold text-muted-foreground">Admin Workspace</span>
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-sm text-primary">
            AD
          </div>
        </header>
        <main className="flex-grow p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default AdminLayout;
