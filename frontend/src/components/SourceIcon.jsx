import { useState } from 'react';

// Source ids that have a real, non-empty icon PNG in public/source-icons.
// Anything else (e.g. "papers", the dominant PMOS source) renders the emoji
// directly — so we never fire a 404 that shows the broken-image glyph.
const ICON_SOURCES = new Set(['nhs', 'who', 'zoe', 'johns_hopkins']);

// Renders the brand icon PNG for a source, falling back to the emoji from the
// backend when there's no icon file (or the image fails to load).
export default function SourceIcon({ source, emoji }) {
  const [failed, setFailed] = useState(false);
  const key = (source || '').toLowerCase();
  const showImg = ICON_SOURCES.has(key) && !failed;
  return (
    <div className="source-icon">
      {showImg ? (
        <img
          className="source-icon-img"
          src={`/source-icons/${key}.png`}
          alt=""
          onError={() => setFailed(true)}
        />
      ) : (
        <span>{emoji || '📄'}</span>
      )}
    </div>
  );
}
