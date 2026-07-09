// The Zoe coral "Z" mascot. `className` sizes/positions it; `src` can point at
// an alternate pose (e.g. the circular badge used in the Home CTA header).
export default function Mascot({ width = 158, className = '', alt = 'Zoe', src = '/mascot/mascot.png' }) {
  return (
    <img
      className={className}
      src={src}
      alt={alt}
      style={{ width }}
    />
  );
}
