import { useState } from 'react';

// Onboarding quiz — the questions from PERSONALISATION_QUESTIONS.md. Each answer
// is saved onto `person`, and api.js folds conditions + the support / confidence
// / source signals into what the backend's personalize() step reads.
const QUESTIONS = [
  {
    key: 'conditions',
    label: 'What best describes your PMOS journey?',
    options: [
      { label: 'I have a confirmed PMOS diagnosis', value: ['PMOS'] },
      { label: 'I’m exploring whether I may have PMOS', value: ['PMOS (suspected)'] },
      { label: 'I’m supporting someone with PMOS / learning more', value: ['None'] },
    ],
  },
  {
    key: 'supportArea',
    label: 'What PMOS areas would you like support with?',
    options: [
      { label: 'Understanding symptoms & hormones', value: 'understanding symptoms & hormones' },
      { label: 'Nutrition, weight & metabolic health', value: 'nutrition, weight & metabolic health' },
      { label: 'Fertility, periods & reproductive health', value: 'fertility, periods & reproductive health' },
    ],
  },
  {
    key: 'confidence',
    label: 'How confident do you feel navigating PMOS advice?',
    options: [
      {
        label: 'Confident. I understand my condition and know what to trust',
        value: 'feels confident navigating health advice',
      },
      {
        label: 'Unsure. I often find conflicting advice online',
        value: 'often finds conflicting advice online',
      },
      {
        label: 'Overwhelmed. I don’t know what’s evidence-based',
        value: 'feels overwhelmed and unsure what is evidence-based',
      },
    ],
  },
  {
    key: 'infoSource',
    label: 'Where do you usually get PMOS information?',
    options: [
      {
        label: 'Instagram, TikTok or social media',
        value: 'usually gets health info from social media (Instagram, TikTok)',
      },
      {
        label: 'Google, blogs, podcasts or online communities',
        value: 'usually gets health info from Google, blogs and online communities',
      },
      {
        label: 'Healthcare professionals, research or trusted health websites',
        value: 'usually gets health info from healthcare professionals and trusted sources',
      },
    ],
  },
];

export default function Quiz({ name, initial, onSave }) {
  const [answers, setAnswers] = useState(() => {
    const seed = {};
    for (const q of QUESTIONS) {
      const v = initial?.[q.key];
      const isDefaultNone =
        q.key === 'conditions' && Array.isArray(v) && v.length === 1 && v[0] === 'None';
      if (v !== undefined && v !== '' && !isDefaultNone) seed[q.key] = v;
    }
    return seed;
  });

  const pick = (key, value) => setAnswers((a) => ({ ...a, [key]: value }));
  const isPicked = (key, value) => JSON.stringify(answers[key]) === JSON.stringify(value);

  const save = () => {
    const patch = {};
    for (const q of QUESTIONS) {
      if (answers[q.key] !== undefined) patch[q.key] = answers[q.key];
    }
    onSave(patch);
  };

  return (
    <div className="screen fade-up">
      <div className="screen-inner quiz-inner">
        <h1 className="quiz-title">
          {name ? `Nice to meet you, ${name}!` : 'Nice to meet you!'}
          <br />
          Let’s get to know your body and PMOS
        </h1>

        {QUESTIONS.map((q) => (
          <div className="quiz-q" key={q.key}>
            <div className="quiz-q-label">{q.label}</div>
            <div className="options">
              {q.options.map((o) => (
                <button
                  key={o.label}
                  className={`option${isPicked(q.key, o.value) ? ' selected' : ''}`}
                  onClick={() => pick(q.key, o.value)}
                >
                  <span>{o.label}</span>
                  <span className="tick">✓</span>
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="quiz-actions">
          <button className="primary-btn" onClick={save}>
            Save &amp; continue →
          </button>
        </div>
      </div>
    </div>
  );
}
