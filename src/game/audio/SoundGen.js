// src/game/audio/SoundGen.js
// Synthetische geluiden als Blob URLs — geen externe bestanden of CORS nodig

const SR = 22050

function _str(v, off, s) { for (let i = 0; i < s.length; i++) v.setUint8(off + i, s.charCodeAt(i)) }

function toWav(f32) {
  const n = f32.length, b = new ArrayBuffer(44 + n * 2), v = new DataView(b)
  _str(v, 0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); _str(v, 8, 'WAVE'); _str(v, 12, 'fmt ')
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true)
  v.setUint32(24, SR, true); v.setUint32(28, SR * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true)
  _str(v, 36, 'data'); v.setUint32(40, n * 2, true)
  for (let i = 0; i < n; i++) v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, f32[i])) * 0x7FFF, true)
  return URL.createObjectURL(new Blob([b], { type: 'audio/wav' }))
}

function env(i, n, a = 0.02, r = 0.06) {
  const ai = SR * a, ri = SR * r
  return i < ai ? i / ai : i > n - ri ? (n - i) / ri : 1
}

// ── SFX ──────────────────────────────────────────────────────

function sfxJuist() {
  // C5 (523 Hz) → E5 (659 Hz) — twee noten omhoog
  const n = Math.floor(SR * 0.30), s = new Float32Array(n), h = n >> 1
  for (let i = 0; i < n; i++) {
    const t = i / SR, f = i < h ? 523 : 659, li = i < h ? i : i - h, ln = i < h ? h : n - h
    s[i] = (Math.sin(2 * Math.PI * f * t) * 0.7 + Math.sin(4 * Math.PI * f * t) * 0.2) * env(li, ln) * 0.42
  }
  return s
}

function sfxFout() {
  // Dalende toon 380 → 190 Hz
  const n = Math.floor(SR * 0.30), s = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const t = i / SR, f = 380 - t * (380 - 190) / 0.30
    s[i] = (Math.sin(2 * Math.PI * f * t) * 0.65 + Math.sin(3 * Math.PI * f * t) * 0.25) * env(i, n, 0.01, 0.12) * 0.38
  }
  return s
}

function sfxItem() {
  // G4 → A4 → C5 snel arpeggio
  const freqs = [392, 440, 523], dn = Math.floor(SR * 0.075)
  const s = new Float32Array(freqs.length * dn)
  freqs.forEach((f, fi) => {
    for (let i = 0; i < dn; i++) {
      const t = (fi * dn + i) / SR
      s[fi * dn + i] = (Math.sin(2 * Math.PI * f * t) * 0.7 + Math.sin(4 * Math.PI * f * t) * 0.2) * env(i, dn, 0.005, 0.03) * 0.40
    }
  })
  return s
}

// ── BGM — Caribische melodie in C groot, 110 BPM ─────────────

function sfxBGM() {
  const beat = 60 / 110

  // Platte array: [freq_hz, slagen, ...] — freq 0 = rust
  const mel = [
    392, .5, 440, .5, 523, 1, 440, .5, 392, .5, 330, 1,   // G A C A G E
    330, .5, 349, .5, 392, 1, 330, .5, 294, .5, 262, 1,   // E F G E D C
    392, .5, 440, .5, 523, 1, 659, .5, 523, .5, 440, 1,   // G A C E'C A
    349, .5, 330, .5, 294,  1, 262, 2,                     // F E D C__
  ]
  const bas = [
    131, 1, 131, 1, 131, 1, 131, 1,   // C C C C
    175, 1, 175, 1, 196, 1, 196, 1,   // F F G G
    131, 1, 131, 1, 131, 1, 131, 1,   // C C C C
    196, 1, 196, 1, 131,  2,          // G G C__
  ]

  let totBeats = 0
  for (let i = 1; i < mel.length; i += 2) totBeats += mel[i]
  const N = Math.floor(SR * totBeats * beat), out = new Float32Array(N)

  // Melodie laag
  let off = 0
  for (let i = 0; i < mel.length; i += 2) {
    const f = mel[i], n = Math.floor(SR * mel[i + 1] * beat), g = Math.floor(n * 0.82)
    if (f > 0) {
      for (let j = 0; j < g && off + j < N; j++) {
        const t = (off + j) / SR
        out[off + j] += (Math.sin(2 * Math.PI * f * t) * 0.65 + Math.sin(4 * Math.PI * f * t) * 0.18) * env(j, g, 0.01, 0.08) * 0.28
      }
    }
    off += n
  }

  // Bas laag
  off = 0
  for (let i = 0; i < bas.length; i += 2) {
    const f = bas[i], n = Math.floor(SR * bas[i + 1] * beat), g = Math.floor(n * 0.65)
    if (off + n > N) break
    for (let j = 0; j < g; j++) {
      const t = (off + j) / SR
      out[off + j] += (Math.sin(2 * Math.PI * f * t) * 0.8 + Math.sin(4 * Math.PI * f * t) * 0.1) * env(j, g, 0.005, 0.08) * 0.22
    }
    off += n
  }

  // Normalize
  let peak = 0
  for (let i = 0; i < N; i++) if (Math.abs(out[i]) > peak) peak = Math.abs(out[i])
  if (peak > 0.75) for (let i = 0; i < N; i++) out[i] /= peak / 0.75

  return out
}

export function maakGeluidURLs() {
  return {
    bgm:   toWav(sfxBGM()),
    juist: toWav(sfxJuist()),
    fout:  toWav(sfxFout()),
    item:  toWav(sfxItem()),
  }
}
