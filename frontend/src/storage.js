// Per-device persistence via localStorage (per the design spec: history and
// personalisation "stay on this device").

const PERSON_KEY = 'zoecheck.person';
const HISTORY_KEY = 'zoecheck.history';

export const DEFAULT_PERSON = {
  age: '',
  sex: '',
  activity: '',
  diet: 'None',
  conditions: ['None'],
  allergies: '',
  goal: '',
};

export function loadPerson() {
  try {
    const raw = localStorage.getItem(PERSON_KEY);
    return raw ? { ...DEFAULT_PERSON, ...JSON.parse(raw) } : { ...DEFAULT_PERSON };
  } catch {
    return { ...DEFAULT_PERSON };
  }
}

export function savePerson(person) {
  try {
    localStorage.setItem(PERSON_KEY, JSON.stringify(person));
  } catch {
    /* ignore quota / private-mode errors */
  }
}

export function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Prepend a completed check; keep the most recent 50. Stores the full result
// so a history row can reopen its verdict without re-running the pipeline.
export function addHistory(result) {
  if (!result || result.empty) return loadHistory();
  const entry = {
    id: Date.now(),
    ts: Date.now(),
    claim: result.claim,
    tag: result.tag,
    color: result.verdictColor,
    result,
  };
  const list = [entry, ...loadHistory()].slice(0, 50);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
  return list;
}

export function clearHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    /* ignore */
  }
  return [];
}

// Human-friendly relative date for history rows.
export function relativeDate(ts) {
  const days = Math.floor((Date.now() - ts) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return 'Last week';
  return new Date(ts).toLocaleDateString();
}
