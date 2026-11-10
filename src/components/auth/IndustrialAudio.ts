/**
 * Industrial Audio Synthesizer for FORGEOS Login Experience
 * Generates procedural mechanical and digital sound effects using the Web Audio API.
 * Zero external audio assets required; reliable across all network environments.
 */

class IndustrialAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private cncOsc: OscillatorNode | null = null;
  private cncGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;

  constructor() {
    // Lazily initialized on first user interaction to comply with browser autoplay policies
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(muted ? 0 : 0.05, this.ctx.currentTime);
    }
    if (this.cncGain && this.ctx && muted) {
      this.cncGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Crisp dual-tone electronic acknowledgment chirp when tapping the industrial tablet
   */
  public playTabletChirp() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(2200, now + 0.08);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  /**
   * Motorized shutter opening sound: low frequency gear motor drive + filtered noise
   */
  public playShutterSound(durationSec: number = 2.2) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Motor fundamental tone
    const motorOsc = this.ctx.createOscillator();
    const motorGain = this.ctx.createGain();
    motorOsc.type = 'sawtooth';
    motorOsc.frequency.setValueAtTime(65, now);
    motorOsc.frequency.linearRampToValueAtTime(85, now + 0.3);
    motorOsc.frequency.setValueAtTime(85, now + durationSec - 0.2);
    motorOsc.frequency.linearRampToValueAtTime(50, now + durationSec);

    // Lowpass filter for mechanical enclosure resonance
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, now);

    motorGain.gain.setValueAtTime(0.001, now);
    motorGain.gain.linearRampToValueAtTime(0.15, now + 0.2);
    motorGain.gain.setValueAtTime(0.15, now + durationSec - 0.2);
    motorGain.gain.linearRampToValueAtTime(0.001, now + durationSec);

    motorOsc.connect(filter);
    filter.connect(motorGain);
    motorGain.connect(this.ctx.destination);

    motorOsc.start(now);
    motorOsc.stop(now + durationSec);

    // End thud when shutter latches open
    setTimeout(() => {
      this.playMechanicalThud();
    }, (durationSec - 0.1) * 1000);
  }

  /**
   * Solid mechanical clamp / shutter lock thud
   */
  public playMechanicalThud() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  /**
   * CNC Machining Sound: Spindle spool-up to 12,000 RPM followed by rhythmic high-speed milling
   */
  public startCncMachining() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Stop any existing spindle
    this.stopCncMachining();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    // Spindle ramp-up pitch from 180Hz to 680Hz (simulating 12,000 RPM)
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.8);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.Q.setValueAtTime(3.0, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);

    this.cncOsc = osc;
    this.cncGain = gain;
  }

  public stopCncMachining() {
    if (this.cncOsc && this.ctx) {
      const now = this.ctx.currentTime;
      if (this.cncGain) {
        this.cncGain.gain.linearRampToValueAtTime(0.001, now + 0.3);
      }
      setTimeout(() => {
        try {
          this.cncOsc?.stop();
          this.cncOsc?.disconnect();
          this.cncOsc = null;
        } catch {
          // ignore
        }
      }, 350);
    }
  }

  /**
   * Authentic MES authentication success chime: Crisp ascending industrial triad
   */
  public playAuthSuccess() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const noteTime = this.ctx.currentTime + idx * 0.09;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.15, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.3);
    });
  }

  /**
   * Subtle ambient shop-floor ventilation hum
   */
  public startAmbientHum() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || this.ambientGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(55, now); // 55Hz electrical grid / air handler drone

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.035, now + 1.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    this.ambientGain = gain;
  }
}

export const industrialAudio = new IndustrialAudioEngine();
