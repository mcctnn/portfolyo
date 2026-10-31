/**
 * Radyo için sakin, döngüsel bir arka plan müziği; ses dosyası yok, tarayıcıda üretilir.
 * Yalnızca kullanıcı radyoya tıklayınca başlar (tarayıcılar otomatik sesi engeller).
 */
const CHORDS = [
  [57, 60, 64, 67], // Am7
  [53, 57, 60, 64], // Fmaj7
  [48, 55, 60, 64], // Cmaj7
  [55, 59, 62, 65], // G7
];
const MELODY = [69, 72, 74, 76, 79, 76, 74, 72];
const midi = (n) => 440 * 2 ** ((n - 69) / 12);

let ctx = null, master = null, timer = 0, step = 0, playing = false;

function note(freq, start, dur, vol, type = "triangle", dest = master) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, start);
  g.gain.linearRampToValueAtTime(vol, start + 0.08);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g).connect(dest);
  o.start(start);
  o.stop(start + dur + 0.05);
}

function bar() {
  const t = ctx.currentTime + 0.05;
  const chord = CHORDS[step % CHORDS.length];
  chord.forEach((n, i) => note(midi(n), t + i * 0.04, 3.4, 0.05));
  note(midi(chord[0] - 12), t, 3.2, 0.09, "sine");
  // iki vuruşta bir hafif melodi notası
  [0, 1.2].forEach((off, j) => {
    if (Math.random() < 0.8) note(midi(MELODY[(step * 2 + j + Math.floor(Math.random() * 3)) % MELODY.length]), t + off + 0.4, 1.1, 0.035, "sine");
  });
  step++;
}

export function isPlaying() { return playing; }

export async function startLofi() {
  if (playing) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = ctx || new AC();
  await ctx.resume();
  master = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 1100;
  master.gain.setValueAtTime(0.0001, ctx.currentTime);
  master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 1.2);
  master.connect(filter).connect(ctx.destination);
  playing = true;
  bar();
  timer = setInterval(bar, 3200);
}

export function stopLofi() {
  if (!playing) return;
  playing = false;
  clearInterval(timer);
  const c = ctx, m = master;
  m.gain.cancelScheduledValues(c.currentTime);
  m.gain.setValueAtTime(m.gain.value, c.currentTime);
  m.gain.linearRampToValueAtTime(0.0001, c.currentTime + 0.5);
  setTimeout(() => { m.disconnect(); if (!playing) c.suspend(); }, 700);
}
