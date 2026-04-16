import { useState, useEffect, useRef, useCallback } from 'react';
import mqtt, { type MqttClient } from 'mqtt';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export type MessageHandler = (topic: string, payload: string) => void;

interface UseMqttClientOptions {
  brokerUrl: string | null;
  willTopic?: string;
  willPayload?: string;
  onMessage?: MessageHandler;
}

export function useMqttClient({ brokerUrl, willTopic, willPayload, onMessage }: UseMqttClientOptions) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [client, setClient] = useState<MqttClient | null>(null);
  const onMessageRef = useRef<MessageHandler | undefined>(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!brokerUrl) return;

    setStatus('connecting');

    const mqttOptions: mqtt.IClientOptions = {
      clientId: `scoreboard_${Math.random().toString(16).slice(2, 10)}`,
      keepalive: 30,
      reconnectPeriod: 3000,
    };

    if (willTopic && willPayload !== undefined) {
      mqttOptions.will = {
        topic: willTopic,
        payload: willPayload,
        qos: 1,
        retain: true,
      };
    }

    const c = mqtt.connect(brokerUrl, mqttOptions);

    c.on('connect', () => setStatus('connected'));
    c.on('error', () => setStatus('error'));
    c.on('close', () => setStatus('disconnected'));
    c.on('message', (topic, payload) => {
      onMessageRef.current?.(topic, payload.toString());
    });

    setClient(c);

    return () => {
      c.end(true);
      setClient(null);
      setStatus('disconnected');
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brokerUrl, willTopic, willPayload]);

  const publish = useCallback((topic: string, payload: string, retain = false) => {
    client?.publish(topic, payload, { qos: 1, retain });
  }, [client]);

  const subscribe = useCallback((topic: string) => {
    client?.subscribe(topic, { qos: 1 });
  }, [client]);

  return { client, status, publish, subscribe };
}
