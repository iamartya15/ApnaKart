import React, { useState, useEffect } from 'react';
import { Send, Calendar, Loader2 } from 'lucide-react';

export const CampaignsConfig: React.FC = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState('');
  const [templateName, setTemplateName] = useState('PROMO_500');
  const [channels, setChannels] = useState<string[]>(['email']);
  const [scheduledAt, setScheduledAt] = useState('');
  const [varKey, setVarKey] = useState('discountCode');
  const [varVal, setVarVal] = useState('KART500');

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/api/admin/campaigns`, {
        headers: {
          Authorization: `Bearer ${token || ''}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (err) {
      console.error('Failed to load campaigns list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !scheduledAt) {
      alert('Please fill in title and scheduled date.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/api/admin/campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          title,
          templateName,
          channels,
          scheduledAt,
          variables: { [varKey]: varVal },
        }),
      });

      if (response.ok) {
        alert('Notification Campaign created successfully.');
        setTitle('');
        setScheduledAt('');
        fetchCampaigns();
      } else {
        alert('Action forbidden: Insufficient campaign permissions.');
      }
    } catch (err) {
      alert('Error scheduling campaign.');
    }
  };

  const handleToggleChannel = (channel: string) => {
    setChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel],
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-semibold">Resolving campaigns roster...</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-3">
      {/* Creator Form */}
      <form
        onSubmit={handleCreateCampaign}
        className="md:col-span-1 bg-card border rounded-3xl p-6 shadow-sm space-y-4"
      >
        <h3 className="text-lg font-extrabold pb-3 border-b">Create Campaign</h3>

        <div className="space-y-1">
          <label className="text-xs font-bold text-muted-foreground">Campaign Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Diwali Mega Sale Alert"
            className="w-full px-3 py-2 rounded-xl bg-secondary/30 border text-sm outline-none font-semibold"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-muted-foreground">Template Identifier</label>
          <select
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="w-full px-3 py-2 bg-secondary/30 border rounded-xl text-sm outline-none font-semibold"
          >
            <option value="PROMO_500">PROMO_500 (Flat ₹500 discount)</option>
            <option value="FESTIVE_10">FESTIVE_10 (10% percentage discount)</option>
            <option value="FLASH_25">FLASH_25 (25% flash discount)</option>
          </select>
        </div>

        {/* Channels */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground block">Select Channels</label>
          <div className="flex flex-wrap gap-2">
            {['email', 'sms', 'whatsapp', 'push'].map((ch) => (
              <button
                type="button"
                key={ch}
                onClick={() => handleToggleChannel(ch)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                  channels.includes(ch)
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-transparent'
                }`}
              >
                {ch.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-muted-foreground">Schedule Dispatch Date</label>
          <input
            type="datetime-local"
            required
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-secondary/30 border text-sm outline-none font-semibold"
          />
        </div>

        {/* Variables mapping */}
        <div className="grid gap-2 grid-cols-2">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground">Variable Key</label>
            <input
              type="text"
              value={varKey}
              onChange={(e) => setVarKey(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-secondary/30 border text-xs outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground">Value</label>
            <input
              type="text"
              value={varVal}
              onChange={(e) => setVarVal(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-secondary/30 border text-xs outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition flex items-center justify-center gap-1.5 text-sm"
        >
          <Send className="w-4 h-4" />
          Schedule Campaign
        </button>
      </form>

      {/* Campaigns Listing */}
      <div className="md:col-span-2 space-y-4">
        <h3 className="text-xl font-extrabold flex items-center gap-1.5">
          <Calendar className="w-5 h-5 text-indigo-500" />
          Scheduled Campaigns
        </h3>

        {campaigns.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed rounded-2xl">
            <p className="text-xs text-muted-foreground font-semibold">
              No notification campaigns scheduled.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((c) => (
              <div key={c._id} className="bg-card border rounded-2xl p-5 shadow-sm space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-extrabold text-sm">{c.title}</h4>
                  <span className="text-[10px] bg-secondary px-2.5 py-0.5 rounded-full font-bold uppercase">
                    {c.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-semibold">
                  Template ID: <span className="text-foreground">{c.templateName}</span>
                </p>
                <p className="text-xs text-muted-foreground font-semibold">
                  Target Channels:{' '}
                  <span className="text-foreground uppercase">{c.channels.join(', ')}</span>
                </p>
                <p className="text-[10px] text-muted-foreground font-bold">
                  Planned Date: {new Date(c.scheduledAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default CampaignsConfig;
