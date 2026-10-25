import { useEffect, useRef, useState } from "react";
import { startRecording, speechRecognitionAvailable, type RecordingHandle } from "../utils/voiceRecorder";
import { getBlobUrl, putBlob, deleteBlob } from "../storage/db";
import { newId } from "../utils/id";
import { ConfirmDialog } from "./ConfirmDialog";

interface VoiceFieldProps {
  label: string;
  prompt?: string;
  text: string;
  audioId: string | null;
  onChange: (text: string, audioId: string | null) => void;
  placeholder?: string;
}

export function VoiceField({ label, prompt, text, audioId, onChange, placeholder }: VoiceFieldProps) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [confirmReRecord, setConfirmReRecord] = useState(false);
  const [playUrl, setPlayUrl] = useState<string | null>(null);
  const handleRef = useRef<RecordingHandle | null>(null);
  const timerRef = useRef<number | undefined>(undefined);
  const liveTextRef = useRef(text);

  useEffect(() => {
    getBlobUrl(audioId).then(setPlayUrl);
  }, [audioId]);

  async function beginRecording() {
    setRecording(true);
    setSeconds(0);
    liveTextRef.current = "";
    timerRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    handleRef.current = await startRecording((live) => {
      liveTextRef.current = live;
    });
  }

  async function handleStart() {
    if (audioId) {
      setConfirmReRecord(true);
      return;
    }
    await beginRecording();
  }

  async function handleStop() {
    const handle = handleRef.current;
    if (!handle) return;
    window.clearInterval(timerRef.current);
    setRecording(false);
    const { blob } = await handle.stop();
    const id = newId();
    await putBlob(id, blob);
    const transcribed = liveTextRef.current.trim();
    onChange(transcribed || text, id);
  }

  async function confirmAndReRecord() {
    if (audioId) await deleteBlob(audioId);
    setConfirmReRecord(false);
    await beginRecording();
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <label>{label}</label>
      {prompt && <p style={{ color: "var(--stone)", fontSize: 15, marginTop: -4, marginBottom: 10 }}>{prompt}</p>}

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
        {!recording ? (
          <button
            type="button"
            className="btn-secondary"
            onClick={handleStart}
            aria-label={audioId ? "Re-record" : "Record"}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <MicIcon /> {audioId ? "Re-record" : "Tap to talk"}
          </button>
        ) : (
          <button
            type="button"
            className="btn-primary"
            onClick={handleStop}
            style={{ background: "var(--rose)", display: "flex", alignItems: "center", gap: 8 }}
          >
            <StopIcon /> Stop ({seconds}s)
          </button>
        )}
        {playUrl && !recording && (
          <audio controls src={playUrl} style={{ height: 36, maxWidth: 220 }} />
        )}
      </div>

      {!speechRecognitionAvailable && (
        <p style={{ color: "var(--stone)", fontSize: 13, marginBottom: 8 }}>
          Automatic writing-down isn't available on this device yet — type your words below, or just listen back to
          the recording above.
        </p>
      )}

      <textarea
        rows={4}
        value={text}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value, audioId)}
      />

      <ConfirmDialog
        open={confirmReRecord}
        title="Record over this?"
        body="Re-recording will replace the voice recording you have now. You can keep editing the written words either way."
        confirmLabel="Record again"
        onConfirm={confirmAndReRecord}
        onCancel={() => setConfirmReRecord(false)}
      />
    </div>
  );
}

function MicIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z" />
      <path d="M19 11a7 7 0 0 1-14 0M12 18v3" strokeLinecap="round" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
      <rect x={6} y={6} width={12} height={12} rx={2} />
    </svg>
  );
}
