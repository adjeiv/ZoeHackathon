import Mascot from '../components/Mascot.jsx';

// Curated PCOS reading, drawn from the app's trusted-source list. Tapping one
// opens the source in a new tab.
const HIGHLIGHTS = [
  {
    tag: 'NHS',
    title: 'PCOS: symptoms, causes & how it’s diagnosed',
    href: 'https://www.nhs.uk/conditions/polycystic-ovary-syndrome-pcos/',
    variant: 'card--lavender',
  },
  {
    tag: 'ZOE',
    title: 'How the food you eat shapes insulin & PCOS',
    href: 'https://zoe.com/learn',
    variant: 'card--coral',
  },
  {
    tag: 'Verity',
    title: 'Support & community for living with PCOS',
    href: 'https://www.verity-pcos.org.uk/',
    variant: 'card--lavender',
  },
];

const VERDICT_COLOR = {
  MYTH: 'var(--myth)',
  'NEEDS CONTEXT': 'var(--context)',
  UNVERIFIED: 'var(--context)',
  SUPPORTED: 'var(--true)',
};

export default function Home({
  person,
  history,
  onStartCheck,
  onOpenHistoryItem,
  onViewHistory,
  onEditProfile,
}) {
  const name = person?.name?.trim();
  const initial = (name || 'Z').charAt(0).toUpperCase();
  const recent = history.slice(0, 3);

  return (
    <div className="screen fade-up">
      <div className="home-header">
        <div className="home-header-inner">
          <div className="profile-row">
            <div className="avatar">{initial}</div>
            <div>
              <div className="profile-hello">Welcome back</div>
              <div className="profile-name">{name || 'Friend'}</div>
            </div>
          </div>
          <button className="icon-btn" aria-label="Edit profile" onClick={onEditProfile}>
            ⚙
          </button>
        </div>
      </div>

      <div className="home-body">
        <div
          className="card--coral cta-card"
          role="button"
          tabIndex={0}
          onClick={onStartCheck}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onStartCheck()}
        >
          <Mascot className="cta-mascot" width={88} alt="" src="/mascot/circle-mascot.png" />
          <div className="cta-text">
            <div className="cta-eyebrow">Ready when you are</div>
            <div className="cta-title">Hear something new today?</div>
            <div className="cta-sub">Check a health claim against real science</div>
            <span className="cta-go">Check a claim →</span>
          </div>
        </div>

        <div className="card card--coral saved-card">
          <div className="saved-head">
            <div className="saved-title">Saved history</div>
            {history.length > 0 && (
              <button className="saved-all" onClick={onViewHistory}>
                See all
              </button>
            )}
          </div>
          {recent.length === 0 ? (
            <p className="saved-empty">
              Nothing yet — your checked claims will be saved here on this device.
            </p>
          ) : (
            <div className="saved-list">
              {recent.map((h) => (
                <button className="saved-row" key={h.id} onClick={() => onOpenHistoryItem(h)}>
                  <span
                    className="saved-dot"
                    style={{ background: VERDICT_COLOR[h.tag] || '#fff' }}
                  />
                  <span className="saved-claim">{h.claim}</span>
                  <span className="saved-chevron">›</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <h2 className="section-title">Highlights for you today</h2>
        <div className="highlight-list">
          {HIGHLIGHTS.map((h) => (
            <a
              key={h.title}
              className={`card ${h.variant} highlight`}
              href={h.href}
              target="_blank"
              rel="noreferrer"
            >
              <div>
                <div className="highlight-tag">{h.tag}</div>
                <div className="highlight-title">{h.title}</div>
              </div>
              <div className="highlight-cta">Read more →</div>
            </a>
          ))}
        </div>

        <h2 className="section-title" style={{ marginTop: 30 }}>How you can help</h2>
        <a
          className="contribute-card"
          style={{ marginTop: 0 }}
          href="https://www.verity-pcos.org.uk/participate-in-research.html"
          target="_blank"
          rel="noreferrer"
        >
          <span className="contribute-emoji">🔬</span>
          <div className="contribute-text">
            <div className="contribute-title">Contribute to research</div>
            <div className="contribute-sub">
              Help science understand PCOS better — take part in studies via Verity.
            </div>
          </div>
          <span className="contribute-arrow">↗</span>
        </a>
      </div>
    </div>
  );
}
