// Two-frame "gif" for the loading state: cross-cuts between pink_mascot_start
// and pink_mascot_end. The frames are stacked and their opacity alternates,
// while the whole thing gently bobs.
export default function LoadingMascot({ width = 180 }) {
  const height = Math.round((width * 701) / 986); // preserve the 986×701 ratio
  return (
    <div className="loading-mascot bob" style={{ width, height }}>
      <img className="frame frame-a" src="/mascot/pink_mascot_start.png" alt="Loading" />
      <img className="frame frame-b" src="/mascot/pink_mascot_end.png" alt="" aria-hidden="true" />
    </div>
  );
}
