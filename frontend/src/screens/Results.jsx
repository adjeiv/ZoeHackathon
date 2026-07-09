import { useState } from 'react';
import SourceIcon from '../components/SourceIcon.jsx';

// One expandable follow-up question ("Discover more"), with its linked sources.
function Faq({ faq }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq${open ? ' open' : ''}`}>
      <button className="faq-q" onClick={() => setOpen((v) => !v)}>
        <span>{faq.q}</span>
        <span className="faq-chevron">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="faq-a">
          <p>{faq.a}</p>
          {faq.sources?.length > 0 && (
            <div className="faq-sources">
              {faq.sources.map((s, i) => {
                const Row = s.url ? 'a' : 'div';
                const props = s.url ? { href: s.url, target: '_blank', rel: 'noreferrer' } : {};
                return (
                  <Row className="faq-source" key={i} {...props}>
                    <SourceIcon source={s.source} emoji={s.icon} />
                    <span className="faq-source-name">{s.name}</span>
                  </Row>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Verdict view. Enters with a fadeUp animation. Handles three states: a live
// verdict, "no checkable claims", and a backend error.
export default function Results({ result, error, onCheckAnother }) {
  if (error) {
    return (
      <div className="results fade-up">
        <div className="error-card">
          <strong>Something went wrong.</strong>
          <div style={{ marginTop: 6 }}>{error}</div>
        </div>
        <button className="primary-btn" onClick={onCheckAnother}>
          Try again
        </button>
      </div>
    );
  }

  if (!result || result.empty) {
    return (
      <div className="results fade-up">
        <div className="verdict-card">
          <h3 className="verdict-headline" style={{ color: 'var(--sub)' }}>
            No checkable claims found
          </h3>
          <p className="summary-p" style={{ marginTop: 8 }}>
            We couldn't find a specific health claim to fact-check
            {result?.transcript ? ' in what you shared.' : '.'} Try a clearer statement
            like “Eating after 8pm makes you gain weight”.
          </p>
        </div>
        <button className="primary-btn" style={{ marginTop: 18 }} onClick={onCheckAnother}>
          Check another
        </button>
      </div>
    );
  }

  const {
    claim,
    tag,
    verdict,
    verdictColor,
    truthScore,
    confidence,
    summary,
    points = [],
    sources = [],
    faqs = [],
    personalNote,
  } = result;

  const share = async () => {
    const shareText = `ZoeCheck — "${claim}": ${tag} (${confidence}% confidence).`;
    try {
      if (navigator.share) await navigator.share({ title: 'ZoeCheck', text: shareText });
      else {
        await navigator.clipboard.writeText(shareText);
      }
    } catch {
      /* user dismissed the share sheet */
    }
  };

  return (
    <div className="results fade-up">
      <div className="verdict-card">
        <div className="verdict-top">
          <span className="verdict-tag" style={{ background: verdictColor }}>
            {tag}
          </span>
          <span className="confidence">{confidence}% confidence</span>
        </div>

        <div className="claim-label">The claim</div>
        <p className="claim-quote">“{claim}”</p>

        <h3 className="verdict-headline" style={{ color: verdictColor }}>
          {verdict}
        </h3>

        <div className="scale-wrap">
          <div className="scale-bar">
            <div
              className="scale-marker"
              style={{ left: `${truthScore}%`, borderColor: verdictColor }}
            />
          </div>
          <div className="scale-labels">
            <span>Myth</span>
            <span>Needs context</span>
            <span>True</span>
          </div>
        </div>

        {summary && <p className="summary-p">{summary}</p>}

        {points.length > 0 && (
          <>
            <div className="science-label">WHAT THE SCIENCE SAYS</div>
            <div className="points">
              {points.map((p, i) => (
                <div className="point" key={i}>
                  <span className="dot">●</span>
                  <span className="txt">{p}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {personalNote && (
          <div className={`personal-note${personalNote.relevance === 'caution' ? ' caution' : ''}`}>
            <span>{personalNote.relevance === 'caution' ? '⚠️' : '👤'}</span>
            <span>{personalNote.note}</span>
          </div>
        )}
      </div>

      <div className="sources-card">
        <div className="sources-title">
          Sources <span className="count">· {sources.length} references</span>
        </div>
        {sources.length === 0 ? (
          <p className="source-note">No specific sources were cited for this verdict.</p>
        ) : (
          <div className="source-list">
            {sources.map((s, i) => {
              const Row = s.url ? 'a' : 'div';
              const props = s.url ? { href: s.url, target: '_blank', rel: 'noreferrer' } : {};
              return (
                <Row className="source-row" key={i} {...props}>
                  <SourceIcon source={s.source} emoji={s.icon} />
                  <div className="source-main">
                    <div className="source-name">{s.name}</div>
                    <div className="source-note">{s.note}</div>
                  </div>
                  <span className="source-tag">{s.tag}</span>
                </Row>
              );
            })}
          </div>
        )}
      </div>

      {faqs.length > 0 && (
        <div className="discover-card">
          <div className="sources-title">Discover more</div>
          <p className="discover-intro">Questions people ask next about this.</p>
          <div className="faq-list">
            {faqs.map((f, i) => (
              <Faq faq={f} key={i} />
            ))}
          </div>
        </div>
      )}

      <div className="results-actions">
        <button className="primary-btn" onClick={onCheckAnother}>
          Check another
        </button>
        <button className="secondary-btn" onClick={share}>
          Share ↗
        </button>
      </div>

      <p className="fine-print">ZoeCheck is an educational tool, not medical advice.</p>
    </div>
  );
}
