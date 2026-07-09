// The trusted-source directory from PERSONALISATION_QUESTIONS.md — the places
// Paloma leans on, and where people can read more for themselves.
const SOURCES = [
  {
    name: 'NHS',
    tag: 'Institutional',
    desc: 'Official NHS guidance on managing PMOS and your wider health.',
    links: [{ label: 'Visit NHS', url: 'https://www.nhs.uk/conditions/polycystic-ovary-syndrome-pcos/' }],
  },
  {
    name: 'Verity',
    tag: 'Charity',
    desc: 'A charity offering information and support to anyone living with PMOS.',
    links: [{ label: 'verity-pcos.org.uk', url: 'https://www.verity-pcos.org.uk' }],
  },
  {
    name: 'The Lowdown',
    tag: 'Community',
    desc: 'A website to search and share real PMOS experiences.',
    links: [{ label: 'thelowdown.com', url: 'https://www.thelowdown.com' }],
  },
  {
    name: 'British Fertility Society',
    tag: 'Institutional',
    desc: 'Information for the public about fertility.',
    links: [{ label: 'britishfertilitysociety.org.uk', url: 'https://www.britishfertilitysociety.org.uk' }],
  },
  {
    name: 'ZOE',
    tag: 'Science',
    desc: 'Information about diet and gut health.',
    links: [{ label: 'zoe.com', url: 'https://www.zoe.com' }],
  },
  {
    name: 'British Dietetic Association (BDA)',
    tag: 'Nutrition',
    desc: 'Evidence-based guidance on diet for PMOS, plus general food and health advice.',
    links: [
      { label: 'PMOS diet', url: 'https://www.bda.uk.com/resource/polycystic-ovary-syndrome-pcos-diet.html' },
      { label: 'Food & health', url: 'https://www.bda.uk.com/food-health.html' },
    ],
  },
  {
    name: 'Association for Nutrition (AfN)',
    tag: 'Register',
    desc: 'Search the register to check whether someone is a registered nutritionist.',
    links: [{ label: 'Search the register', url: 'https://www.associationfornutrition.org/register/search-the-register' }],
  },
];

// A short badge for each source: its parenthetical acronym (BDA, AfN), an
// existing all-caps acronym (NHS, ZOE), otherwise the leading initial.
function badge(name) {
  const paren = name.match(/\(([^)]+)\)/);
  if (paren) return paren[1];
  const first = name.replace(/^the\s+/i, '').split(/\s+/)[0];
  return first === first.toUpperCase() ? first : first[0].toUpperCase();
}

export default function Sources({ onBack }) {
  return (
    <div className="screen fade-up">
      <div className="screen-inner plain-inner">
        <div className="topbar">
          <button className="back-btn" onClick={onBack}>‹ Home</button>
        </div>

        <h1 className="screen-title">Trusted sources</h1>
        <p className="screen-sub">
          The places Paloma leans on when checking a claim — and where you can read
          more for yourself.
        </p>

        <div className="trusted-list">
          {SOURCES.map((s) => (
            <div className="trusted-card" key={s.name}>
              <span className="trusted-badge">{badge(s.name)}</span>
              <div className="trusted-main">
                <div className="trusted-head">
                  <span className="trusted-name">{s.name}</span>
                  <span className="trusted-tag">{s.tag}</span>
                </div>
                <p className="trusted-desc">{s.desc}</p>
                <div className="trusted-links">
                  {s.links.map((l) => (
                    <a
                      className="trusted-link"
                      key={l.url}
                      href={l.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {l.label} ↗
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="fine-print">
          Zoe is an educational tool, not medical advice. Always check with a
          healthcare professional.
        </p>
      </div>
    </div>
  );
}
