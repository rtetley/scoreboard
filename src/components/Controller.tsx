import React from 'react';
import { useScoreboard } from '../context/ScoreboardContext';

export const Controller: React.FC = () => {
  const {
    competitor1,
    competitor2,
    time,
    isRunning,
    setCompetitor1Name,
    setCompetitor2Name,
    addScore1,
    addScore2,
    removeScore1,
    removeScore2,
    addAdvantage1,
    addAdvantage2,
    removeAdvantage1,
    removeAdvantage2,
    addPenalty1,
    addPenalty2,
    removePenalty1,
    removePenalty2,
    startTimer,
    pauseTimer,
    resetTimer,
    resetScoreboard,
  } = useScoreboard();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-4">
            BJJ Scoreboard Controller
          </h1>
          
          {/* Timer Controls */}
          <div className="flex flex-col items-center space-y-4">
            <div className="text-5xl md:text-6xl font-bold text-gray-800 font-mono">
              {formatTime(time)}
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={startTimer}
                disabled={isRunning}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg transition"
              >
                Start
              </button>
              <button
                onClick={pauseTimer}
                disabled={!isRunning}
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
                <button
                  onClick={() => addScore1(2)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-lg text-xl transition"
                >
                  +2
                </button>
                <button
                  onClick={() => addScore1(3)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-lg text-xl transition"
                >
                  +3
                </button>
                <button
                  onClick={() => addScore1(4)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-lg text-xl transition"
                >
                  +4
                </button>
                <button
                  onClick={() => removeScore1(2)}
                  className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-4 rounded-lg text-xl transition"
                >
                  -2
                </button>
              </div>
            </div>

            {/* Advantages */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">
                Advantages: {competitor1.advantages}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={addAdvantage1}
                  className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition"
                >
                  + Advantage
                </button>
                <button
                  onClick={removeAdvantage1}
                  className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-lg transition"
                >
                  - Advantage
                </button>
              </div>
            </div>

            {/* Penalties */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-700">
                Penalties: {competitor1.penalties}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={addPenalty1}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition"
                >
                  + Penalty
                </button>
                <button
                  onClick={removePenalty1}
                  className="bg-orange-700 hover:bg-orange-800 text-white font-bold py-3 rounded-lg transition"
                >
                  - Penalty
                </button>
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
                <button
                  onClick={() => addScore2(2)}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-lg text-xl transition"
                >
                  +2
                </button>
                <button
                  onClick={() => addScore2(3)}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-lg text-xl transition"
                >
                  +3
                </button>
                <button
                  onClick={() => addScore2(4)}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-lg text-xl transition"
                >
                  +4
                </button>
                <button
                  onClick={() => removeScore2(2)}
                  className="bg-red-700 hover:bg-red-800 text-white font-bold py-4 rounded-lg text-xl transition"
                >
                  -2
                </button>
              </div>
            </div>

            {/* Advantages */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">
                Advantages: {competitor2.advantages}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={addAdvantage2}
                  className="bg-red-400 hover:bg-red-500 text-white font-bold py-3 rounded-lg transition"
                >
                  + Advantage
                </button>
                <button
                  onClick={removeAdvantage2}
                  className="bg-red-700 hover:bg-red-800 text-white font-bold py-3 rounded-lg transition"
                >
                  - Advantage
                </button>
              </div>
            </div>

            {/* Penalties */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-700">
                Penalties: {competitor2.penalties}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={addPenalty2}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition"
                >
                  + Penalty
                </button>
                <button
                  onClick={removePenalty2}
                  className="bg-orange-700 hover:bg-orange-800 text-white font-bold py-3 rounded-lg transition"
                >
                  - Penalty
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
