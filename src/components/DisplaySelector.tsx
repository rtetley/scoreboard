import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMqttClient } from '../hooks/useMqttClient';
import { useDisplayDiscovery } from '../hooks/useDisplayDiscovery';
import type { DiscoveredDisplay } from '../hooks/useDisplayDiscovery';

const DEFAULT_BROKER = 'wss://broker.emqx.io:8084/mqtt';

export const DisplaySelector: React.FC = () => {
  const navigate = useNavigate();
  const [brokerUrl, setBrokerUrl] = useState(DEFAULT_BROKER);
  const [activeBroker, setActiveBroker] = useState<string | null>(null);

  const { client, status } = useMqttClient({ brokerUrl: activeBroker });
  const displays = useDisplayDiscovery(client, status);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveBroker(brokerUrl);
  };

  const handleSelect = (display: DiscoveredDisplay) => {
    // Pass broker URL as a query param so the controller can reuse it
    navigate(`/controller/${display.id}?broker=${encodeURIComponent(activeBroker!)}&name=${encodeURIComponent(display.name)}`);
  };

  const onlineDisplays = displays.filter((d) => d.online);
  const offlineDisplays = displays.filter((d) => !d.online);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-lg">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">Select Display</h1>
        <p className="text-gray-500 text-center mb-8">
          Connect to your MQTT broker to discover available displays.
        </p>

        {/* Broker form */}
        <form onSubmit={handleConnect} className="flex gap-3 mb-8">
          <input
            type="text"
            value={brokerUrl}
            onChange={(e) => setBrokerUrl(e.target.value)}
            placeholder="wss://broker.example.com:8084/mqtt"
            className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 font-mono text-sm"
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-2 rounded-lg transition whitespace-nowrap"
          >
            {activeBroker ? 'Reconnect' : 'Connect'}
          </button>
        </form>

        {/* Status indicator */}
        {activeBroker && (
          <div className="flex items-center gap-2 mb-6 text-sm">
            <span
              className={`inline-block w-2.5 h-2.5 rounded-full ${
                status === 'connected'
                  ? 'bg-green-500'
                  : status === 'connecting'
                  ? 'bg-yellow-400 animate-pulse'
                  : status === 'error'
                  ? 'bg-red-500'
                  : 'bg-gray-400'
              }`}
            />
            <span className="text-gray-600 capitalize">{status}</span>
            {status === 'connected' && (
              <span className="text-gray-400">– listening for displays…</span>
            )}
          </div>
        )}

        {/* Display list */}
        {status === 'connected' && displays.length === 0 && (
          <p className="text-center text-gray-400 py-6">
            No displays found yet. Open a Display view on another device or browser window.
          </p>
        )}

        {onlineDisplays.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Online
            </h2>
            <ul className="space-y-2">
              {onlineDisplays.map((d) => (
                <li key={d.id}>
                  <button
                    onClick={() => handleSelect(d)}
                    className="w-full flex items-center justify-between bg-green-50 hover:bg-green-100 border-2 border-green-300 rounded-xl px-5 py-4 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
                      <span className="text-lg font-semibold text-gray-800">{d.name}</span>
                    </div>
                    <span className="text-green-700 font-medium text-sm">Select →</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {offlineDisplays.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Offline
            </h2>
            <ul className="space-y-2">
              {offlineDisplays.map((d) => (
                <li key={d.id}>
                  <div className="flex items-center gap-3 bg-gray-50 border-2 border-gray-200 rounded-xl px-5 py-4 opacity-60">
                    <span className="w-3 h-3 rounded-full bg-gray-400 inline-block" />
                    <span className="text-lg font-semibold text-gray-500">{d.name}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
