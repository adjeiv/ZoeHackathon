import { useState } from 'react';

const SEX = ['Female', 'Male', 'Other'];
const ACTIVITY = ['Low', 'Moderate', 'High'];
const DIET = ['None', 'Vegan', 'Vegetarian', 'Keto', 'Halal'];
const CONDITIONS = ['None', 'Diabetes', 'High blood pressure', 'Pregnant', 'IBS'];
const GOALS = ['General wellbeing', 'Lose weight', 'Build muscle', 'Manage a condition'];

function Chip({ label, selected, onClick }) {
  return (
    <button className={`chip${selected ? ' selected' : ''}`} onClick={onClick} type="button">
      {label}
    </button>
  );
}

export default function Personalise({ person, onBack, onSave }) {
  const [form, setForm] = useState(person);
  const [saved, setSaved] = useState(false);

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setSaved(false);
  };

  // Multi-select with an exclusive "None": choosing None clears the rest, and
  // choosing anything else clears None. Empty selection falls back to None.
  const toggleCondition = (opt) => {
    setSaved(false);
    setForm((f) => {
      let c = f.conditions || [];
      if (opt === 'None') c = ['None'];
      else c = c.includes(opt) ? c.filter((x) => x !== opt) : [...c.filter((x) => x !== 'None'), opt];
      if (c.length === 0) c = ['None'];
      return { ...f, conditions: c };
    });
  };

  const save = () => {
    setSaved(true);
    onSave(form);
  };

  return (
    <div className="fade-up" style={{ paddingTop: 20 }}>
      <button className="back-btn" onClick={onBack}>
        ‹ Back
      </button>
      <h1 className="screen-title">Personalisation</h1>
      <p className="screen-sub">
        Tell us a bit about you so ZoeCheck can tailor its answers.
      </p>

      <div className="privacy-note">
        <span>🔒</span>
        <span className="txt">
          This stays on your device and is never shared. It only shapes how results are
          explained — never medical advice.
        </span>
      </div>

      <div className="form-card">
        <div>
          <div className="field-label">Age</div>
          <input
            className="text-input age-input"
            type="number"
            value={form.age}
            onChange={(e) => set('age', e.target.value)}
            placeholder="e.g. 34"
          />
        </div>

        <div>
          <div className="field-label">Biological sex</div>
          <div className="chip-group">
            {SEX.map((o) => (
              <Chip key={o} label={o} selected={form.sex === o} onClick={() => set('sex', o)} />
            ))}
          </div>
        </div>

        <div>
          <div className="field-label">Dietary pattern</div>
          <div className="chip-group">
            {DIET.map((o) => (
              <Chip key={o} label={o} selected={form.diet === o} onClick={() => set('diet', o)} />
            ))}
          </div>
        </div>

        <div>
          <div className="field-label">Health conditions</div>
          <div className="field-hint">Select all that apply</div>
          <div className="chip-group">
            {CONDITIONS.map((o) => (
              <Chip
                key={o}
                label={o}
                selected={(form.conditions || []).includes(o)}
                onClick={() => toggleCondition(o)}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="field-label">Allergies &amp; intolerances</div>
          <input
            className="text-input full-input"
            value={form.allergies}
            onChange={(e) => set('allergies', e.target.value)}
            placeholder="e.g. peanuts, lactose, gluten…"
          />
        </div>

      </div>

      <button className="primary-btn save-btn" onClick={save}>
        Save preferences
      </button>
      {saved && <p className="saved-toast">✓ Saved on this device</p>}
    </div>
  );
}
