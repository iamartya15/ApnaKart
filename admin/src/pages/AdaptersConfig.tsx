import React, { useState } from 'react';

interface Adapter {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive';
}

export const AdaptersConfig: React.FC = () => {
  const [adapters, setAdapters] = useState<Adapter[]>([
    { id: '1', name: 'Amazon India Adapter', type: 'Scraper / Dynamic Sim', status: 'active' },
    { id: '2', name: 'Flipkart Adapter', type: 'Scraper / Dynamic Sim', status: 'active' },
    { id: '3', name: 'Meesho Adapter', type: 'Affiliate API / Sim', status: 'active' },
    { id: '4', name: 'Myntra Adapter', type: 'Scraper Sim', status: 'inactive' },
    { id: '5', name: 'Ajio Adapter', type: 'Scraper Sim', status: 'active' },
  ]);

  const toggleStatus = (id: string) => {
    setAdapters((prev) =>
      prev.map((adapter) =>
        adapter.id === id
          ? { ...adapter, status: adapter.status === 'active' ? 'inactive' : 'active' }
          : adapter,
      ),
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Marketplace Adapters</h1>
      <p className="text-muted-foreground">
        Enable or disable scrapers and official marketplace APIs in real-time.
      </p>

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                Adapter Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {adapters.map((adapter) => (
              <tr key={adapter.id} className="hover:bg-muted/10 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                  {adapter.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {adapter.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      adapter.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                    }`}
                  >
                    {adapter.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => toggleStatus(adapter.id)}
                    className="text-sm text-primary hover:underline font-semibold"
                  >
                    Toggle {adapter.status === 'active' ? 'Disable' : 'Enable'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default AdaptersConfig;
