import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { clamp, smooth } from "../lib/util";
import { cssVars, greetingFor, moonProgress, nowMinutes, orbit, sample, sunProgress } from "../lib/sky";

const reduceMotion = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Sahnenin saatini yönetir: gerçek saati izler, kaydırıcıyla elle değiştirilebilir.
 * Renkler CSS değişkenleri olarak <html> üzerine yazılır.
 */
export function useSky() {
  const [minutes, setMinutes] = useState(nowMinutes);
  const [lampManual, setLampManual] = useState(null);
  const live = useRef(true);
  const tweenId = useRef(0);
  const minutesRef = useRef(minutes);
  minutesRef.current = minutes;

  const norm = (m) => ((m % 1440) + 1440) % 1440;
  const h = norm(minutes) / 60;
  const palette = useMemo(() => sample(h), [h]);

  useLayoutEffect(() => {
    const st = document.documentElement.style;
    const vars = cssVars(palette);
    for (const k in vars) st.setProperty(k, vars[k]);
  }, [palette]);

  // Sahneden çıkınca (ör. /admin) inline değişkenleri temizle
  useLayoutEffect(() => () => {
    const st = document.documentElement.style;
    for (const k in cssVars(palette)) st.removeProperty(k);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const id = setInterval(() => { if (live.current) setMinutes(nowMinutes()); }, 20000);
    return () => clearInterval(id);
  }, []);

  const scrub = useCallback((m) => {
    live.current = false;
    tweenId.current++;
    setMinutes(m);
  }, []);

  const goNow = useCallback(() => {
    live.current = true;
    setLampManual(null);
    const id = ++tweenId.current;
    const from = minutesRef.current;
    const target = nowMinutes();
    let diff = target - from;
    if (diff > 720) diff -= 1440;
    if (diff < -720) diff += 1440;
    const t0 = performance.now();
    const dur = reduceMotion() ? 0 : 900;
    const step = (now) => {
      if (id !== tweenId.current) return;
      const t = dur ? clamp((now - t0) / dur, 0, 1) : 1;
      setMinutes(t < 1 ? from + diff * smooth(t) : target);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, []);

  const lampAuto = palette.dark > 0.45;
  const lampOn = lampManual ?? lampAuto;
  const toggleLamp = useCallback(() => setLampManual(!(lampManual ?? lampAuto)), [lampManual, lampAuto]);

  const m = norm(minutes);
  return {
    minutes: m,
    hour: h,
    hh: Math.floor(m / 60),
    mm: Math.floor(m % 60),
    greeting: greetingFor(h),
    dark: palette.dark,
    sleeping: palette.dark > 0.85,
    lampOn,
    toggleLamp,
    scrub,
    goNow,
    sun: orbit(sunProgress(h)),
    moon: orbit(moonProgress(h)),
    handH: (h % 12) * 30,
    handM: (m % 60) * 6,
  };
}
