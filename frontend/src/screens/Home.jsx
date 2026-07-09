import { useEffect, useRef, useState } from 'react';
import Mascot from '../components/Mascot.jsx';

const TRUST = ['Peer-reviewed sources', 'Nothing is stored', 'Not medical advice'];
const ACCEPT = '.mp3,.wav,.m4a,.mp4,.webm,.ogg,.flac,.png,.jpg,.jpeg,.webp,audio/*,video/*,image/*';

function fmt(n) {
  return `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
}

// 26-bar waveform; bars animate (scaleY) only while recording.
function Waveform({ recording }) {
  const bars = Array.from({ length: 26 }, (_, i) => ({
    h: recording ? 8 + Math.round(18 * Math.abs(Math.sin(i * 1.3))) : 4,
    d: `${(i * 0.05).toFixed(2)}s`,
  }));
  return (
    <div className="waveform">
      {bars.map((b, i) => (
        <span
          key={i}
          className="wave-bar"
          style={{
            height: b.h,
            background: recording ? '#fff' : 'rgba(255,255,255,0.35)',
            animationDelay: b.d,
            animationPlayState: recording ? 'running' : 'paused',
          }}
        />
      ))}
    </div>
  );
}

export default function Home({ onCheck }) {
  const [text, setText] = useState('');
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [recordedFile, setRecordedFile] = useState(null);
  const [file, setFile] = useState(null);
  const [showLink, setShowLink] = useState(false);
  const [url, setUrl] = useState('');
  const [warn, setWarn] = useState('');

  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecordedFile(new File([blob], 'recording.webm', { type: 'audio/webm' }));
        stream.getTracks().forEach((t) => t.stop());
      };
      rec.start();
      recorderRef.current = rec;
      setRecordedFile(null);
      setSeconds(0);
      setRecording(true);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setWarn('Microphone access was blocked. Try typing or uploading instead.');
    }
  };

  const stopRecording = () => {
    clearInterval(timerRef.current);
    setRecording(false);
    recorderRef.current?.stop();
  };

  const toggleRec = () => (recording ? stopRecording() : startRecording());

  const submit = () => {
    setWarn('');
    if (text.trim()) return onCheck({ text: text.trim() });
    if (recordedFile) return onCheck({ file: recordedFile });
    if (file) return onCheck({ file });
    if (url.trim()) return onCheck({ url: url.trim() });
    setWarn('Paste a claim, record, upload, or add a link first.');
  };

  return (
    <div>
      <div className="hero-mascot">
        <Mascot bob />
      </div>
      <h1 className="headline">Hear some wild health claims?</h1>
      <p className="subhead">Check it against real, peer-reviewed science — in seconds.</p>

      <div className="input-stack">
        <div>
          <div className="section-label">PASTE IT HERE</div>
          <textarea
            className="claim-input"
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. Eating after 8pm makes you gain weight…"
          />
        </div>

        <div>
          <div className="section-label">OR TAP TO RECORD</div>
          <div className="rec-bar">
            <button
              className={`mic-btn${recording ? ' recording' : ''}`}
              onClick={toggleRec}
              aria-label={recording ? 'Stop recording' : 'Start recording'}
            >
              🎙
            </button>
            <Waveform recording={recording} />
            <span className="timer">{fmt(seconds)}</span>
          </div>
          {recordedFile && !recording && (
            <div className="field-hint" style={{ margin: '8px 0 0 4px' }}>
              ✓ Recording ready · {fmt(seconds)}
            </div>
          )}
        </div>

        <div>
          <div className="section-label">OR UPLOAD A PHOTO OR VIDEO</div>
          <div className="upload-box">
            <button className="upload-btn" onClick={() => fileInputRef.current?.click()}>
              ↑ Upload
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT}
              style={{ display: 'none' }}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {file ? (
              <span className="file-chosen">{file.name}</span>
            ) : (
              <span className="upload-help">
                Drop a screenshot or clip — MP3, WAV, M4A, MP4, PNG. Up to 200MB.
              </span>
            )}
          </div>
        </div>

        <div>
          <button className="link-toggle" onClick={() => setShowLink((v) => !v)}>
            <span>›</span> 🔗 or check a video link
          </button>
          {showLink && (
            <input
              className="link-input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste a TikTok, Reels or YouTube link…"
            />
          )}
        </div>
      </div>

      <button className="primary-btn home-check" onClick={submit}>
        Check the claim ✨
      </button>
      {warn && <p className="warn">{warn}</p>}

      <div className="trust-row">
        {TRUST.map((t) => (
          <div className="trust-pill" key={t}>
            <span className="check">✓</span> {t}
          </div>
        ))}
      </div>
    </div>
  );
}
