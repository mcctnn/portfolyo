import { useEffect, useState } from "react";

/** Kelimeleri sırayla yazıp silen efekt. */
export function useTypewriter(words) {
  const [text, setText] = useState("");
  const key = words.join("|");

  useEffect(() => {
    if (!words.length) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setText(words[0]);
      return;
    }
    let w = 0, i = 0, del = false, timer;
    const tick = () => {
      const word = words[w];
      setText(word.slice(0, i));
      let delay = del ? 35 : 80;
      if (!del && i === word.length) { del = true; delay = 1700; }
      else if (del && i === 0) { del = false; w = (w + 1) % words.length; delay = 350; }
      else i += del ? -1 : 1;
      timer = setTimeout(tick, delay);
    };
    tick();
    return () => clearTimeout(timer);
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  return text;
}
