import { useState } from 'react';
import SourceIcon from '../components/SourceIcon.jsx';

// One expandable follow-up question, with its linked sources.
function Faq({ faq }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq">
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

// The deeper-dive screen reached from Score: a plain-language advice summary,
// a short list of trusted sources to read next, and the follow-up questions
// people ask about PCOS.
export default function Suggestions({ result, onBack, onDone }) {
  const { summary, sources = [], faqs = [] } = result || {};
  const topSources = sources.slice(0, 4);

  return (
    <div className="screen fade-up">
      <div className="screen-inner suggest-inner">
        <div className="topbar">
          <button className="back-btn" onClick={onBack}>‹ Back</button>
        </div>

        <h1 className="suggest-title">Discover our suggestions</h1>

        {summary && (
          <div className="card card--lavender advice-card">
            <div className="advice-title">Advice summary</div>
            <p className="advice-body">{summary}</p>
          </div>
        )}

        {topSources.length > 0 && (
          <div className="card card--coral sources-card">
            <div className="sources-title">Sources to look at</div>
            <div className="source-list">
              {topSources.map((s, i) => {
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
          </div>
        )}

        {faqs.length > 0 && (
          <>
            <h2 className="section-title" style={{ marginTop: 24 }}>FAQs about PCOS</h2>
            <div className="faq-list">
              {faqs.map((f, i) => (
                <Faq faq={f} key={i} />
              ))}
            </div>
          </>
        )}

        <button
          className="primary-btn primary-btn--block"
          style={{ marginTop: 26 }}
          onClick={onDone}
        >
          Back to home
        </button>
      </div>
    </div>
  );
}
