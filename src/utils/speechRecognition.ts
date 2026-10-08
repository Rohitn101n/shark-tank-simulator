/**
 * Robust, Continuous Speech Recognition Engine for Shark Tank Simulator
 * Solves audio hardware contention, handles automatic restarts across pauses,
 * and includes seamless fallback to direct microphone audio recording + Gemini AI transcription
 * whenever browser speech recognition faces network or CORS limitations.
 */

export interface SpeechRecognitionStatus {
  isSupported: boolean;
  isListening: boolean;
  isTranscribing: boolean;
  transcript: string;
  interimTranscript: string;
  errorMessage: string | null;
  permissionGranted: boolean;
}

export type SpeechCallback = (status: SpeechRecognitionStatus) => void;

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

class TankSpeechRecognizer {
  private recognition: any = null;
  private shouldBeListening: boolean = false;
  private isListening: boolean = false;
  private isTranscribing: boolean = false;
  private transcript: string = '';
  private interimTranscript: string = '';
  private errorMessage: string | null = null;
  private permissionGranted: boolean = false;
  private callbacks: Set<SpeechCallback> = new Set();
  private restartTimeout: any = null;

  // Audio recording fallback via MediaRecorder & Gemini AI
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private recordedMimeType: string = 'audio/webm';
  private usingAudioFallback: boolean = false;

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition ||
      (window as any).mozSpeechRecognition ||
      (window as any).msSpeechRecognition;

    if (!SpeechRecognitionClass) {
      // Not a fatal blocker; we can still record audio via MediaRecorder!
      this.usingAudioFallback = true;
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        this.isListening = true;
        this.errorMessage = null;
        this.permissionGranted = true;
        this.notify();
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          const text = item[0].transcript;
          if (item.isFinal) {
            this.transcript = (this.transcript ? `${this.transcript} ` : '') + text.trim();
          } else {
            currentInterim += text;
          }
        }

        this.interimTranscript = currentInterim.trim();
        this.notify();
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition event:', event.error);

        // 'no-speech' or 'aborted' are normal in continuous speech mode
        if (event.error === 'no-speech') {
          return;
        }

        if (event.error === 'aborted') {
          if (this.shouldBeListening && !this.usingAudioFallback) {
            this.scheduleRestart();
          }
          return;
        }

        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          this.errorMessage = 'Microphone permission was denied. Please allow microphone in your browser settings.';
          this.permissionGranted = false;
          this.shouldBeListening = false;
          this.isListening = false;
          this.cleanupMedia();
          this.notify();
          return;
        }

        if (event.error === 'audio-capture') {
          this.errorMessage = 'Microphone capture issue. Ensure another tab is not exclusively locking your mic.';
          this.shouldBeListening = false;
          this.isListening = false;
          this.cleanupMedia();
          this.notify();
          return;
        }

        // When browser speech recognition encounters 'network' error
        // (common in Chrome iframes, Brave, or networks blocking speech.googleapis.com)
        if (event.error === 'network') {
          console.info(
            'Browser speech recognition service offline or blocked; seamlessly recording audio via microphone for Gemini AI transcription.'
          );
          this.usingAudioFallback = true;
          // Clear any error message so user experience is not disrupted
          this.errorMessage = null;
          this.isListening = true;
          if (!this.transcript && !this.interimTranscript) {
            this.interimTranscript = 'Recording voice... (Speak clearly into your microphone)';
          }
          this.notify();
          return;
        }

        // For other transient errors, keep recording with MediaRecorder
        if (this.shouldBeListening) {
          this.usingAudioFallback = true;
          this.notify();
        }
      };

      recognition.onend = () => {
        if (this.shouldBeListening && !this.usingAudioFallback) {
          this.scheduleRestart();
        } else if (!this.shouldBeListening) {
          this.isListening = false;
          this.notify();
        }
      };

      this.recognition = recognition;
    } catch (err: any) {
      console.warn('Native speech recognition init note:', err);
      this.usingAudioFallback = true;
    }
  }

  private scheduleRestart() {
    if (!this.shouldBeListening || this.usingAudioFallback) return;
    clearTimeout(this.restartTimeout);
    this.restartTimeout = setTimeout(() => {
      if (this.shouldBeListening && this.recognition && !this.usingAudioFallback) {
        try {
          this.recognition.start();
          this.isListening = true;
          this.notify();
        } catch (e: any) {
          if (e.name !== 'InvalidStateError') {
            console.warn('Speech restart note:', e);
          }
        }
      }
    }, 150);
  }

  private cleanupMedia() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (e) {
        // ignore
      }
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
  }

  public subscribe(cb: SpeechCallback) {
    this.callbacks.add(cb);
    cb(this.getStatus());
    return () => {
      this.callbacks.delete(cb);
    };
  }

  private notify() {
    const status = this.getStatus();
    this.callbacks.forEach((cb) => cb(status));
  }

  public getStatus(): SpeechRecognitionStatus {
    return {
      isSupported: true, // Always supported via audio recording fallback
      isListening: this.isListening || this.shouldBeListening,
      isTranscribing: this.isTranscribing,
      transcript: this.transcript,
      interimTranscript: this.interimTranscript,
      errorMessage: this.errorMessage,
      permissionGranted: this.permissionGranted,
    };
  }

  public async startListening(): Promise<boolean> {
    this.errorMessage = null;
    this.shouldBeListening = true;
    this.isTranscribing = false;
    this.transcript = '';
    this.interimTranscript = '';
    this.audioChunks = [];

    // 1. Acquire microphone stream and start MediaRecorder in parallel
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaStream = stream;
        this.permissionGranted = true;

        const mimeCandidates = [
          'audio/webm;codecs=opus',
          'audio/webm',
          'audio/mp4',
          'audio/ogg;codecs=opus',
        ];
        let supportedMime = '';
        if (typeof MediaRecorder !== 'undefined') {
          for (const cand of mimeCandidates) {
            if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(cand)) {
              supportedMime = cand;
              break;
            }
          }

          this.mediaRecorder = supportedMime
            ? new MediaRecorder(stream, { mimeType: supportedMime })
            : new MediaRecorder(stream);

          this.recordedMimeType = this.mediaRecorder.mimeType || 'audio/webm';
          this.mediaRecorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              this.audioChunks.push(e.data);
            }
          };
          this.mediaRecorder.start(250);
        }
      } catch (err: any) {
        console.warn('getUserMedia permission error:', err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          this.errorMessage = 'Microphone permission blocked. Click the mic icon in your address bar to allow mic access.';
          this.shouldBeListening = false;
          this.isListening = false;
          this.notify();
          return false;
        }
      }
    }

    // 2. Also try native webkitSpeechRecognition for real-time interim speech display
    if (this.recognition && !this.usingAudioFallback) {
      try {
        this.recognition.start();
        this.isListening = true;
        this.notify();
        return true;
      } catch (err: any) {
        if (err.name === 'InvalidStateError') {
          this.isListening = true;
          this.notify();
          return true;
        }
        console.warn('SpeechRecognition start exception - switching to MediaRecorder:', err);
        this.usingAudioFallback = true;
      }
    }

    // Even if native SpeechRecognition is unavailable or offline, MediaRecorder is active!
    this.isListening = true;
    this.interimTranscript = 'Recording voice... (Speak clearly into your microphone)';
    this.notify();
    return true;
  }

  public async stopListening(): Promise<string> {
    clearTimeout(this.restartTimeout);
    this.shouldBeListening = false;

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
    }

    this.isListening = false;
    let currentLiveTranscript = (this.transcript + ' ' + this.interimTranscript).trim();

    // Check if we need AI transcription fallback from recorded audio chunks
    const hasAudioRecorded = this.audioChunks.length > 0 || (this.mediaRecorder && this.mediaRecorder.state !== 'inactive');

    // If native speech gave nothing or if audio fallback was activated:
    if ((!currentLiveTranscript || this.usingAudioFallback) && hasAudioRecorded) {
      try {
        this.isTranscribing = true;
        this.interimTranscript = 'Transcribing voice with Gemini AI...';
        this.notify();

        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
          await new Promise<void>((resolve) => {
            if (!this.mediaRecorder) return resolve();
            this.mediaRecorder.onstop = () => resolve();
            this.mediaRecorder.stop();
          });
        }

        const audioBlob = new Blob(this.audioChunks, { type: this.recordedMimeType });
        if (audioBlob.size > 1000) {
          const base64Audio = await blobToBase64(audioBlob);
          const res = await fetch('/api/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioData: base64Audio,
              mimeType: this.recordedMimeType,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.transcript && data.transcript.trim()) {
              currentLiveTranscript = data.transcript.trim();
              this.transcript = currentLiveTranscript;
            }
          }
        }
      } catch (err) {
        console.warn('Voice transcription fallback error:', err);
      } finally {
        this.isTranscribing = false;
      }
    }

    this.cleanupMedia();
    this.interimTranscript = '';
    this.notify();
    return currentLiveTranscript;
  }

  public clear() {
    this.transcript = '';
    this.interimTranscript = '';
    this.errorMessage = null;
    this.isTranscribing = false;
    this.notify();
  }
}

export const tankSpeech = new TankSpeechRecognizer();
