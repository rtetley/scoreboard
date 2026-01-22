import React from 'react';
import { useScoreboard } from '../context/ScoreboardContext';

export const Display: React.FC = () => {
  const { competitor1, competitor2, time } = useScoreboard();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center p-8">
      {/* Timer */}
      <div className="mb-12">
        <div className="text-9xl font-bold text-white tracking-wider font-mono">
          {formatTime(time)}
        </div>
      </div>

      {/* Scoreboard */}
      <div className="w-full max-w-7xl grid grid-cols-2 gap-8">
        {/* Competitor 1 */}
        <div className="bg-blue-600 rounded-3xl p-12 shadow-2xl">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-8 truncate">
              {competitor1.name}
            </h2>
            
            {/* Score */}
            <div className="mb-8">
              <div className="text-8xl font-bold text-white mb-2">
                {competitor1.score}
              </div>
              <div className="text-2xl text-blue-200 uppercase tracking-wide">
                Points
              </div>
            </div>

            {/* Advantages and Penalties */}
            <div className="grid grid-cols-2 gap-6 mt-8">
              <div className="bg-blue-700 rounded-xl p-6">
                <div className="text-5xl font-bold text-white mb-2">
                  {competitor1.advantages}
                </div>
                <div className="text-lg text-blue-200 uppercase">
                  Advantages
                </div>
              </div>
              <div className="bg-blue-700 rounded-xl p-6">
                <div className="text-5xl font-bold text-white mb-2">
                  {competitor1.penalties}
                </div>
                <div className="text-lg text-blue-200 uppercase">
                  Penalties
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Competitor 2 */}
        <div className="bg-red-600 rounded-3xl p-12 shadow-2xl">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-8 truncate">
              {competitor2.name}
            </h2>
            
            {/* Score */}
            <div className="mb-8">
              <div className="text-8xl font-bold text-white mb-2">
                {competitor2.score}
              </div>
              <div className="text-2xl text-red-200 uppercase tracking-wide">
                Points
              </div>
            </div>

            {/* Advantages and Penalties */}
            <div className="grid grid-cols-2 gap-6 mt-8">
              <div className="bg-red-700 rounded-xl p-6">
                <div className="text-5xl font-bold text-white mb-2">
                  {competitor2.advantages}
                </div>
                <div className="text-lg text-red-200 uppercase">
                  Advantages
                </div>
              </div>
              <div className="bg-red-700 rounded-xl p-6">
                <div className="text-5xl font-bold text-white mb-2">
                  {competitor2.penalties}
                </div>
                <div className="text-lg text-red-200 uppercase">
                  Penalties
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
