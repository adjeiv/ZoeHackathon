import { useState } from 'react';

// Renders the brand icon PNG for a source (assets/icons → public/source-icons),
// falling back to the emoji from the backend if the file is missing or empty.
export default function SourceIcon({ source, emoji }) {
  const [failed, setFailed] = useState(false);
  const showImg = source && !failed;
  return (
    <div className="source-icon">
      {showImg ? (
        <img
          className="source-icon-img"
          src={`/source-icons/${source}.png`}
          alt=""
          onError={() => setFailed(true)}
        />
      ) : (
        <span>{emoji || '📄'}</span>
      )}
    </div>
  );
}
