import React, { useState, useEffect } from 'react';
import { Server, Activity, Database, Loader2 } from 'lucide-react';

export const SystemMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/api/admin/health`, {
        headers: {
          Authorization: `Bearer ${token || ''}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.health);
      }
    } catch (err) {
      console.error('Failed to resolve system diagnostic metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000); // refresh metrics every 5 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-semibold">Pulling process diagnostics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">System Metrics</h2>
        <p className="text-muted-foreground">
          Monitor memory partitions, database connections, and background job queue loads.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Memory allocation card */}
        <div className="bg-card border rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b">
            <h3 className="font-extrabold text-sm flex items-center gap-1.5">
              <Server className="w-4 h-4 text-indigo-500" />
              Runtime Resources
            </h3>
            <span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
              ACTIVE
            </span>
          </div>
          <div className="space-y-2 text-xs font-semibold text-muted-foreground">
            <div className="flex justify-between">
              <span>Node RSS Memory:</span>
              <span className="text-foreground">{metrics?.memoryUsageMB} MB</span>
            </div>
            <div className="flex justify-between">
              <span>Heap Allocation:</span>
              <span className="text-foreground">{metrics?.heapUsedMB} MB</span>
            </div>
            <div className="flex justify-between">
              <span>Uptime:</span>
              <span className="text-foreground">{Math.round(metrics?.uptime || 0)} seconds</span>
            </div>
          </div>
        </div>

        {/* Database state card */}
        <div className="bg-card border rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b">
            <h3 className="font-extrabold text-sm flex items-center gap-1.5">
              <Database className="w-4 h-4 text-indigo-500" />
              Database Connections
            </h3>
            <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
              CONNECTED
            </span>
          </div>
          <div className="space-y-2 text-xs font-semibold text-muted-foreground">
            <div className="flex justify-between">
              <span>MongoDB Atlas Status:</span>
              <span className="text-green-600 font-extrabold uppercase">{metrics?.mongodb}</span>
            </div>
            <div className="flex justify-between">
              <span>Redis Cluster Cache:</span>
              <span className="text-green-600 font-extrabold uppercase">{metrics?.redis}</span>
            </div>
            <div className="flex justify-between">
              <span>Active Sockets count:</span>
              <span className="text-foreground">{metrics?.socketConnectionsCount} channels</span>
            </div>
          </div>
        </div>

        {/* BullMQ worker card */}
        <div className="bg-card border rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b">
            <h3 className="font-extrabold text-sm flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-indigo-500" />
              Background Queues
            </h3>
            <span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
              RUNNING
            </span>
          </div>
          <div className="space-y-2 text-xs font-semibold text-muted-foreground">
            <div className="flex justify-between">
              <span>BullMQ status:</span>
              <span className="text-green-600 font-extrabold uppercase">
                {metrics?.bullMQStatus}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Queue workers:</span>
              <span className="text-foreground">2 active threads</span>
            </div>
            <div className="flex justify-between">
              <span>Background sync interval:</span>
              <span className="text-foreground">60 seconds</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SystemMetrics;
