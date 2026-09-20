import { useEffect, useRef } from "react";

/* Masadaki nesnelerin çizimleri (satır içi SVG). */

export const NotebookArt = () => (
  <svg viewBox="0 0 150 196" aria-hidden="true">
    <ellipse className="shadow" cx="76" cy="190" rx="62" ry="6" />
    <rect x="8" y="8" width="134" height="176" rx="10" fill="#ff6b4a" />
    <rect x="8" y="8" width="22" height="176" rx="10" fill="#e14f30" />
    <g fill="#fff3dc">
      {[34, 64, 94, 124, 154].map((y) => <circle key={y} cx="19" cy={y} r="4" />)}
    </g>
    <rect x="116" y="8" width="8" height="176" fill="#b73b22" opacity=".55" />
    <g transform="rotate(-3 82 80)">
      <rect x="40" y="48" width="74" height="64" rx="6" fill="#fff3dc" />
      <text x="77" y="86" className="hand" fontSize="27" textAnchor="middle" fill="#2b2233">hakkımda</text>
      <path d="M52 96 Q77 104 102 94" fill="none" stroke="#ff6b4a" strokeWidth="3" strokeLinecap="round" />
    </g>
    <path d="M92 140 l4 9 9 1 -7 6 2 9 -8 -5 -8 5 2 -9 -7 -6 9 -1z" fill="#ffc857" />
  </svg>
);

export const StickyArt = () => (
  <svg viewBox="0 0 132 132" aria-hidden="true">
    <ellipse className="shadow" cx="66" cy="124" rx="48" ry="5" />
    <g transform="rotate(9 76 66)"><rect x="42" y="12" width="78" height="78" fill="#ff9ecb" /></g>
    <g transform="rotate(-6 56 76)">
      <rect x="8" y="30" width="86" height="86" fill="#ffe27a" />
      <rect x="30" y="22" width="34" height="12" fill="rgba(255,255,255,.65)" />
      <text x="51" y="70" className="hand" fontSize="26" textAnchor="middle" fill="#2b2233">yetenek</text>
      <text x="51" y="94" className="hand" fontSize="26" textAnchor="middle" fill="#2b2233">listem ✦</text>
    </g>
  </svg>
);

const CODE_LINES = [
  [0, [[50, 34, 34, "#ff8fab"], [88, 34, 52, "#8be9fd"]]],
  [1, [[58, 46, 60, "#f1fa8c"], [122, 46, 30, "#bd93f9"]]],
  [2, [[58, 58, 44, "#50fa7b"], [106, 58, 58, "#8be9fd"]]],
  [3, [[66, 70, 70, "#ff8fab"]]],
  [4, [[58, 82, 38, "#f1fa8c"], [100, 82, 46, "#bd93f9"]]],
];

export const LaptopArt = () => (
  <svg viewBox="0 0 240 150" aria-hidden="true">
    <ellipse className="shadow" cx="120" cy="142" rx="112" ry="6" />
    <rect x="34" y="4" width="172" height="112" rx="9" fill="#2f2b45" />
    <rect x="42" y="12" width="156" height="96" rx="4" fill="#191727" />
    <circle cx="50" cy="20" r="2.4" fill="#ff6b6b" /><circle cx="58" cy="20" r="2.4" fill="#ffc857" /><circle cx="66" cy="20" r="2.4" fill="#4cd39b" />
    <g className="code">
      {CODE_LINES.map(([i, rects]) =>
        rects.map(([x, y, w, fill]) => (
          <rect key={`${i}-${x}`} style={{ "--i": i }} x={x} y={y} width={w} height="5" rx="2.5" fill={fill} />
        )))}
      <rect className="caret-svg" x="50" y="94" width="6" height="8" fill="#fff" />
    </g>
    <path d="M14 116H226L232 128Q233 136 224 136H16Q7 136 8 128Z" fill="#cfcbe0" />
    <rect x="100" y="116" width="40" height="6" rx="3" fill="#b3aecb" />
  </svg>
);

export const PolaroidArt = () => (
  <svg viewBox="0 0 130 164" aria-hidden="true">
    <ellipse className="shadow" cx="66" cy="158" rx="50" ry="5" />
    <rect x="6" y="6" width="118" height="146" rx="4" fill="#fffdf6" stroke="#e7dcc7" />
    <rect x="16" y="16" width="98" height="98" fill="#8fd3f4" />
    <circle cx="98" cy="34" r="10" fill="#ffd95a" />
    <path d="M16 114V88Q40 72 62 90T114 84V114Z" fill="#5ec48a" />
    <path d="M65 40L108 58 65 76 22 58Z" fill="#2b2233" />
    <path d="M42 68V88Q65 100 88 88V68L65 78Z" fill="#3d3654" />
    <path d="M104 60V86" stroke="#ffc857" strokeWidth="3" strokeLinecap="round" /><circle cx="104" cy="90" r="4.5" fill="#ffc857" />
    <text x="65" y="140" className="hand" fontSize="22" textAnchor="middle" fill="#2b2233">yolculuğum</text>
  </svg>
);

export const MugArt = () => (
  <svg viewBox="0 -24 124 154" aria-hidden="true">
    <ellipse className="shadow" cx="58" cy="122" rx="44" ry="6" />
    <g className="steam">
      <path d="M44 28C36 18 46 10 40 0" style={{ "--d": "0s" }} />
      <path d="M58 28C50 16 62 8 54 -4" style={{ "--d": ".9s" }} />
      <path d="M72 28C64 18 74 10 68 0" style={{ "--d": "1.8s" }} />
    </g>
    <path d="M92 54H100Q116 54 116 72Q116 90 96 90" fill="none" stroke="#4cc9a4" strokeWidth="9" strokeLinecap="round" />
    <path d="M18 40H94V88Q94 118 56 118Q18 118 18 88Z" fill="#4cc9a4" />
    <ellipse cx="56" cy="40" rx="38" ry="9" fill="#3aa886" />
    <ellipse cx="56" cy="41" rx="32" ry="6" fill="#5b3a29" />
    <text x="56" y="90" textAnchor="middle" fill="#fff" fontSize="26" fontFamily="Fredoka, sans-serif" fontWeight="600">{"{ }"}</text>
  </svg>
);

export const PhoneArt = () => (
  <svg viewBox="0 0 90 172" aria-hidden="true">
    <ellipse className="shadow" cx="46" cy="166" rx="34" ry="4" />
    <rect x="6" y="6" width="78" height="158" rx="14" fill="#2b2740" />
    <rect x="11" y="12" width="68" height="146" rx="10" fill="#6d5ae6" />
    <rect x="34" y="16" width="22" height="5" rx="2.5" fill="#2b2740" />
    <g className="bubble b1"><rect x="18" y="44" width="54" height="26" rx="8" fill="#fff" /><rect x="24" y="51" width="34" height="4" rx="2" fill="#c6bff5" /><rect x="24" y="59" width="22" height="4" rx="2" fill="#e2defa" /></g>
    <g className="bubble b2"><rect x="18" y="78" width="54" height="26" rx="8" fill="#ffe9a8" /><rect x="24" y="85" width="30" height="4" rx="2" fill="#e8c96a" /><rect x="24" y="93" width="38" height="4" rx="2" fill="#f3dc95" /></g>
    <circle cx="68" cy="44" r="8" fill="#ff6b4a" /><text x="68" y="48" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="800">1</text>
    <circle cx="45" cy="134" r="15" fill="#fff" /><text x="45" y="141" textAnchor="middle" fill="#6d5ae6" fontSize="20" fontWeight="800">@</text>
  </svg>
);

const EYE_SPOTS = [[64, 66], [96, 66]];

/** Kedi: gözleri imleci takip eder, geceleri uyur. */
export function CatArt({ sleeping }) {
  const svg = useRef(null);
  const last = useRef({ x: 0, y: 0, set: false });

  useEffect(() => {
    if (sleeping) return;
    const pupils = svg.current.querySelectorAll(".pupil");
    const look = () => {
      if (!last.current.set) return;
      const r = svg.current.getBoundingClientRect();
      pupils.forEach((p, i) => {
        const cx = r.left + (EYE_SPOTS[i][0] / 160) * r.width;
        const cy = r.top + (EYE_SPOTS[i][1] / 172) * r.height;
        const dx = last.current.x - cx, dy = last.current.y - cy;
        const d = Math.hypot(dx, dy) || 1;
        const k = Math.min(4, d / 40);
        p.setAttribute("transform", `translate(${((dx / d) * k).toFixed(2)} ${((dy / d) * k).toFixed(2)})`);
      });
    };
    let raf = 0;
    const onMove = (e) => {
      last.current = { x: e.clientX, y: e.clientY, set: true };
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; look(); });
    };
    addEventListener("pointermove", onMove);
    look();
    return () => { removeEventListener("pointermove", onMove); cancelAnimationFrame(raf); };
  }, [sleeping]);

  return (
    <svg viewBox="0 0 160 172" ref={svg} aria-hidden="true">
      <ellipse className="shadow" cx="80" cy="166" rx="56" ry="6" />
      <path className="tail" d="M118 152C156 152 160 112 140 100" fill="none" stroke="#f0a04b" strokeWidth="13" strokeLinecap="round" />
      <ellipse cx="80" cy="124" rx="46" ry="42" fill="#f4a94e" />
      <ellipse cx="80" cy="134" rx="26" ry="30" fill="#ffe2b8" />
      <ellipse cx="60" cy="162" rx="14" ry="8" fill="#ffe2b8" /><ellipse cx="100" cy="162" rx="14" ry="8" fill="#ffe2b8" />
      <path d="M46 48L42 12L72 33Z" fill="#f4a94e" /><path d="M50 42L48 24L63 34Z" fill="#ffb3b3" />
      <path d="M114 48L118 12L88 33Z" fill="#f4a94e" /><path d="M110 42L112 24L97 34Z" fill="#ffb3b3" />
      <ellipse cx="80" cy="66" rx="41" ry="35" fill="#f4a94e" />
      <path d="M70 36V46M80 34V46M90 36V46" stroke="#d9822b" strokeWidth="3" strokeLinecap="round" />
      <g className="awake">
        <ellipse className="eye-w" cx="64" cy="66" rx="9" ry="10.5" fill="#fff8e0" /><ellipse className="eye-w" cx="96" cy="66" rx="9" ry="10.5" fill="#fff8e0" />
        <circle className="pupil" cx="64" cy="66" r="5.2" fill="#2b2233" /><circle className="pupil" cx="96" cy="66" r="5.2" fill="#2b2233" />
      </g>
      <g className="asleep" fill="none" stroke="#2b2233" strokeWidth="3" strokeLinecap="round">
        <path d="M54 68Q64 76 74 68" /><path d="M86 68Q96 76 106 68" />
      </g>
      <path d="M76 78H84L80 83Z" fill="#ff7f8e" />
      <path d="M80 83Q75 90 69 86M80 83Q85 90 91 86" fill="none" stroke="#6b3b1f" strokeWidth="2" strokeLinecap="round" />
      <g stroke="#fff8ec" strokeWidth="1.8" strokeLinecap="round" opacity=".9">
        <path d="M52 80L28 76M52 85L28 90M108 80L132 76M108 85L132 90" />
      </g>
      <text className="zzz hand" x="118" y="30" fontSize="26" fill="#2b2233">z z z</text>
    </svg>
  );
}

export const LampArt = () => (
  <svg viewBox="0 0 160 250" aria-hidden="true">
    <ellipse className="shadow" cx="60" cy="243" rx="46" ry="6" />
    <path d="M18 240Q18 224 60 224Q102 224 102 240Z" fill="#4a4463" />
    <path d="M60 226L46 140L92 74" fill="none" stroke="#5a5378" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="46" cy="140" r="7" fill="#ffc857" />
    <g transform="rotate(-32 92 74)">
      <path d="M70 58Q92 44 114 58L128 104H56Z" fill="#ffc857" />
      <path d="M70 58Q92 44 114 58L118 72Q92 60 66 72Z" fill="#ffdc7e" />
      <ellipse className="bulb" cx="92" cy="104" rx="36" ry="7" fill="#fff4b8" />
    </g>
  </svg>
);

export const PlantArt = () => (
  <svg viewBox="0 0 110 172" aria-hidden="true">
    <ellipse className="shadow" cx="55" cy="167" rx="34" ry="4" />
    <g className="leaves">
      <ellipse cx="55" cy="62" rx="12" ry="42" fill="#2f8f5b" transform="rotate(-42 55 108)" />
      <ellipse cx="55" cy="58" rx="13" ry="46" fill="#3fa66b" transform="rotate(-18 55 108)" />
      <ellipse cx="55" cy="54" rx="13" ry="50" fill="#57bd7c" transform="rotate(4 55 108)" />
      <ellipse cx="55" cy="60" rx="13" ry="44" fill="#3fa66b" transform="rotate(24 55 108)" />
      <ellipse cx="55" cy="66" rx="12" ry="38" fill="#2f8f5b" transform="rotate(44 55 108)" />
    </g>
    <path d="M22 108H88L80 158Q79 165 72 165H38Q31 165 30 158Z" fill="#d9825b" />
    <rect x="18" y="102" width="74" height="12" rx="4" fill="#c46f49" />
  </svg>
);
