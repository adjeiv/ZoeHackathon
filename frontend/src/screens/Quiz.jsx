import { useState } from 'react';

// Onboarding step 2 — a light 3-question quiz that seeds personalisation.
// Each answer maps onto a field the backend's personalize() step reads
// (conditions / diet / goal). The fuller profile stays editable later.
const QUESTIONS = [
  {
    key: 'conditions',
    label: 'Do you have PCOS?',
    options: [
      { label: 'Yes, diagnosed', value: ['PCOS'] },
      { label: 'I think so', value: ['PCOS (suspected)'] },
      { label: 'No / not sure', value: ['None'] },
    ],
  },
  {
    key: 'diet',
    label: 'How do you eat day to day?',
    options: [
      { label: 'Pretty balanced', value: 'Balanced' },
      { label: 'Plant-based', value: 'Plant-based' },
      { label: 'Lower-carb', value: 'Low-carb' },
    ],
  },
  {
    key: 'goal',
    label: 'What brings you to Paloma?',
    options: [
      { label: 'Manage my symptoms', value: 'Manage PCOS symptoms' },
      { label: 'Learn what’s actually true', value: 'Understand my body' },
      { label: 'General wellbeing', value: 'General wellbeing' },
    ],
  },
];

export default function Quiz({ name, initial, onSave }) {
  const [answers, setAnswers] = useState(() => ({
    conditions: initial?.conditions,
    diet: initial?.diet && initial.diet !== 'None' ? initial.diet : undefined,
    goal: initial?.goal || undefined,
  }));

  const pick = (key, value) => setAnswers((a) => ({ ...a, [key]: value }));
  const isPicked = (key, value) => JSON.stringify(answers[key]) === JSON.stringify(value);

  const save = () => {
    const patch = {};
    if (answers.conditions) patch.conditions = answers.conditions;
    if (answers.diet) patch.diet = answers.diet;
    if (answers.goal) patch.goal = answers.goal;
    onSave(patch);
  };

  return (
    <div className="screen fade-up">
      <div className="screen-inner quiz-inner">
        <h1 className="quiz-title">
          {name ? `Nice to meet you, ${name}!` : 'Nice to meet you!'}
          <br />
          Let’s get to know your body and PCOS
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
            Save & continue →
          </button>
        </div>
      </div>
    </div>
  );
}
