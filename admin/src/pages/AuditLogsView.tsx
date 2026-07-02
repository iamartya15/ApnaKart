import React, { useState, useEffect } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/api/admin/audit-logs`, {
        headers: {
          Authorization: `Bearer ${token || ''}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to load audit registry logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-semibold">Resolving audit records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Audit Logs</h2>
        <p className="text-muted-foreground">
          Trace administrative configurations, permission changes, and bans timeline.
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed rounded-2xl">
          <p className="text-sm text-muted-foreground font-semibold">No audit logs recorded yet.</p>
        </div>
      ) : (
        <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b font-extrabold text-sm flex items-center gap-1.5 bg-muted/20">
            <ShieldCheck className="w-5 h-5 text-indigo-500" />
            Admin Action History Log
          </div>

          <div className="divide-y text-xs font-semibold">
            {logs.map((log) => (
              <div key={log._id} className="p-4 space-y-2 hover:bg-muted/10 transition-colors">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span className="font-bold text-foreground">{log.adminEmail}</span>
                  <span className="text-[10px]">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm font-bold text-indigo-600">{log.action}</p>
                <div className="grid gap-4 sm:grid-cols-2 bg-secondary/20 p-2.5 rounded-lg text-[10px] text-muted-foreground leading-relaxed">
                  <div>
                    <span className="font-extrabold uppercase block mb-0.5">IP Address</span>
                    {log.ipAddress || 'unknown'}
                  </div>
                  <div>
                    <span className="font-extrabold uppercase block mb-0.5">User Agent</span>
                    {log.userAgent || 'unknown'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default AuditLogsView;
