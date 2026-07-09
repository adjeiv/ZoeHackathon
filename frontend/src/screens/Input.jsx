import { useEffect, useRef, useState } from 'react';
import Mascot from '../components/Mascot.jsx';

const ACCEPT = '.mp3,.wav,.m4a,.mp4,.webm,.ogg,.flac,.png,.jpg,.jpeg,.webp,audio/*,video/*,image/*';

function fmt(n) {
  return `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
}

// 24-bar waveform; bars animate (scaleY) only while recording.
function Waveform({ recording }) {
  const bars = Array.from({ length: 24 }, (_, i) => ({
    h: recording ? 8 + Math.round(16 * Math.abs(Math.sin(i * 1.3))) : 4,
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
            opacity: recording ? 1 : 0.4,
            animationDelay: b.d,
            animationPlayState: recording ? 'running' : 'paused',
          }}
        />
      ))}
    </div>
  );
}

// The claim-capture screen: paste text, record audio, upload a file, or paste a
// video link. Submitting hands the chosen input up to App to run the check.
export default function Input({ onCheck, onBack }) {
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
    <div className="screen fade-up">
      <div className="screen-inner input-inner">
        <div className="topbar">
          <button className="back-btn" onClick={onBack}>‹ Back</button>
        </div>

        <h1 className="input-title">Great!<br />Hear something new today?</h1>
        <Mascot className="input-mascot" width={108} alt="" />

        <div className="input-stack">
          <div>
            <div className="section-label">PASTE IT HERE</div>
            <textarea
              className="claim-input"
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. Spearmint tea cures PCOS…"
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
                {recording ? '■' : '🎙'}
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

          <div className="or-divider">OR</div>

          <div>
            <div className="section-label">UPLOAD A PHOTO OR CLIP</div>
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

        </div>

        <button className="primary-btn primary-btn--block input-submit" onClick={submit}>
          Check the claim ✨
        </button>
        {warn && <p className="warn">{warn}</p>}
      </div>
    </div>
  );
}
