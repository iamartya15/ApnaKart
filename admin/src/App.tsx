import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AdminLayout } from './layouts/AdminLayout';
import { Dashboard } from './pages/Dashboard';
import { AdaptersConfig } from './pages/AdaptersConfig';
import { UsersConfig } from './pages/UsersConfig';
import { OrdersManager } from './pages/OrdersManager';
import { CampaignsConfig } from './pages/CampaignsConfig';
import { SystemMetrics } from './pages/SystemMetrics';
import { AuditLogsView } from './pages/AuditLogsView';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="adapters" element={<AdaptersConfig />} />
          <Route path="users" element={<UsersConfig />} />
          <Route path="orders" element={<OrdersManager />} />
          <Route path="campaigns" element={<CampaignsConfig />} />
          <Route path="metrics" element={<SystemMetrics />} />
          <Route path="logs" element={<AuditLogsView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
