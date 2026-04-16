// Topic helpers for the scoreboard MQTT protocol

export const DISPLAYS_PREFIX = 'scoreboard/displays';

export function presenceTopic(displayId: string) {
  return `${DISPLAYS_PREFIX}/${displayId}/presence`;
}

export function stateTopic(displayId: string, ...parts: string[]) {
  return `${DISPLAYS_PREFIX}/${displayId}/${parts.join('/')}`;
}

export function allDisplaysTopic() {
  return `${DISPLAYS_PREFIX}/+/presence`;
}

export function allStateTopics(displayId: string) {
  return `${DISPLAYS_PREFIX}/${displayId}/#`;
}

// Parse a displayId from a full topic string
export function parseDisplayIdFromPresence(topic: string): string | null {
  const match = topic.match(/^scoreboard\/displays\/([^/]+)\/presence$/);
  return match ? match[1] : null;
}

export interface ScoreboardState {
  competitor1: {
    name: string;
    score: number;
    advantages: number;
    penalties: number;
  };
  competitor2: {
    name: string;
    score: number;
    advantages: number;
    penalties: number;
  };
  timer: {
    seconds: number;
    running: boolean;
  };
}

export const DEFAULT_SCOREBOARD_STATE: ScoreboardState = {
  competitor1: { name: 'Competitor 1', score: 0, advantages: 0, penalties: 0 },
  competitor2: { name: 'Competitor 2', score: 0, advantages: 0, penalties: 0 },
  timer: { seconds: 300, running: false },
};

/** Apply a single MQTT message to the scoreboard state */
export function applyMessage(
  state: ScoreboardState,
  topic: string,
  payload: string,
  displayId: string,
): ScoreboardState {
  const prefix = `${DISPLAYS_PREFIX}/${displayId}/`;
  if (!topic.startsWith(prefix)) return state;

  const path = topic.slice(prefix.length);

  switch (path) {
    case 'competitor1/name':
      return { ...state, competitor1: { ...state.competitor1, name: payload } };
    case 'competitor1/score':
      return { ...state, competitor1: { ...state.competitor1, score: Number(payload) } };
    case 'competitor1/advantages':
      return { ...state, competitor1: { ...state.competitor1, advantages: Number(payload) } };
    case 'competitor1/penalties':
      return { ...state, competitor1: { ...state.competitor1, penalties: Number(payload) } };
    case 'competitor2/name':
      return { ...state, competitor2: { ...state.competitor2, name: payload } };
    case 'competitor2/score':
      return { ...state, competitor2: { ...state.competitor2, score: Number(payload) } };
    case 'competitor2/advantages':
      return { ...state, competitor2: { ...state.competitor2, advantages: Number(payload) } };
    case 'competitor2/penalties':
      return { ...state, competitor2: { ...state.competitor2, penalties: Number(payload) } };
    case 'timer/seconds':
      return { ...state, timer: { ...state.timer, seconds: Number(payload) } };
    case 'timer/running':
      return { ...state, timer: { ...state.timer, running: payload === 'true' } };
    default:
      return state;
  }
}

/** Publish the full scoreboard state as retained MQTT messages */
export function publishFullState(
  publish: (topic: string, payload: string, retain?: boolean) => void,
  displayId: string,
  state: ScoreboardState,
) {
  const t = (p: string, v: string) => publish(stateTopic(displayId, p), v, true);
  t('competitor1/name', state.competitor1.name);
  t('competitor1/score', String(state.competitor1.score));
  t('competitor1/advantages', String(state.competitor1.advantages));
  t('competitor1/penalties', String(state.competitor1.penalties));
  t('competitor2/name', state.competitor2.name);
  t('competitor2/score', String(state.competitor2.score));
  t('competitor2/advantages', String(state.competitor2.advantages));
  t('competitor2/penalties', String(state.competitor2.penalties));
  t('timer/seconds', String(state.timer.seconds));
  t('timer/running', String(state.timer.running));
}
