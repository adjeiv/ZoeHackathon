"""Audio transcription (faster-whisper) + YouTube/TikTok audio download."""
import os
import tempfile
from functools import lru_cache

import config


@lru_cache(maxsize=1)
def _model():
    from faster_whisper import WhisperModel

    return WhisperModel(config.WHISPER_SIZE, device="cpu", compute_type="int8")


def transcribe_file(path):
    """Transcribe an audio/video file to plain text."""
    segments, _info = _model().transcribe(path, vad_filter=True)
    return " ".join(seg.text.strip() for seg in segments).strip()


def transcribe_bytes(data, suffix=".wav"):
    """Transcribe raw audio bytes (e.g. from the browser mic recorder)."""
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(data)
        path = tmp.name
    try:
        return transcribe_file(path)
    finally:
        os.unlink(path)


def download_audio(url):
    """Download best audio from a YouTube/TikTok URL. Returns a local file path.

    Downloads a single best-audio stream (no ffmpeg conversion needed);
    faster-whisper decodes it directly via PyAV.
    """
    import yt_dlp

    tmpdir = tempfile.mkdtemp()
    outtmpl = os.path.join(tmpdir, "audio.%(ext)s")
    opts = {
        "format": "bestaudio/best",
        "outtmpl": outtmpl,
        "quiet": True,
        "noplaylist": True,
    }
    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(url, download=True)
        return ydl.prepare_filename(info)
