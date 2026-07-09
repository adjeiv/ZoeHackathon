// The Zoe coral "Z" mascot. `className` lets each screen size/position it.
export default function Mascot({ width = 158, className = '', alt = 'Zoe' }) {
  return (
    <img
      className={className}
      src="/mascot/mascot.png"
      alt={alt}
      style={{ width }}
    />
  );
}
