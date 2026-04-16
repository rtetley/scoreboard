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
      <div className="mb-12">
        <div
          className={`text-9xl font-bold tracking-wider font-mono transition-colors ${
            timer.running ? 'text-white' : 'text-gray-400'
          }`}
        >
          {formatTime(timer.seconds)}
        </div>
      </div>

      {/* Scoreboard */}
      <div className="w-full max-w-7xl grid grid-cols-2 gap-8">
        {/* Competitor 1 */}
        <div className="bg-blue-600 rounded-3xl p-12 shadow-2xl">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-8 truncate">{competitor1.name}</h2>

            <div className="mb-8">
              <div className="text-8xl font-bold text-white mb-2">{competitor1.score}</div>
              <div className="text-2xl text-blue-200 uppercase tracking-wide">Points</div>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-8">
              <div className="bg-blue-700 rounded-xl p-6">
                <div className="text-5xl font-bold text-white mb-2">{competitor1.advantages}</div>
                <div className="text-lg text-blue-200 uppercase">Advantages</div>
              </div>
              <div className="bg-blue-700 rounded-xl p-6">
                <div className="text-5xl font-bold text-white mb-2">{competitor1.penalties}</div>
                <div className="text-lg text-blue-200 uppercase">Penalties</div>
              </div>
            </div>
          </div>
        </div>

        {/* Competitor 2 */}
        <div className="bg-red-600 rounded-3xl p-12 shadow-2xl">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-8 truncate">{competitor2.name}</h2>

            <div className="mb-8">
              <div className="text-8xl font-bold text-white mb-2">{competitor2.score}</div>
              <div className="text-2xl text-red-200 uppercase tracking-wide">Points</div>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-8">
              <div className="bg-red-700 rounded-xl p-6">
                <div className="text-5xl font-bold text-white mb-2">{competitor2.advantages}</div>
                <div className="text-lg text-red-200 uppercase">Advantages</div>
              </div>
              <div className="bg-red-700 rounded-xl p-6">
                <div className="text-5xl font-bold text-white mb-2">{competitor2.penalties}</div>
                <div className="text-lg text-red-200 uppercase">Penalties</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
