import React, { useState } from 'react';

const DEFAULT_BROKER = 'wss://broker.emqx.io:8084/mqtt';

export interface DisplayConfig {
  displayId: string;
  displayName: string;
  brokerUrl: string;
}

interface DisplaySetupProps {
  onSetup: (config: DisplayConfig) => void;
}

export const DisplaySetup: React.FC<DisplaySetupProps> = ({ onSetup }) => {
  const [name, setName] = useState('');
  const [brokerUrl, setBrokerUrl] = useState(DEFAULT_BROKER);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const displayId = crypto.randomUUID();
    onSetup({ displayId, displayName: name.trim(), brokerUrl });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">Display Setup</h1>
        <p className="text-gray-500 text-center mb-8">
          Configure this display so controllers can find and connect to it.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="display-name">
              Display Name
            </label>
            <input
              id="display-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mat 1, Main Screen"
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="broker-url">
              MQTT Broker URL
            </label>
            <input
              id="broker-url"
              type="text"
              value={brokerUrl}
              onChange={(e) => setBrokerUrl(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 font-mono text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">
              WebSocket endpoint (ws:// or wss://). Default uses a public test broker.
            </p>
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg text-xl transition"
          >
            Start Display
          </button>
        </form>
      </div>
    </div>
  );
};
