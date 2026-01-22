import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Competitor {
  name: string;
  score: number;
  advantages: number;
  penalties: number;
}

interface ScoreboardContextType {
  competitor1: Competitor;
  competitor2: Competitor;
  time: number;
  isRunning: boolean;
  setCompetitor1Name: (name: string) => void;
  setCompetitor2Name: (name: string) => void;
  addScore1: (points: number) => void;
  addScore2: (points: number) => void;
  removeScore1: (points: number) => void;
  removeScore2: (points: number) => void;
  addAdvantage1: () => void;
  addAdvantage2: () => void;
  removeAdvantage1: () => void;
  removeAdvantage2: () => void;
  addPenalty1: () => void;
  addPenalty2: () => void;
  removePenalty1: () => void;
  removePenalty2: () => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  resetScoreboard: () => void;
}

const ScoreboardContext = createContext<ScoreboardContextType | undefined>(undefined);

export const useScoreboard = () => {
  const context = useContext(ScoreboardContext);
  if (!context) {
    throw new Error('useScoreboard must be used within a ScoreboardProvider');
  }
  return context;
};

interface ScoreboardProviderProps {
  children: ReactNode;
}

export const ScoreboardProvider: React.FC<ScoreboardProviderProps> = ({ children }) => {
  const [competitor1, setCompetitor1] = useState<Competitor>({
    name: 'Competitor 1',
    score: 0,
    advantages: 0,
    penalties: 0,
  });

  const [competitor2, setCompetitor2] = useState<Competitor>({
    name: 'Competitor 2',
    score: 0,
    advantages: 0,
    penalties: 0,
  });

  const [time, setTime] = useState(300); // 5 minutes default
  const [isRunning, setIsRunning] = useState(false);

  // Timer effect
  React.useEffect(() => {
    let interval: number | undefined;
    
    if (isRunning && time > 0) {
      interval = window.setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, time]);

  const setCompetitor1Name = (name: string) => {
    setCompetitor1((prev) => ({ ...prev, name }));
  };

  const setCompetitor2Name = (name: string) => {
    setCompetitor2((prev) => ({ ...prev, name }));
  };

  const addScore1 = (points: number) => {
    setCompetitor1((prev) => ({ ...prev, score: prev.score + points }));
  };

  const addScore2 = (points: number) => {
    setCompetitor2((prev) => ({ ...prev, score: prev.score + points }));
  };

  const removeScore1 = (points: number) => {
    setCompetitor1((prev) => ({ ...prev, score: Math.max(0, prev.score - points) }));
  };

  const removeScore2 = (points: number) => {
    setCompetitor2((prev) => ({ ...prev, score: Math.max(0, prev.score - points) }));
  };

  const addAdvantage1 = () => {
    setCompetitor1((prev) => ({ ...prev, advantages: prev.advantages + 1 }));
  };

  const addAdvantage2 = () => {
    setCompetitor2((prev) => ({ ...prev, advantages: prev.advantages + 1 }));
  };

  const removeAdvantage1 = () => {
    setCompetitor1((prev) => ({ ...prev, advantages: Math.max(0, prev.advantages - 1) }));
  };

  const removeAdvantage2 = () => {
    setCompetitor2((prev) => ({ ...prev, advantages: Math.max(0, prev.advantages - 1) }));
  };

  const addPenalty1 = () => {
    setCompetitor1((prev) => ({ ...prev, penalties: prev.penalties + 1 }));
  };

  const addPenalty2 = () => {
    setCompetitor2((prev) => ({ ...prev, penalties: prev.penalties + 1 }));
  };

  const removePenalty1 = () => {
    setCompetitor1((prev) => ({ ...prev, penalties: Math.max(0, prev.penalties - 1) }));
  };

  const removePenalty2 = () => {
    setCompetitor2((prev) => ({ ...prev, penalties: Math.max(0, prev.penalties - 1) }));
  };

  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setTime(300);
    setIsRunning(false);
  };

  const resetScoreboard = () => {
    setCompetitor1({
      name: 'Competitor 1',
      score: 0,
      advantages: 0,
      penalties: 0,
    });
    setCompetitor2({
      name: 'Competitor 2',
      score: 0,
      advantages: 0,
      penalties: 0,
    });
    resetTimer();
  };

  return (
    <ScoreboardContext.Provider
      value={{
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
      }}
    >
      {children}
    </ScoreboardContext.Provider>
  );
};
