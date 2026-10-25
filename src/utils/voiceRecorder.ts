// Records audio everywhere (MediaRecorder is broadly supported, including
// iOS Safari). Live speech-to-text only works where SpeechRecognition
// exists -- which excludes iOS Safari today -- so callers must treat the
// transcript as a bonus, never assume it filled in, and let her type or
// fix the words herself either way.

type SpeechRecognitionLike = any;

function getSpeechRecognition(): SpeechRecognitionLike | null {
  const w = window as any;
  const Impl = w.SpeechRecognition || w.webkitSpeechRecognition;
  return Impl ? new Impl() : null;
}

export const speechRecognitionAvailable = !!getSpeechRecognition();

export interface RecordingHandle {
  stop: () => Promise<{ blob: Blob; durationSec: number }>;
  cancel: () => void;
}

export async function startRecording(onInterimTranscript?: (text: string) => void): Promise<RecordingHandle> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const chunks: BlobPart[] = [];
  const mimeType = MediaRecorder.isTypeSupported("audio/mp4") ? "audio/mp4" : undefined;
  const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  const startedAt = Date.now();

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };
  recorder.start();

  let recognition: SpeechRecognitionLike | null = null;
  let finalText = "";
  if (onInterimTranscript) {
    recognition = getSpeechRecognition();
    if (recognition) {
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event: any) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const text = event.results[i][0].transcript;
          if (event.results[i].isFinal) finalText += text + " ";
          else interim += text;
        }
        onInterimTranscript((finalText + interim).trim());
      };
      recognition.onerror = () => {};
      try {
        recognition.start();
      } catch {
        recognition = null;
      }
    }
  }

  function stopStream() {
    stream.getTracks().forEach((t) => t.stop());
  }

  return {
    stop: () =>
      new Promise((resolve) => {
        recorder.onstop = () => {
          stopStream();
          if (recognition) {
            try {
              recognition.stop();
            } catch {
              /* already stopped */
            }
          }
          const blob = new Blob(chunks, { type: recorder.mimeType });
          resolve({ blob, durationSec: Math.round((Date.now() - startedAt) / 1000) });
        };
        recorder.stop();
      }),
    cancel: () => {
      try {
        recorder.stop();
      } catch {
        /* already stopped */
      }
      stopStream();
      if (recognition) {
        try {
          recognition.stop();
        } catch {
          /* already stopped */
        }
      }
    },
  };
}
