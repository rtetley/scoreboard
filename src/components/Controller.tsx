import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useMqttClient } from '../hooks/useMqttClient';
import {
  stateTopic,
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

export const Controller: React.FC = () => {
  const { displayId } = useParams<{ displayId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const brokerUrl = searchParams.get('broker') ?? '';
  const displayName = searchParams.get('name') ?? displayId ?? 'Display';

  const [scoreboardState, setScoreboardState] = useState<ScoreboardState>(DEFAULT_SCOREBOARD_STATE);
  const { client, status, publish, subscribe } = useMqttClient({
    brokerUrl: brokerUrl || null,
  });

  // Subscribe to state topics on connect to receive retained current state
  useEffect(() => {
    if (!client || status !== 'connected' || !displayId) return;
    subscribe(allStateTopics(displayId));
  }, [client, status, displayId, subscribe]);

  // Receive retained messages (bootstrap state on connect)
  const handleMessage = useCallback(
    (topic: string, payload: string) => {
      if (!displayId) return;
      setScoreboardState((prev) => applyMessage(prev, topic, payload, displayId));
    },
    [displayId],
  );

  useEffect(() => {
    if (!client) return;
    const listener = (topic: Buffer | string, payload: Buffer) => {
      handleMessage(topic.toString(), payload.toString());
    };
    client.on('message', listener);
    return () => { client.off('message', listener); };
  }, [client, handleMessage]);

  // Timer tick: publish seconds every second when running
  useEffect(() => {
    if (!scoreboardState.timer.running) return;
    const interval = window.setInterval(() => {
      setScoreboardState((prev) => {
        const newSeconds = Math.max(0, prev.timer.seconds - 1);
        const newRunning = newSeconds > 0;
        if (displayId) {
          publish(stateTopic(displayId, 'timer/seconds'), String(newSeconds), true);
          if (!newRunning) {
            publish(stateTopic(displayId, 'timer/running'), 'false', true);
          }
        }
        return { ...prev, timer: { seconds: newSeconds, running: newRunning } };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [scoreboardState.timer.running, displayId, publish]);

  // Helper to publish a state update
  const pub = useCallback(
    (path: string, value: string) => {
      if (displayId) publish(stateTopic(displayId, path), value, true);
    },
    [displayId, publish],
  );

  // ── Actions ──────────────────────────────────────────────────────────────
  const setCompetitor1Name = (name: string) => {
    setScoreboardState((p) => ({ ...p, competitor1: { ...p.competitor1, name } }));
    pub('competitor1/name', name);
  };
  const setCompetitor2Name = (name: string) => {
    setScoreboardState((p) => ({ ...p, competitor2: { ...p.competitor2, name } }));
    pub('competitor2/name', name);
  };

  const addScore1 = (pts: number) => {
    setScoreboardState((p) => {
      const v = p.competitor1.score + pts;
      pub('competitor1/score', String(v));
      return { ...p, competitor1: { ...p.competitor1, score: v } };
    });
  };
  const addScore2 = (pts: number) => {
    setScoreboardState((p) => {
      const v = p.competitor2.score + pts;
      pub('competitor2/score', String(v));
      return { ...p, competitor2: { ...p.competitor2, score: v } };
    });
  };
  const removeScore1 = (pts: number) => {
    setScoreboardState((p) => {
      const v = Math.max(0, p.competitor1.score - pts);
      pub('competitor1/score', String(v));
      return { ...p, competitor1: { ...p.competitor1, score: v } };
    });
  };
  const removeScore2 = (pts: number) => {
    setScoreboardState((p) => {
      const v = Math.max(0, p.competitor2.score - pts);
      pub('competitor2/score', String(v));
      return { ...p, competitor2: { ...p.competitor2, score: v } };
    });
  };

  const addAdvantage1 = () => setScoreboardState((p) => { const v = p.competitor1.advantages + 1; pub('competitor1/advantages', String(v)); return { ...p, competitor1: { ...p.competitor1, advantages: v } }; });
  const removeAdvantage1 = () => setScoreboardState((p) => { const v = Math.max(0, p.competitor1.advantages - 1); pub('competitor1/advantages', String(v)); return { ...p, competitor1: { ...p.competitor1, advantages: v } }; });
  const addAdvantage2 = () => setScoreboardState((p) => { const v = p.competitor2.advantages + 1; pub('competitor2/advantages', String(v)); return { ...p, competitor2: { ...p.competitor2, advantages: v } }; });
  const removeAdvantage2 = () => setScoreboardState((p) => { const v = Math.max(0, p.competitor2.advantages - 1); pub('competitor2/advantages', String(v)); return { ...p, competitor2: { ...p.competitor2, advantages: v } }; });

  const addPenalty1 = () => setScoreboardState((p) => { const v = p.competitor1.penalties + 1; pub('competitor1/penalties', String(v)); return { ...p, competitor1: { ...p.competitor1, penalties: v } }; });
  const removePenalty1 = () => setScoreboardState((p) => { const v = Math.max(0, p.competitor1.penalties - 1); pub('competitor1/penalties', String(v)); return { ...p, competitor1: { ...p.competitor1, penalties: v } }; });
  const addPenalty2 = () => setScoreboardState((p) => { const v = p.competitor2.penalties + 1; pub('competitor2/penalties', String(v)); return { ...p, competitor2: { ...p.competitor2, penalties: v } }; });
  const removePenalty2 = () => setScoreboardState((p) => { const v = Math.max(0, p.competitor2.penalties - 1); pub('competitor2/penalties', String(v)); return { ...p, competitor2: { ...p.competitor2, penalties: v } }; });

  const startTimer = () => {
    setScoreboardState((p) => ({ ...p, timer: { ...p.timer, running: true } }));
    pub('timer/running', 'true');
  };
  const pauseTimer = () => {
    setScoreboardState((p) => ({ ...p, timer: { ...p.timer, running: false } }));
    pub('timer/running', 'false');
  };
  const resetTimer = () => {
    setScoreboardState((p) => ({ ...p, timer: { seconds: 300, running: false } }));
    pub('timer/seconds', '300');
    pub('timer/running', 'false');
  };
  const resetScoreboard = () => {
    setScoreboardState(DEFAULT_SCOREBOARD_STATE);
    if (displayId) {
      pub('competitor1/name', DEFAULT_SCOREBOARD_STATE.competitor1.name);
      pub('competitor1/score', '0');
      pub('competitor1/advantages', '0');
      pub('competitor1/penalties', '0');
      pub('competitor2/name', DEFAULT_SCOREBOARD_STATE.competitor2.name);
      pub('competitor2/score', '0');
      pub('competitor2/advantages', '0');
      pub('competitor2/penalties', '0');
      pub('timer/seconds', '300');
      pub('timer/running', 'false');
    }
  };

  const { competitor1, competitor2, timer } = scoreboardState;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => navigate('/controller')}
              className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1 transition"
            >
              ← Displays
            </button>
            <div className="flex items-center gap-2 text-sm">
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${
                  status === 'connected'
                    ? 'bg-green-500'
                    : status === 'connecting'
                    ? 'bg-yellow-400 animate-pulse'
                    : 'bg-red-500'
                }`}
              />
              <span className="text-gray-500">{displayName}</span>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-4">
            BJJ Scoreboard Controller
          </h1>

          {/* Timer Controls */}
          <div className="flex flex-col items-center space-y-4">
            <div className="text-5xl md:text-6xl font-bold text-gray-800 font-mono">
              {formatTime(timer.seconds)}
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={startTimer}
                disabled={timer.running}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg transition"
              >
                Start
              </button>
              <button
                onClick={pauseTimer}
                disabled={!timer.running}
                className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg transition"
              >
                Pause
              </button>
              <button
                onClick={resetTimer}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition"
              >
                Reset Timer
              </button>
              <button
                onClick={resetScoreboard}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>

        {/* Competitors Control Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Competitor 1 Controls */}
          <div className="bg-blue-50 rounded-lg shadow-md p-6">
            <div className="mb-4">
              <input
                type="text"
                value={competitor1.name}
                onChange={(e) => setCompetitor1Name(e.target.value)}
                className="w-full text-2xl font-bold text-center p-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Competitor 1"
              />
            </div>

            {/* Score Display */}
            <div className="bg-blue-600 text-white rounded-lg p-6 mb-4 text-center">
              <div className="text-6xl font-bold mb-2">{competitor1.score}</div>
              <div className="text-lg uppercase tracking-wide">Points</div>
            </div>

            {/* Score Controls */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Points</h3>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => addScore1(2)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-lg text-xl transition">+2</button>
                <button onClick={() => addScore1(3)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-lg text-xl transition">+3</button>
                <button onClick={() => addScore1(4)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-lg text-xl transition">+4</button>
                <button onClick={() => removeScore1(2)} className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-4 rounded-lg text-xl transition">-2</button>
              </div>
            </div>

            {/* Advantages */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Advantages: {competitor1.advantages}</h3>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={addAdvantage1} className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition">+ Advantage</button>
                <button onClick={removeAdvantage1} className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-lg transition">- Advantage</button>
              </div>
            </div>

            {/* Penalties */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Penalties: {competitor1.penalties}</h3>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={addPenalty1} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition">+ Penalty</button>
                <button onClick={removePenalty1} className="bg-orange-700 hover:bg-orange-800 text-white font-bold py-3 rounded-lg transition">- Penalty</button>
              </div>
            </div>
          </div>

          {/* Competitor 2 Controls */}
          <div className="bg-red-50 rounded-lg shadow-md p-6">
            <div className="mb-4">
              <input
                type="text"
                value={competitor2.name}
                onChange={(e) => setCompetitor2Name(e.target.value)}
                className="w-full text-2xl font-bold text-center p-3 border-2 border-red-300 rounded-lg focus:outline-none focus:border-red-500"
                placeholder="Competitor 2"
              />
            </div>

            {/* Score Display */}
            <div className="bg-red-600 text-white rounded-lg p-6 mb-4 text-center">
              <div className="text-6xl font-bold mb-2">{competitor2.score}</div>
              <div className="text-lg uppercase tracking-wide">Points</div>
            </div>

            {/* Score Controls */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Points</h3>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => addScore2(2)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-lg text-xl transition">+2</button>
                <button onClick={() => addScore2(3)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-lg text-xl transition">+3</button>
                <button onClick={() => addScore2(4)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-lg text-xl transition">+4</button>
                <button onClick={() => removeScore2(2)} className="bg-red-700 hover:bg-red-800 text-white font-bold py-4 rounded-lg text-xl transition">-2</button>
              </div>
            </div>

            {/* Advantages */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Advantages: {competitor2.advantages}</h3>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={addAdvantage2} className="bg-red-400 hover:bg-red-500 text-white font-bold py-3 rounded-lg transition">+ Advantage</button>
                <button onClick={removeAdvantage2} className="bg-red-700 hover:bg-red-800 text-white font-bold py-3 rounded-lg transition">- Advantage</button>
              </div>
            </div>

            {/* Penalties */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Penalties: {competitor2.penalties}</h3>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={addPenalty2} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition">+ Penalty</button>
                <button onClick={removePenalty2} className="bg-orange-700 hover:bg-orange-800 text-white font-bold py-3 rounded-lg transition">- Penalty</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
