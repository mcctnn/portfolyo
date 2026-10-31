import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useContent } from "../data/ContentContext";
import { useSky } from "../hooks/useSky";
import { useTypewriter } from "../hooks/useTypewriter";
import { pickLine } from "../lib/util";
import { fetchVisitCount, trackView } from "../lib/analytics";
import { isPlaying, startLofi, stopLofi } from "../lib/lofi";
import { SECTIONS, parsePath, pathFor, switchPath, useI18n } from "../i18n";
import { useToast } from "./Toast";
import DeskItem from "./DeskItem";
import {
  BlogArt, BooksArt, CatArt, CvArt, LampArt, LaptopArt, MugArt, NotebookArt, PhoneArt, PlantArt, PolaroidArt, RadioArt, StickyArt,
} from "./Art";

const CV_FILE = "Mehmet-Can-Cetin-CV.pdf";
const CV_URL = `${import.meta.env.BASE_URL}${CV_FILE}`;
const pad = (n) => String(n).padStart(2, "0");
// GitHub Pages klasör adreslerini sonunda "/" ile yayınlar; canonical ve alternatifler de öyle olsun
const slash = (p) => (p.endsWith("/") ? p : `${p}/`);

/* ---------- Duvar süsleri ---------- */

function FairyLights() {
  const { wire, bulbs } = useMemo(() => {
    const colors = ["#ff6b4a", "#ffc857", "#4cc9a4", "#ff9ecb", "#8fb8ff"];
    const swags = 4, perSwag = 6, sag = 26, base = 10;
    const y = (x) => base + sag * Math.sin(Math.PI * ((x * swags) % 1));
    let d = "";
    for (let x = 0; x <= 1.0001; x += 0.005) d += `${d ? "L" : "M"}${(x * 100).toFixed(2)} ${y(x).toFixed(2)}`;
    const list = [];
    for (let i = 0; i < swags * perSwag; i++) {
      const x = (Math.floor(i / perSwag) + ((i % perSwag) + 0.5) / perSwag) / swags;
      list.push({ i, left: `${(x * 100).toFixed(2)}%`, top: `${(y(x) / 60) * 64 + 2}px`, c: colors[i % colors.length], dl: `${(i * 0.37).toFixed(2)}s` });
    }
    return { wire: d, bulbs: list };
  }, []);

  return (
    <div className="lights" aria-hidden="true">
      <svg viewBox="0 0 100 60" preserveAspectRatio="none"><path d={wire} vectorEffect="non-scaling-stroke" /></svg>
      {bulbs.map((b) => <i key={b.i} className="bulb-l" style={{ left: b.left, top: b.top, "--c": b.c, "--dl": b.dl }} />)}
    </div>
  );
}

function WallClock({ handH, handM }) {
  return (
    <svg className="wallclock" viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="46" fill="#fff8ec" stroke="#2b2233" strokeWidth="5" />
      <path d="M50 10v6M50 84v6M10 50h6M84 50h6" stroke="#2b2233" strokeWidth="4" strokeLinecap="round" />
      <line x1="50" y1="50" x2="50" y2="28" stroke="#2b2233" strokeWidth="5" strokeLinecap="round" transform={`rotate(${handH} 50 50)`} />
      <line x1="50" y1="50" x2="50" y2="16" stroke="#2b2233" strokeWidth="3.5" strokeLinecap="round" transform={`rotate(${handM} 50 50)`} />
      <circle cx="50" cy="50" r="4" fill="#ff6b4a" />
    </svg>
  );
}

const SkyWindow = memo(function SkyWindow({ sun, moon }) {
  const stars = useMemo(() => Array.from({ length: 46 }, (_, i) => ({
    i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 62}%`,
    s: `${(1 + Math.random() * 2).toFixed(1)}px`,
    o: (0.5 + Math.random() * 0.5).toFixed(2),
    dl: `${(Math.random() * 3).toFixed(2)}s`,
  })), []);
  const lit = [[10, 40], [30, 32], [30, 42], [74, 28], [74, 40], [96, 38], [122, 34], [144, 42], [166, 30], [166, 42], [186, 40]];
  const towers = [[6, 34, 16], [26, 26, 14], [44, 38, 18], [70, 22, 15], [90, 32, 20], [118, 28, 14], [138, 36, 18], [162, 24, 16], [182, 34, 14]];

  return (
    <div className="window" aria-hidden="true">
      <div className="sky">
        {stars.map((s) => <i key={s.i} className="star" style={{ left: s.left, top: s.top, "--s": s.s, "--o": s.o, "--dl": s.dl }} />)}
        <i className="shoot" />
        <div className="sun" style={sun} />
        <div className="moon" style={moon} />
        <div className="cloud c1" />
        <div className="cloud c2" />
        <svg className="skyline" viewBox="0 0 200 60" preserveAspectRatio="none">
          <path d="M0 60V38Q20 22 42 36T86 34Q110 24 130 38T200 30V60Z" fill="rgba(40,30,80,.42)" />
          <g fill="rgba(30,22,64,.7)">
            {towers.map(([x, y, w]) => <rect key={x} x={x} y={y} width={w} height={60 - y} />)}
          </g>
          <g fill="#ffd76a" className="lit">
            {lit.map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width="3" height="3" />)}
          </g>
        </svg>
      </div>
      <i className="bar-v" /><i className="bar-h" />
      <div className="sill" />
    </div>
  );
});

/* ---------- Masa ---------- */

function Desk({ profile, sky, lampRef, placeGlow, resetSignal, onTidy, visits }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { t, to } = useI18n();
  const coffees = useRef(0);
  const [hot, setHot] = useState(false);
  const [wiggle, setWiggle] = useState(false);
  const [radioOn, setRadioOn] = useState(false);
  const common = { resetSignal };

  // Sahneden çıkınca (ör. /admin) müzik de dursun
  useEffect(() => () => stopLofi(), []);

  const actions = {
    coffee() {
      const lines = profile.coffeeLines;
      toast(lines[Math.min(coffees.current, lines.length - 1)]);
      coffees.current++;
      setHot(true);
      setTimeout(() => setHot(false), 1600);
    },
    cat() { toast(sky.sleeping ? t.toast.catSleeping : pickLine(profile.catLines)); },
    lamp() {
      toast(sky.lampOn ? t.toast.lampOff : t.toast.lampOn);
      sky.toggleLamp();
    },
    cv() {
      const a = document.createElement("a");
      a.href = CV_URL;
      a.download = CV_FILE;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast(t.toast.cv);
    },
    plant() {
      setWiggle(true);
      setTimeout(() => setWiggle(false), 800);
      toast(t.toast.plant);
    },
    radio() {
      if (isPlaying()) {
        stopLofi();
        setRadioOn(false);
        toast(t.toast.radioOff);
      } else {
        toast(t.toast.radioOn);
        startLofi().then(() => setRadioOn(isPlaying()));
      }
    },
    books() { toast(`📚 ${pickLine(profile.bookLines)}`); },
  };

  const item = (key) => ({ label: t.items[key].label, tag: t.items[key].tag });
  const go = (key) => () => navigate(to(key));

  return (
    <section className="desk" id="desk" aria-label={t.deskLabel}>
      <div className="desk-inner">
        <DeskItem {...common} open="about" {...item("about")} pos={{ x: "15%", y: "7%", w: 11, r: "-6deg", z: 14 }} onActivate={go("about")}>
          <NotebookArt />
        </DeskItem>
        <DeskItem {...common} open="skills" {...item("skills")} pos={{ x: "27.5%", y: "5%", w: 8.5, r: "-4deg", z: 15 }} onActivate={go("skills")}>
          <StickyArt />
        </DeskItem>
        <DeskItem {...common} open="projects" {...item("projects")} pos={{ x: "34%", y: "35%", w: 24, r: "0deg", z: 8 }} onActivate={go("projects")}>
          <LaptopArt />
        </DeskItem>
        <DeskItem {...common} action="cv" {...item("cv")} pos={{ x: "38.5%", y: "3%", w: 7.5, r: "3deg", z: 15 }} onActivate={actions.cv}>
          <CvArt />
        </DeskItem>
        <DeskItem {...common} open="journey" {...item("journey")} pos={{ x: "50.5%", y: "7%", w: 9.5, r: "7deg", z: 16 }} onActivate={go("journey")}>
          <PolaroidArt />
        </DeskItem>
        <DeskItem {...common} open="posts" {...item("posts")} pos={{ x: "61.5%", y: "3%", w: 8.5, r: "-5deg", z: 11 }} onActivate={go("posts")}>
          <BlogArt />
        </DeskItem>
        <DeskItem {...common} extra action="coffee" {...item("coffee")} inId="mug" inClass={hot ? "hot" : ""} pos={{ x: "62.5%", y: "46%", w: 7.5, r: "0deg", z: 12 }} onActivate={actions.coffee}>
          <MugArt />
        </DeskItem>
        <DeskItem {...common} open="contact" {...item("contact")} pos={{ x: "72.5%", y: "9%", w: 6, r: "12deg", z: 13 }} onActivate={go("contact")}>
          <PhoneArt />
        </DeskItem>
        <DeskItem {...common} extra id="cat" className={sky.sleeping ? "sleep" : ""} action="cat" {...item("cat")} pos={{ x: "83.5%", y: "29%", w: 12.5, r: "0deg", z: 9 }} onActivate={actions.cat}>
          <CatArt sleeping={sky.sleeping} />
        </DeskItem>
        <DeskItem {...common} extra action="books" {...item("books")} pos={{ x: "87.5%", y: "4%", w: 8.5, r: "2deg", z: 10 }} onActivate={actions.books}>
          <BooksArt />
        </DeskItem>
        <DeskItem {...common} extra id="lamp" elRef={lampRef} action="lamp" {...item("lamp")} pos={{ x: "2%", y: "47%", w: 10.5, r: "0deg", z: 6 }} onActivate={actions.lamp} onDrag={placeGlow}>
          <LampArt />
        </DeskItem>
        <DeskItem {...common} extra id="plant" className={wiggle ? "wiggle" : ""} action="plant" {...item("plant")} pos={{ x: "13.5%", y: "46%", w: 7.5, r: "0deg", z: 5 }} onActivate={actions.plant}>
          <PlantArt />
        </DeskItem>
        <DeskItem {...common} extra action="radio" {...item("radio")} pos={{ x: "25.5%", y: "41%", w: 7.5, r: "-3deg", z: 7 }} onActivate={actions.radio}>
          <RadioArt on={radioOn} />
        </DeskItem>
      </div>
      <span className="desk-note">{t.deskNote}{visits >= 25 ? ` · ${t.visits(visits)}` : ""}</span>
      <button className="tidy-btn" type="button" onClick={onTidy}>{t.tidy}</button>
    </section>
  );
}

/* ---------- Sayfa başlığı ve dil etiketleri ---------- */

function useHead(profileName) {
  const { pathname } = useLocation();
  const { lang, t } = useI18n();

  useEffect(() => {
    const { parts } = parsePath(pathname);
    const section = SECTIONS.find((s) => s.slug[lang] === parts[0]);
    // Tek bir yazı açıkken başlığı yazının kendisi belirler (PostsView)
    const isPost = section?.hasChild && parts[1];
    if (!isPost) document.title = section ? `${t.titles[section.key]} — ${profileName}` : `${profileName} — ${t.siteTitle}`;
    document.documentElement.lang = t.htmlLang;

    const base = location.origin + import.meta.env.BASE_URL.replace(/\/$/, "");
    document.head.querySelectorAll("link[data-i18n]").forEach((n) => n.remove());
    const add = (hreflang, href) => {
      const l = document.createElement("link");
      l.rel = "alternate";
      l.hreflang = hreflang;
      l.href = href;
      l.dataset.i18n = "1";
      document.head.appendChild(l);
    };
    add("tr", base + slash(switchPath(pathname, "tr")));
    add("en", base + slash(switchPath(pathname, "en")));
    add("x-default", base + slash(switchPath(pathname, "tr")));
    const canonical = document.querySelector("link[rel=canonical]");
    if (canonical) canonical.href = base + slash(pathname);
  }, [pathname, lang, t, profileName]);

  useEffect(() => () => {
    document.head.querySelectorAll("link[data-i18n]").forEach((n) => n.remove());
    document.documentElement.lang = "tr";
  }, []);
}

/* ---------- Sahne ---------- */

export default function Scene() {
  const sky = useSky();
  const { content } = useContent();
  const { profile } = content;
  const toast = useToast();
  const { pathname } = useLocation();
  const { lang, t, otherLang } = useI18n();

  const sceneRef = useRef(null);
  const lampRef = useRef(null);
  const glowRef = useRef(null);
  const [resetSignal, setResetSignal] = useState(0);
  const [visits, setVisits] = useState(0);
  const typed = useTypewriter(profile.words);

  useHead(profile.name);

  useEffect(() => { fetchVisitCount().then((n) => n && setVisits(n)); }, []);
  useEffect(() => { trackView(pathname); }, [pathname]);

  const placeGlow = useCallback(() => {
    const s = sceneRef.current, l = lampRef.current, g = glowRef.current;
    if (!s || !l || !g) return;
    const sr = s.getBoundingClientRect(), r = l.getBoundingClientRect();
    g.style.left = `${r.left - sr.left + r.width * 0.68}px`;
    g.style.top = `${r.top - sr.top + r.height * 0.42}px`;
  }, []);

  // Lambanın ışığı, lamba nerede olursa orada dursun
  useEffect(() => {
    placeGlow();
    const ro = new ResizeObserver(placeGlow);
    ro.observe(sceneRef.current);
    document.fonts?.ready.then(placeGlow);
    return () => ro.disconnect();
  }, [placeGlow]);

  // Fareyle hafif pencere paralaksı
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onMove = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (matchMedia("(max-width: 760px)").matches || !sceneRef.current) return;
        sceneRef.current.style.setProperty("--px", ((e.clientX / innerWidth) * 2 - 1).toFixed(3));
        sceneRef.current.style.setProperty("--py", ((e.clientY / innerHeight) * 2 - 1).toFixed(3));
      });
    };
    addEventListener("pointermove", onMove);
    return () => { removeEventListener("pointermove", onMove); cancelAnimationFrame(raf); };
  }, []);

  const tidy = () => {
    setResetSignal((n) => n + 1);
    const t0 = performance.now();
    const follow = (now) => { placeGlow(); if (now - t0 < 700) requestAnimationFrame(follow); };
    requestAnimationFrame(follow);
    toast(t.tidied);
  };

  const home = pathFor(lang);
  const to = (key) => pathFor(lang, key);

  return (
    <div className={`scene${sky.lampOn ? " lamp-on" : ""}`} id="scene" ref={sceneRef}>
      <header className="topbar">
        <Link className="logo" to={home} aria-label={t.logoAria}>
          <i>&lt;/&gt;</i><span>{profile.name.toLowerCase()}</span>
        </Link>
        <div className="topbar-right">
          <Link className="langbtn" to={switchPath(pathname, otherLang)} hrefLang={otherLang} lang={otherLang} title={t.langSwitch} aria-label={t.langSwitch}>
            {otherLang.toUpperCase()}
          </Link>
          <div className="timebox">
            <label htmlFor="time"><span aria-hidden="true">🕒</span> <output>{pad(sky.hh)}:{pad(sky.mm)}</output></label>
            <input
              id="time" type="range" min="0" max="1439" step="1"
              value={Math.floor(sky.minutes)}
              onChange={(e) => sky.scrub(+e.target.value)}
              aria-label={t.timeAria}
            />
            <button type="button" onClick={sky.goNow} title={t.nowTitle}>{t.now}</button>
          </div>
        </div>
      </header>

      <main className="wall">
        <FairyLights />
        <section className="hero">
          <p className="eyebrow">{t.greet[sky.greetingKey]}</p>
          <h1>
            {t.iAm} <span className="name">{profile.name}</span>{profile.role && <>,<br />{profile.role}.</>}
          </h1>
          <p className="typed-line">{t.building} <span className="typed">{typed}</span><span className="caret" aria-hidden="true" /></p>
          <p className="intro">{profile.intro}</p>
          <div className="ctas">
            <Link className="btn primary" to={to("projects")}>{t.ctaProjects}</Link>
            <Link className="btn ghost" to={to("contact")}>{t.ctaContact}</Link>
            <a className="btn ghost" href={CV_URL} download={CV_FILE}>{t.ctaCv}</a>
          </div>
          <p className="hint" aria-hidden="true">
            {t.hint}
            <svg viewBox="0 0 60 50" width="46" height="38"><path d="M8 4 C 40 2, 52 20, 30 44 M30 44 L28 30 M30 44 L42 38" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </p>
        </section>
        <WallClock handH={sky.handH} handM={sky.handM} />
        <SkyWindow sun={sky.sun} moon={sky.moon} />
      </main>

      <Desk profile={profile} sky={sky} lampRef={lampRef} placeGlow={placeGlow} resetSignal={resetSignal} onTidy={tidy} visits={visits} />
      <div className="glow" ref={glowRef} aria-hidden="true" />
      <Outlet />
    </div>
  );
}
