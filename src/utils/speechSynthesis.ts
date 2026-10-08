/**
 * Speech Synthesis Helper for Shark Tank Characters
 */

export class SharkVoiceEngine {
  private isEnabled: boolean = true;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  public toggle(): boolean {
    this.isEnabled = !this.isEnabled;
    if (!this.isEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    return this.isEnabled;
  }

  public speak(sharkId: string, text: string) {
    if (!this.isEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    try {
      window.speechSynthesis.cancel();

      // Clean dialogue of quotes or meta-text
      const cleanText = text.replace(/^[A-Za-z\s]+:\s*/, '').replace(/"/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);

      // Voice profile configuration
      switch (sharkId) {
        case 'kevin':
          utterance.pitch = 0.82;
          utterance.rate = 0.98;
          break;
        case 'mark':
          utterance.pitch = 1.05;
          utterance.rate = 1.15; // Fast energetic tech founder style
          break;
        case 'lori':
          utterance.pitch = 1.25;
          utterance.rate = 1.05; // Bright QVC cadence
          break;
        case 'daymond':
          utterance.pitch = 0.9;
          utterance.rate = 1.0;
          break;
        case 'barbara':
          utterance.pitch = 1.15;
          utterance.rate = 1.02;
          break;
        case 'pitcher':
          utterance.pitch = 1.02;
          utterance.rate = 1.05; // Confident clear founder delivery
          break;
        default:
          utterance.pitch = 1.0;
          utterance.rate = 1.05;
      }

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        if (sharkId === 'lori' || sharkId === 'barbara') {
          const femaleVoice = voices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('karen') || v.name.toLowerCase().includes('zira'));
          if (femaleVoice) utterance.voice = femaleVoice;
        } else {
          const maleVoice = voices.find(v => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('daniel') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('george'));
          if (maleVoice) utterance.voice = maleVoice;
        }
      }

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const sharkVoice = new SharkVoiceEngine();
