import { useState, useEffect, useCallback } from 'react';
import { type MqttClient } from 'mqtt';
import { allDisplaysTopic, parseDisplayIdFromPresence } from '../lib/mqttTopics';
import { type ConnectionStatus } from './useMqttClient';

export interface DiscoveredDisplay {
  id: string;
  name: string;
  online: boolean;
}

export function useDisplayDiscovery(client: MqttClient | null, status: ConnectionStatus) {
  const [displays, setDisplays] = useState<Record<string, DiscoveredDisplay>>({});

  const handleMessage = useCallback((topic: string, payload: string) => {
    const displayId = parseDisplayIdFromPresence(topic);
    if (!displayId) return;
    try {
      const data = JSON.parse(payload) as { name: string; online: boolean };
      setDisplays((prev) => ({
        ...prev,
        [displayId]: { id: displayId, name: data.name, online: data.online },
      }));
    } catch {
      // ignore malformed
    }
  }, []);

  useEffect(() => {
    if (!client || status !== 'connected') return;

    client.subscribe(allDisplaysTopic(), { qos: 1 });

    const listener = (topic: Buffer | string, payload: Buffer) => {
      handleMessage(topic.toString(), payload.toString());
    };

    client.on('message', listener);
    return () => {
      client.off('message', listener);
      client.unsubscribe(allDisplaysTopic());
    };
  }, [client, status, handleMessage]);

  return Object.values(displays);
}
