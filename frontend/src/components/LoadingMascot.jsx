// Loading animation: cross-cuts the walking frame and the standing frame so the
// coral mascot looks like it's trotting along while results are fetched.
export default function LoadingMascot() {
  return (
    <div className="loading-mascot">
      <img className="loading-frame walk" src="/mascot/mascot-walk.png" alt="Loading" />
      <img className="loading-frame stand" src="/mascot/mascot-walk-2.png" alt="" aria-hidden="true" />
    </div>
  );
}
