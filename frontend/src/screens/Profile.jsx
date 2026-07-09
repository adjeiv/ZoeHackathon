import { useState } from 'react';

const SEX = ['Female', 'Male', 'Other'];
const DIET = ['None', 'Balanced', 'Plant-based', 'Low-carb', 'Vegetarian', 'Vegan'];
const CONDITIONS = ['None', 'PCOS', 'Insulin resistance', 'Thyroid issue', 'IBS', 'Pregnant'];
const GOALS = ['General wellbeing', 'Manage PCOS symptoms', 'Understand my body', 'Lose weight'];

function Chip({ label, selected, onClick }) {
  return (
    <button className={`chip${selected ? ' selected' : ''}`} onClick={onClick} type="button">
      {label}
    </button>
  );
}

export default function Profile({ person, onBack, onSave }) {
  const [form, setForm] = useState(person);
  const [saved, setSaved] = useState(false);

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setSaved(false);
  };

  // A condition chip counts as selected on an exact match, and the PCOS chip
  // also matches the "PCOS (suspected)" value the onboarding quiz can seed.
  const condSelected = (opt) => {
    const c = form.conditions || [];
    if (opt === 'PCOS') return c.some((x) => x.startsWith('PCOS'));
    return c.includes(opt);
  };

  // Multi-select with an exclusive "None": choosing None clears the rest;
  // choosing anything else clears None. Empty selection falls back to None.
  const toggleCondition = (opt) => {
    setSaved(false);
    setForm((f) => {
      let c = f.conditions || [];
      if (opt === 'None') {
        c = ['None'];
      } else if (condSelected(opt)) {
        c = c.filter((x) => (opt === 'PCOS' ? !x.startsWith('PCOS') : x !== opt));
      } else {
        c = [...c.filter((x) => x !== 'None'), opt];
      }
      if (c.length === 0) c = ['None'];
      return { ...f, conditions: c };
    });
  };

  const save = () => {
    setSaved(true);
    onSave({ ...form, name: (form.name || '').trim() });
  };

  const initial = ((form.name || 'Z').trim().charAt(0) || 'Z').toUpperCase();

  return (
    <div className="screen fade-up">
      <div className="screen-inner plain-inner">
        <div className="topbar">
          <button className="back-btn" onClick={onBack}>‹ Home</button>
        </div>

        <div className="profile-avatar-block">
          <div className="avatar">{initial}</div>
          <div className="field-hint">Your profile</div>
        </div>

        <p className="screen-sub" style={{ textAlign: 'center' }}>
          This tailors how Zoe explains results. It stays on your device — never medical advice.
        </p>

        <div className="privacy-note">
          <span>🔒</span>
          <span className="txt">
            Saved only on this device and never shared. It only shapes how answers are explained.
          </span>
        </div>

        <div className="form-card">
          <div>
            <div className="field-label">Name</div>
            <input
              className="text-input full-input"
              value={form.name || ''}
              onChange={(e) => set('name', e.target.value)}
              placeholder="What should we call you?"
            />
          </div>

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
            <div className="field-label">Dietary pattern</div>
            <div className="chip-group">
              {DIET.map((o) => (
                <Chip key={o} label={o} selected={form.diet === o} onClick={() => set('diet', o)} />
              ))}
            </div>
          </div>

          <div>
            <div className="field-label">Health conditions</div>
            <div className="field-hint" style={{ marginBottom: 10 }}>Select all that apply</div>
            <div className="chip-group">
              {CONDITIONS.map((o) => (
                <Chip key={o} label={o} selected={condSelected(o)} onClick={() => toggleCondition(o)} />
              ))}
            </div>
          </div>

          <div>
            <div className="field-label">Main goal</div>
            <div className="chip-group">
              {GOALS.map((o) => (
                <Chip key={o} label={o} selected={form.goal === o} onClick={() => set('goal', o)} />
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

        <button className="primary-btn save-btn" onClick={save}>Save preferences</button>
        {saved && <p className="saved-toast">✓ Saved on this device</p>}
      </div>
    </div>
  );
}
