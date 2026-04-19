import React, { useState, useEffect, useCallback } from 'react';
import { DisplaySetup, type DisplayConfig } from './DisplaySetup';
import { useMqttClient } from '../hooks/useMqttClient';
import {
  presenceTopic,
  allStateTopics,
  applyMessage,
  DEFAULT_SCOREBOARD_STATE,
  type ScoreboardState,
} from '../lib/mqttTopics';

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const Display: React.FC = () => {
  const [config, setConfig] = useState<DisplayConfig | null>(null);
  const [scoreboardState, setScoreboardState] = useState<ScoreboardState>(DEFAULT_SCOREBOARD_STATE);

  const presence = config
    ? JSON.stringify({ name: config.displayName, online: false })
    : undefined;

  const { client, status, publish, subscribe } = useMqttClient({
    brokerUrl: config?.brokerUrl ?? null,
    willTopic: config ? presenceTopic(config.displayId) : undefined,
    willPayload: presence,
  });

  // Announce presence and subscribe to state topics once connected
  useEffect(() => {
    if (!client || status !== 'connected' || !config) return;

    publish(
      presenceTopic(config.displayId),
      JSON.stringify({ name: config.displayName, online: true }),
      true,
    );
    subscribe(allStateTopics(config.displayId));
  }, [client, status, config, publish, subscribe]);

  // Handle incoming MQTT messages
  const handleMessage = useCallback(
    (topic: string, payload: string) => {
      if (!config) return;
      setScoreboardState((prev) => applyMessage(prev, topic, payload, config.displayId));
    },
    [config],
  );

  useEffect(() => {
    if (!client) return;
    const listener = (topic: Buffer | string, payload: Buffer) => {
      handleMessage(topic.toString(), payload.toString());
    };
    client.on('message', listener);
    return () => { client.off('message', listener); };
  }, [client, handleMessage]);

  // Mark offline before unload
  useEffect(() => {
    if (!config || status !== 'connected') return;
    const onUnload = () => {
      publish(
        presenceTopic(config.displayId),
        JSON.stringify({ name: config.displayName, online: false }),
        true,
      );
    };
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, [config, status, publish]);

  if (!config) {
    return <DisplaySetup onSetup={setConfig} />;
  }

  const { competitor1, competitor2, timer } = scoreboardState;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center p-8">
      {/* Connection status */}
      <div className="absolute top-4 right-4 flex items-center gap-2 text-sm">
        <span
          className={`inline-block w-2.5 h-2.5 rounded-full ${
            status === 'connected'
              ? 'bg-green-400'
              : status === 'connecting'
              ? 'bg-yellow-400 animate-pulse'
              : 'bg-red-500'
          }`}
        />
        <span className="text-gray-400">{config.displayName}</span>
      </div>

      {/* Timer */}
      <div className="mb-10 text-center">
        <div
          className="text-9xl font-bold tracking-wider font-mono text-white"
        >
          {formatTime(timer.seconds)}
        </div>
      </div>

      {/* Scoreboard — one row per competitor */}
      <div className="w-full max-w-7xl flex flex-col gap-6">
        {/* Column headers */}
        <div className="grid gap-4 px-2" style={{gridTemplateColumns: '2fr 2rem 1fr 1fr 1fr'}}>
          <div className="text-gray-500 text-2xl uppercase tracking-widest font-semibold">Competitor</div>
          <div />
          <div className="text-gray-500 text-2xl uppercase tracking-widest font-semibold text-center">Points</div>
          <div className="text-gray-500 text-2xl uppercase tracking-widest font-semibold text-center">Advantages</div>
          <div className="text-gray-500 text-2xl uppercase tracking-widest font-semibold text-center">Penalties</div>
        </div>

        {/* Competitor 1 row */}
        <div className="grid gap-4" style={{gridTemplateColumns: '2fr 2rem 1fr 1fr 1fr'}}>
          <div className="bg-blue-600 rounded-2xl p-6 flex items-center shadow-xl">
            <span className="text-5xl font-bold text-white truncate">{competitor1.name}</span>
          </div>
          <div />
          <div className="bg-green-500 rounded-2xl p-6 flex flex-col items-center justify-center shadow-xl">
            <span className="text-9xl font-bold text-white leading-none">{competitor1.score}</span>
          </div>
          <div className="bg-yellow-400 rounded-2xl p-6 flex flex-col items-center justify-center shadow-xl">
            <span className="text-9xl font-bold text-white leading-none">{competitor1.advantages}</span>
          </div>
          <div className="bg-red-500 rounded-2xl p-6 flex flex-col items-center justify-center shadow-xl">
            <span className="text-9xl font-bold text-white leading-none">{competitor1.penalties}</span>
          </div>
        </div>

        {/* Competitor 2 row */}
        <div className="grid gap-4" style={{gridTemplateColumns: '2fr 2rem 1fr 1fr 1fr'}}>
          <div className="bg-white rounded-2xl p-6 flex items-center shadow-xl">
            <span className="text-5xl font-bold text-black truncate">{competitor2.name}</span>
          </div>
          <div />
          <div className="bg-green-500 rounded-2xl p-6 flex flex-col items-center justify-center shadow-xl">
            <span className="text-9xl font-bold text-white leading-none">{competitor2.score}</span>
          </div>
          <div className="bg-yellow-400 rounded-2xl p-6 flex flex-col items-center justify-center shadow-xl">
            <span className="text-9xl font-bold text-white leading-none">{competitor2.advantages}</span>
          </div>
          <div className="bg-red-500 rounded-2xl p-6 flex flex-col items-center justify-center shadow-xl">
            <span className="text-9xl font-bold text-white leading-none">{competitor2.penalties}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
