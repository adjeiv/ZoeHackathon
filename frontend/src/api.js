// Thin client for the FastAPI backend. The Vite dev server proxies /api.

// Build a free-text profile string the backend's personalize() step can read,
// from the structured personalisation form.
export function profileFromPerson(person) {
  if (!person) return '';
  const parts = [];
  if (person.age) parts.push(`${person.age} years old`);
  if (person.sex) parts.push(person.sex.toLowerCase());
  if (person.activity) parts.push(`${person.activity.toLowerCase()} activity level`);
  if (person.diet && person.diet !== 'None') parts.push(person.diet.toLowerCase());
  if (person.allergies) parts.push(`allergies/intolerances: ${person.allergies}`);
  if (person.goal) parts.push(`goal: ${person.goal.toLowerCase()}`);
  if (person.supportArea) parts.push(`wants support with ${person.supportArea}`);
  if (person.confidence) parts.push(person.confidence);
  if (person.infoSource) parts.push(person.infoSource);
  return parts.join(', ');
}

export function conditionsFromPerson(person) {
  if (!person) return [];
  return (person.conditions || []).filter((c) => c && c !== 'None');
}

// Send a claim for checking. `input` is one of:
//   { text }              typed / pasted claim
//   { url }               video link
//   { file: File }        uploaded image / audio / video (incl. mic recording)
export async function checkClaim(input, person) {
  const form = new FormData();
  if (input.text) form.append('text', input.text);
  if (input.url) form.append('url', input.url);
  if (input.file) form.append('file', input.file, input.file.name || 'recording.webm');

  const conditions = conditionsFromPerson(person);
  if (conditions.length) form.append('conditions', conditions.join(', '));
  const profile = profileFromPerson(person);
  if (profile) form.append('profile', profile);

  // The `ngrok-skip-browser-warning` header stops ngrok's free tier from
  // returning its HTML interstitial instead of the JSON response (Vercel
  // forwards this header through its /api rewrite to the tunnel).
  const res = await fetch('/api/check', {
    method: 'POST',
    body: form,
    headers: { 'ngrok-skip-browser-warning': 'true' },
  });
  if (!res.ok) throw new Error(`Server error (${res.status})`);
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    // Almost always the tunnel is down or pointing at a stale ngrok URL.
    throw new Error('Backend unreachable — the API tunnel may be down or the deployed URL is stale.');
  }
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}
