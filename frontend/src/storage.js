// Per-device persistence via localStorage (per the design spec: history and
// personalisation "stay on this device").

const PERSON_KEY = 'zoecheck.person';
const HISTORY_KEY = 'zoecheck.history';
const ONBOARDED_KEY = 'zoecheck.onboarded';

export const DEFAULT_PERSON = {
  name: '',
  age: '',
  sex: '',
  activity: '',
  diet: 'None',
  conditions: ['None'],
  allergies: '',
  goal: '',
  supportArea: '',   // onboarding: PCOS area they want help with
  confidence: '',    // onboarding: how they feel navigating advice
  infoSource: '',    // onboarding: where they usually get info
};

// Onboarding (Name → Quiz) runs once; the flag lets returning users land
// straight on the Home dashboard.
export function loadOnboarded() {
  try {
    return localStorage.getItem(ONBOARDED_KEY) === '1';
  } catch {
    return false;
  }
}

export function saveOnboarded(done = true) {
  try {
    if (done) localStorage.setItem(ONBOARDED_KEY, '1');
    else localStorage.removeItem(ONBOARDED_KEY);
  } catch {
    /* ignore */
  }
}

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
