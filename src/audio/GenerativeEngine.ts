const midiToFreq = (midi: number): number => 440 * Math.pow(2, (midi - 69) / 12);

export type GenMode = 'ambient' | 'edm';

const AMBIENT_CHORDS: number[][] = [
  [48, 55, 64, 67, 72],
  [45, 52, 60, 64, 69],
  [41, 48, 57, 60, 65],
  [43, 50, 59, 62, 67],
];

const EDM_SCALE = [48, 51, 53, 55, 58, 60, 63, 65, 67, 70, 72, 75];

export class GenerativeEngine {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private analyser!: AnalyserNode;
  private convolver!: ConvolverNode;
  private wetGain!: GainNode;
  private dryGain!: GainNode;

  private padOscs: OscillatorNode[] = [];
  private padGains: GainNode[] = [];
  private padFilter!: BiquadFilterNode;
  private lfo!: OscillatorNode;
  private lfoGain!: GainNode;
  private subOsc: OscillatorNode | null = null;
  private subGain: GainNode | null = null;
  private chordIdx = 0;
  private chordTimer: ReturnType<typeof setInterval> | null = null;

  private bassFilter: BiquadFilterNode | null = null;
  private seqTimer: ReturnType<typeof setInterval> | null = null;
  private step = 0;
  private arpIdx = 0;

  private _mode: GenMode = 'ambient';
  private _volume = 0.5;
  private _mx = 0.5;
  private _my = 0.5;
  private _running = false;
  private rafId = 0;

  get isRunning() { return this._running; }
  get mode() { return this._mode; }
  getAnalyser(): AnalyserNode | null { return this.analyser ?? null; }

  setMouse(x: number, y: number) {
    this._mx = Math.max(0, Math.min(1, x));
    this._my = Math.max(0, Math.min(1, y));
  }

  setVolume(v: number) {
    this._volume = v;
    if (this.master && this.ctx)
      this.master.gain.setTargetAtTime(v * 0.35, this.ctx.currentTime, 0.05);
  }

  setMode(m: GenMode) {
    if (m === this._mode) return;
    const was = this._running;
    if (was) this.teardown();
    this._mode = m;
    if (was) this.buildMode();
  }

  onClick() {
    if (!this._running || !this.ctx) return;
    this._mode === 'ambient' ? this.chime() : this.impact();
  }

  async start() {
    if (this._running) return;
    this.ctx = new AudioContext();
    if (this.ctx.state === 'suspended') await this.ctx.resume();
    this.buildGraph();
    this._running = true;
    this.buildMode();
    this.tick();
  }

  stop() {
    if (!this._running) return;
    this._running = false;
    this.teardown();
    cancelAnimationFrame(this.rafId);
    this.ctx?.close();
    this.ctx = null;
  }

  private buildGraph() {
    const c = this.ctx!;
    this.master = c.createGain();
    this.master.gain.value = this._volume * 0.35;
    this.analyser = c.createAnalyser();
    this.analyser.fftSize = 64;
    this.convolver = c.createConvolver();
    this.convolver.buffer = this.makeIR(4, 2.5);
    this.wetGain = c.createGain();
    this.wetGain.gain.value = 0.5;
    this.dryGain = c.createGain();
    this.dryGain.gain.value = 0.6;
    this.master.connect(this.dryGain);
    this.master.connect(this.convolver);
    this.convolver.connect(this.wetGain);
    this.dryGain.connect(this.analyser);
    this.wetGain.connect(this.analyser);
    this.analyser.connect(c.destination);
  }

  private tick() {
    if (!this._running || !this.ctx) return;
    const t = this.ctx.currentTime;
    if (this._mode === 'ambient') {
      const fc = 200 * Math.pow(20, this._mx);
      this.padFilter?.frequency.setTargetAtTime(fc, t, 0.3);
      const w = 0.15 + (1 - this._my) * 0.7;
      const d = 0.3 + this._my * 0.5;
      this.wetGain?.gain.setTargetAtTime(w, t, 0.3);
      this.dryGain?.gain.setTargetAtTime(d, t, 0.3);
    } else {
      const fc = 200 + this._mx * 3000;
      this.bassFilter?.frequency.setTargetAtTime(fc, t, 0.1);
      const w = 0.03 + (1 - this._my) * 0.25;
      this.wetGain?.gain.setTargetAtTime(w, t, 0.1);
      this.dryGain?.gain.setTargetAtTime(0.8, t, 0.1);
    }
    this.rafId = requestAnimationFrame(() => this.tick());
  }

  // --- AMBIENT ---

  private startAmbient() {
    const c = this.ctx!;
    this.padFilter = c.createBiquadFilter();
    this.padFilter.type = 'lowpass';
    this.padFilter.frequency.value = 800;
    this.padFilter.Q.value = 0.7;
    this.padFilter.connect(this.master);

    this.lfo = c.createOscillator();
    this.lfo.type = 'sine';
    this.lfo.frequency.value = 0.08;
    this.lfoGain = c.createGain();
    this.lfoGain.gain.value = 300;
    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.padFilter.frequency);
    this.lfo.start();

    this.subOsc = c.createOscillator();
    this.subOsc.type = 'sine';
    this.subOsc.frequency.value = midiToFreq(AMBIENT_CHORDS[0][0] - 12);
    this.subGain = c.createGain();
    this.subGain.gain.value = 0.06;
    this.subOsc.connect(this.subGain);
    this.subGain.connect(this.master);
    this.subOsc.start();

    this.playChord(AMBIENT_CHORDS[0]);
    this.chordTimer = setInterval(() => {
      this.chordIdx = (this.chordIdx + 1) % AMBIENT_CHORDS.length;
      this.crossfade(AMBIENT_CHORDS[this.chordIdx]);
    }, 10000);
  }

  private playChord(notes: number[]) {
    const c = this.ctx!;
    const now = c.currentTime;
    notes.forEach((n, i) => {
      const o = c.createOscillator();
      o.type = i < 2 ? 'triangle' : 'sine';
      o.frequency.value = midiToFreq(n);
      o.detune.value = (Math.random() - 0.5) * 8;
      const g = c.createGain();
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.09, now + 2);
      o.connect(g);
      g.connect(this.padFilter);
      o.start(now);
      this.padOscs.push(o);
      this.padGains.push(g);
    });
  }

  private crossfade(notes: number[]) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const old = { o: this.padOscs, g: this.padGains };
    old.g.forEach(g => g.gain.setTargetAtTime(0, now, 2));
    setTimeout(() => old.o.forEach(o => { try { o.stop(); } catch {} }), 8000);
    this.padOscs = [];
    this.padGains = [];
    this.playChord(notes);
    if (this.subOsc) {
      this.subOsc.frequency.setTargetAtTime(midiToFreq(notes[0] - 12), now, 2);
    }
  }

  private chime() {
    const c = this.ctx!;
    const t = c.currentTime;
    const notes = [72, 76, 79, 84, 88];
    const n = notes[Math.floor(Math.random() * notes.length)];

    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.value = midiToFreq(n);
    const g = c.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.12, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, t + 2.5);
    o.connect(g);
    g.connect(this.master);
    o.start(t);
    o.stop(t + 3);

    const o2 = c.createOscillator();
    o2.type = 'sine';
    o2.frequency.value = midiToFreq(n) * 2.76;
    const g2 = c.createGain();
    g2.gain.setValueAtTime(0.04, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
    o2.connect(g2);
    g2.connect(this.master);
    o2.start(t);
    o2.stop(t + 1.5);
  }

  // --- EDM ---

  private startEdm() {
    const c = this.ctx!;
    this.bassFilter = c.createBiquadFilter();
    this.bassFilter.type = 'lowpass';
    this.bassFilter.frequency.value = 600;
    this.bassFilter.Q.value = 4;
    this.bassFilter.connect(this.master);
    this.step = 0;
    this.arpIdx = 0;
    const ms = (60 / 128 / 4) * 1000;
    this.seqTimer = setInterval(() => this.seq(), ms);
  }

  private seq() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const s = this.step;
    if (s % 4 === 0) this.kick(t);
    if (s % 2 === 0) this.hat(t, s % 4 === 2);
    if (s % 16 === 0 || s % 16 === 6 || s % 16 === 10) this.bass(t);
    if (s % 2 === 0) this.arp(t);
    this.step++;
  }

  private kick(t: number) {
    const c = this.ctx!;
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(160, t);
    o.frequency.exponentialRampToValueAtTime(35, t + 0.07);
    const g = c.createGain();
    g.gain.setValueAtTime(0.6, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    o.connect(g); g.connect(this.master);
    o.start(t); o.stop(t + 0.4);
  }

  private hat(t: number, open: boolean) {
    const c = this.ctx!;
    const len = open ? 0.12 : 0.03;
    const buf = c.createBuffer(1, c.sampleRate * len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    const hp = c.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 9000;
    const g = c.createGain();
    g.gain.setValueAtTime(open ? 0.08 : 0.06, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + len);
    src.connect(hp); hp.connect(g); g.connect(this.master);
    src.start(t);
  }

  private bass(t: number) {
    if (!this.bassFilter) return;
    const c = this.ctx!;
    const pat = [36, 36, 39, 36, 41, 43];
    const n = pat[this.step % pat.length] || 36;
    const o = c.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = midiToFreq(n);
    const g = c.createGain();
    g.gain.setValueAtTime(0.2, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    o.connect(g); g.connect(this.bassFilter);
    o.start(t); o.stop(t + 0.2);
  }

  private arp(t: number) {
    const c = this.ctx!;
    const bi = Math.floor(this._mx * (EDM_SCALE.length - 4));
    const n = EDM_SCALE[Math.min(bi + (this.arpIdx % 4), EDM_SCALE.length - 1)];
    this.arpIdx++;
    const o = c.createOscillator();
    o.type = 'square';
    o.frequency.value = midiToFreq(n);
    const f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 600 + this._mx * 3000;
    f.Q.value = 3;
    const g = c.createGain();
    g.gain.setValueAtTime(0.06, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    o.connect(f); f.connect(g); g.connect(this.master);
    o.start(t); o.stop(t + 0.12);
  }

  private impact() {
    const c = this.ctx!;
    const t = c.currentTime;
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(100, t);
    o.frequency.exponentialRampToValueAtTime(30, t + 0.3);
    const g = c.createGain();
    g.gain.setValueAtTime(0.4, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    o.connect(g); g.connect(this.master);
    o.start(t); o.stop(t + 0.5);

    const buf = c.createBuffer(1, c.sampleRate * 0.2, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++)
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
    const src = c.createBufferSource();
    src.buffer = buf;
    const g2 = c.createGain();
    g2.gain.setValueAtTime(0.2, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    src.connect(g2); g2.connect(this.master);
    src.start(t);
  }

  // --- Helpers ---

  private buildMode() {
    this._mode === 'ambient' ? this.startAmbient() : this.startEdm();
  }

  private teardown() {
    this.padOscs.forEach(o => { try { o.stop(); } catch {} });
    this.padOscs = [];
    this.padGains = [];
    try { this.lfo?.stop(); } catch {}
    try { this.subOsc?.stop(); } catch {}
    this.subOsc = null;
    this.subGain = null;
    if (this.chordTimer) clearInterval(this.chordTimer);
    this.chordTimer = null;
    if (this.seqTimer) clearInterval(this.seqTimer);
    this.seqTimer = null;
    try { this.padFilter?.disconnect(); } catch {}
    try { this.bassFilter?.disconnect(); } catch {}
    this.bassFilter = null;
  }

  private makeIR(dur: number, decay: number): AudioBuffer {
    const c = this.ctx!;
    const len = c.sampleRate * dur;
    const buf = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++)
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }
}
