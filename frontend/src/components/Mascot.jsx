// The ZoeCheck brand mascot (Home screen). `bob` gives it a gentle vertical
// bobbing animation.
export default function Mascot({ bob = false, width = 180 }) {
  return (
    <img
      className={`mascot-img${bob ? ' bob' : ''}`}
      src="/mascot/pink_mascot.png"
      alt="ZoeCheck mascot"
      style={{ width }}
    />
  );
}
