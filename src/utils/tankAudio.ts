/**
 * High-fidelity Shark Tank Studio Audio Synthesizer
 * Built entirely with Web Audio API for zero-latency, reliable audio effects.
 */

class TankAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  /**
   * Dramatic Shark Tank broadcast entry hit
   * Cinematic deep brass boom + ominous orchestral swell
   */
  public playStinger() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Sub bass impact
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(110, now);
    subOsc.frequency.exponentialRampToValueAtTime(32, now + 1.2);

    subGain.gain.setValueAtTime(0.8, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 1.5);

    // Brass minor chord
    const freqs = [130.81, 155.56, 196.00]; // C minor
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + 0.05);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);
      filter.frequency.exponentialRampToValueAtTime(2200, now + 0.2);
      filter.frequency.exponentialRampToValueAtTime(300, now + 1.6);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.25 - idx * 0.05, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + 0.05);
      osc.stop(now + 1.9);
    });
  }

  /**
   * Red "I'M OUT!" Buzzer
   * Resonant harsh metallic dual-sawtooth buzz
   */
  public playBuzzer() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const buzzFreqs = [120, 126]; // beating dissonance

    buzzFreqs.forEach((f) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, now);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, now);
      filter.Q.setValueAtTime(3, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.45, now + 0.02);
      gain.gain.setValueAtTime(0.4, now + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.6);
    });
  }

  /**
   * Deal closed golden chime / harmonic harp
   */
  public playDealGong() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const arpeggio = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C major bright

    arpeggio.forEach((freq, idx) => {
      const noteTime = now + idx * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.35, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 1.3);
    });
  }

  /**
   * Shot clock ticking sound
   */
  public playShotClockTick() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.04);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  /**
   * Cash / Number calculation ding
   */
  public playCashDing() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2093, now); // C7

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.9);
  }

  /**
   * Dramatic Shark Brawl Tension Stinger
   * Dissonant brass clash and impact sound for investor showdowns
   */
  public playBrawlClash() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Heavy bass drum punch
    const punchOsc = ctx.createOscillator();
    const punchGain = ctx.createGain();
    punchOsc.type = 'triangle';
    punchOsc.frequency.setValueAtTime(140, now);
    punchOsc.frequency.exponentialRampToValueAtTime(35, now + 0.8);

    punchGain.gain.setValueAtTime(0.7, now);
    punchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    punchOsc.connect(punchGain);
    punchGain.connect(ctx.destination);
    punchOsc.start(now);
    punchOsc.stop(now + 1.0);

    // Dissonant aggressive chord (tritone clash)
    const clashFreqs = [185.0, 220.0, 261.63, 311.13]; // F#3, A3, C4, Eb4 (diminished tension)
    clashFreqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + 0.02);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(700 + idx * 200, now);
      filter.Q.setValueAtTime(2.5, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + 0.02);
      osc.stop(now + 1.5);
    });
  }

  /**
   * Sound of heavy studio soundproof doors sliding open
   */
  public playDoorSlide() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.linearRampToValueAtTime(45, now + 1.2);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(180, now);
    filter.frequency.linearRampToValueAtTime(320, now + 0.6);
    filter.frequency.linearRampToValueAtTime(80, now + 1.2);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 1.3);
  }

  /**
   * Subtle rhythmic footsteps walking down the wooden corridor
   */
  public playFootsteps(count = 3) {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    for (let i = 0; i < count; i++) {
      const stepTime = now + i * 0.45;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, stepTime);
      osc.frequency.exponentialRampToValueAtTime(40, stepTime + 0.08);

      gain.gain.setValueAtTime(0.18, stepTime);
      gain.gain.exponentialRampToValueAtTime(0.001, stepTime + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(stepTime);
      osc.stop(stepTime + 0.1);
    }
  }
}

export const tankAudio = new TankAudioEngine();
