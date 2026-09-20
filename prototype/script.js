(() => {
  "use strict";

  const S = window.SITE;
  const root = document.documentElement;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isNarrow = () => matchMedia("(max-width: 760px)").matches;

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (t) => t * t * (3 - 2 * t);
  const pad = (n) => String(n).padStart(2, "0");
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const scene = $("#scene");
  const glow = $("#glow");

  /* ------------------------------------------------------------
     1) Günün saati → renkler, güneş/ay, saat, lamba, kedi
     ------------------------------------------------------------ */
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const rgb = (c) => `rgb(${c.map((v) => Math.round(v)).join(",")})`;
  const mix = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));
  const luminance = ([r, g, b]) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

  const P = (skyTop, skyBot, wall, wallDeep, desk, deskDark, dark) => ({
    skyTop: hex(skyTop), skyBot: hex(skyBot), wall: hex(wall), wallDeep: hex(wallDeep),
    desk: hex(desk), deskDark: hex(deskDark), dark,
  });
  const NIGHT = P("#0b1030", "#2a2f6b", "#2c2a4d", "#1f1e3a", "#5b3f33", "#47312a", 1);
  const DAWN = P("#6c6fb5", "#ffb48a", "#eccbb2", "#dcae94", "#a9714a", "#8f5b3a", 0.3);
  const MORNING = P("#7cc4f2", "#d8f0ff", "#f8e8d2", "#eed5b6", "#b98255", "#9a6a42", 0);
  const NOON = P("#4fb0ee", "#cdeeff", "#fbeed8", "#f1ddbf", "#bd8659", "#9e6d45", 0);
  const GOLD = P("#f39a6b", "#ffe0a3", "#f6d6b3", "#e7ba93", "#b47b4b", "#966238", 0.12);
  const DUSK = P("#3b3a8a", "#f0708a", "#6f506e", "#523a58", "#7d5238", "#65422d", 0.7);
  const KEYFRAMES = [[0, NIGHT], [5, NIGHT], [6.2, DAWN], [9, MORNING], [13, NOON], [17.5, GOLD], [19.5, DUSK], [21.5, NIGHT], [24, NIGHT]];

  function sample(h) {
    let i = 0;
    while (i < KEYFRAMES.length - 2 && h >= KEYFRAMES[i + 1][0]) i++;
    const [h0, a] = KEYFRAMES[i];
    const [h1, b] = KEYFRAMES[i + 1];
    const t = smooth(clamp((h - h0) / (h1 - h0), 0, 1));
    const out = {};
    for (const k in a) out[k] = Array.isArray(a[k]) ? mix(a[k], b[k], t) : lerp(a[k], b[k], t);
    return out;
  }

  const sun = $("#sun"), moon = $("#moon");
  const handH = $("#handH"), handM = $("#handM");
  const timeInput = $("#time"), timeOut = $("#timeOut"), greetEl = $("#greet");
  const catEl = $("#cat");

  let sceneMin = 720;
  let lampManual = null;
  let lampAuto = false;
  let lastGreet = "";

  const greetingFor = (h) =>
    h >= 5 && h < 11 ? "Günaydın ☀️" : h >= 11 && h < 17 ? "Merhaba 👋" : h >= 17 && h < 22 ? "İyi akşamlar 🌆" : "Hâlâ uyanık mısın? 🌙";

  function orbit(el, p, fadeEdge) {
    const visible = p > -0.02 && p < 1.02;
    el.style.opacity = visible ? clamp(Math.min(p, 1 - p) * fadeEdge, 0, 1) : 0;
    el.style.left = `${12 + 76 * clamp(p, 0, 1)}%`;
    el.style.top = `${80 - Math.sin(Math.PI * clamp(p, 0, 1)) * 58}%`;
  }

  function applyTime(minutes) {
    sceneMin = ((minutes % 1440) + 1440) % 1440;
    const h = sceneMin / 60;
    const c = sample(h);
    const st = root.style;

    st.setProperty("--sky-top", rgb(c.skyTop));
    st.setProperty("--sky-bot", rgb(c.skyBot));
    st.setProperty("--wall", rgb(c.wall));
    st.setProperty("--wall-deep", rgb(c.wallDeep));
    st.setProperty("--desk", rgb(c.desk));
    st.setProperty("--desk-dark", rgb(c.deskDark));
    st.setProperty("--dark", c.dark.toFixed(3));

    // Duvar açıksa koyu, karanlıksa açık yazı rengi
    const t = smooth(clamp((luminance(c.wall) - 0.5) / 0.16, 0, 1));
    st.setProperty("--ink", rgb(mix(hex("#f4eeff"), hex("#2b2233"), t)));
    st.setProperty("--ink-soft", rgb(mix(hex("#cdc3e6"), hex("#6a5b6e"), t)));

    // Güneş 06:00–19:30, ay 19:00–07:00 arası gökyüzünde
    orbit(sun, (h - 6) / 13.5, 8);
    orbit(moon, h >= 19 ? (h - 19) / 12 : h < 7 ? (h + 5) / 12 : -1, 8);

    handH.setAttribute("transform", `rotate(${(h % 12) * 30} 50 50)`);
    handM.setAttribute("transform", `rotate(${(sceneMin % 60) * 6} 50 50)`);

    const hh = Math.floor(sceneMin / 60), mm = Math.floor(sceneMin % 60);
    timeOut.textContent = `${pad(hh)}:${pad(mm)}`;
    timeInput.value = Math.floor(sceneMin);

    const g = greetingFor(h);
    if (g !== lastGreet) { greetEl.textContent = g; lastGreet = g; }

    lampAuto = c.dark > 0.45;
    syncLamp();
    setSleeping(c.dark > 0.85);
  }

  function syncLamp() {
    document.body.classList.toggle("lamp-on", lampManual ?? lampAuto);
  }

  const nowMinutes = () => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
  };

  let live = true;
  let tweenId = 0;
  function tweenTo(target) {
    const id = ++tweenId;
    const from = sceneMin;
    let diff = target - from;
    if (diff > 720) diff -= 1440;
    if (diff < -720) diff += 1440;
    const t0 = performance.now();
    const dur = reduceMotion ? 0 : 900;
    (function step(now) {
      if (id !== tweenId) return;
      const t = dur ? clamp((now - t0) / dur, 0, 1) : 1;
      applyTime(from + diff * smooth(t));
      if (t < 1) requestAnimationFrame(step);
    })(t0);
  }

  timeInput.addEventListener("input", () => {
    live = false;
    tweenId++;
    applyTime(+timeInput.value);
  });
  $("#nowBtn").addEventListener("click", () => {
    live = true;
    lampManual = null;
    tweenTo(nowMinutes());
  });
  setInterval(() => { if (live) applyTime(nowMinutes()); }, 20000);

  /* ------------------------------------------------------------
     2) Dekor: yıldızlar, ışık zinciri
     ------------------------------------------------------------ */
  const sky = $("#sky");
  for (let i = 0; i < 46; i++) {
    const s = document.createElement("i");
    s.className = "star";
    const size = 1 + Math.random() * 2;
    s.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 62}%;--s:${size}px;--o:${(0.5 + Math.random() * 0.5).toFixed(2)};--dl:${(Math.random() * 3).toFixed(2)}s`;
    sky.prepend(s);
  }

  (function fairyLights() {
    const box = $("#lights"), wire = $("#wire");
    const colors = ["#ff6b4a", "#ffc857", "#4cc9a4", "#ff9ecb", "#8fb8ff"];
    const swags = 4, perSwag = 6, sag = 26, base = 10;
    const y = (x) => base + sag * Math.sin(Math.PI * ((x * swags) % 1));
    let d = "";
    for (let x = 0; x <= 1.0001; x += 0.005) d += `${d ? "L" : "M"}${(x * 100).toFixed(2)} ${y(x).toFixed(2)}`;
    wire.setAttribute("d", d);
    const n = swags * perSwag;
    for (let i = 0; i < n; i++) {
      const x = ((Math.floor(i / perSwag) + ((i % perSwag) + 0.5) / perSwag) / swags);
      const b = document.createElement("i");
      b.className = "bulb-l";
      b.style.cssText = `left:${(x * 100).toFixed(2)}%;top:${(y(x) / 60) * 64 + 2}px;--c:${colors[i % colors.length]};--dl:${(i * 0.37).toFixed(2)}s`;
      box.appendChild(b);
    }
  })();

  /* ------------------------------------------------------------
     3) Yazılıyor efekti + içerik
     ------------------------------------------------------------ */
  $("#intro").textContent = S.intro;
  $("#logoName").textContent = S.name.toLowerCase();
  document.title = `${S.name} — Masamdan Merhaba`;
  $(".hero .name").textContent = S.name;

  (function typewriter(el, words) {
    if (reduceMotion) { el.textContent = words[0]; return; }
    let w = 0, i = 0, del = false;
    (function tick() {
      const word = words[w];
      el.textContent = word.slice(0, i);
      let delay = del ? 35 : 80;
      if (!del && i === word.length) { del = true; delay = 1700; }
      else if (del && i === 0) { del = false; w = (w + 1) % words.length; delay = 350; }
      else i += del ? -1 : 1;
      setTimeout(tick, delay);
    })();
  })($("#typed"), S.words);

  /* ------------------------------------------------------------
     4) Pencereler (modal)
     ------------------------------------------------------------ */
  const modal = $("#modal"), modalBody = $("#modalBody"), modalTitle = $("#modalTitle");
  const COLORS = ["#ff6b4a", "#4cc9a4", "#ffc857", "#8fb8ff", "#ff9ecb"];
  const NOTE_COLORS = ["#ffe27a", "#ff9ecb", "#9fe3c8", "#b9d4ff", "#ffc9a3"];

  const views = {
    about: {
      title: "hakkimda.txt", theme: "paper",
      html: () => {
        const a = S.about;
        return `<h2>Hakkımda</h2>
          <p class="lead">${esc(a.lead)}</p>
          ${a.body.map((p) => `<p>${esc(p)}</p>`).join("")}
          <ul class="facts">${a.facts.map((f) => `<li><span>${f.icon}</span>${esc(f.text)}</li>`).join("")}</ul>
          <p class="now"><b>Şu an:</b> ${esc(a.now)}</p>`;
      },
    },
    projects: {
      title: "projeler — terminal", theme: "dark",
      html: () => `<h2>Projelerim</h2>
        <p class="prompt"><span>~/projeler</span> $ ls -la</p>
        <div class="cards">${S.projects.map((p, i) => `
          <article class="card" style="--c:${COLORS[i % COLORS.length]}">
            <div class="emoji">${p.emoji}</div>
            <h3>${esc(p.title)}</h3>
            <p>${esc(p.desc)}</p>
            <div class="chips">${p.tags.map((t) => `<span class="chip">${esc(t)}</span>`).join("")}</div>
            <div class="links">${p.links.map((l) => l.href === "#"
              ? `<span class="soon">${esc(l.label)} · yakında</span>`
              : `<a href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join("")}</div>
          </article>`).join("")}</div>`,
    },
    skills: {
      title: "yetenekler.md", theme: "paper",
      html: () => {
        let n = 0;
        return `<h2>Yeteneklerim</h2>` + S.skills.map((g) => `
          <div class="group"><h3>${esc(g.group)}</h3>
            <div class="notes">${g.items.map((it) => {
              const rot = ((n * 37) % 7) - 3;
              return `<span class="note" style="--n:${NOTE_COLORS[n++ % NOTE_COLORS.length]};--rot:${rot}deg">${esc(it)}</span>`;
            }).join("")}</div>
          </div>`).join("");
      },
    },
    journey: {
      title: "yolculuk.jpg", theme: "paper",
      html: () => `<h2>Yolculuğum</h2>
        <ol class="tl">${S.journey.map((j) => `
          <li><small>${esc(j.when)}</small><h3>${esc(j.title)}</h3><p>${esc(j.text)}</p></li>`).join("")}</ol>`,
    },
    contact: {
      title: "mesajlar", theme: "paper",
      html: () => `<h2>Bana yaz</h2>
        <p class="lead">${esc(S.contact.lead)}</p>
        <div class="contact-list">${S.contact.links.map((l) => `
          <a href="${esc(l.href)}" target="_blank" rel="noopener">
            <span class="ic">${l.icon}</span><span><b>${esc(l.label)}</b><small>${esc(l.hint)}</small></span><span class="go">→</span>
          </a>`).join("")}</div>`,
    },
  };

  function openView(key) {
    const v = views[key];
    if (!v) return;
    modal.dataset.theme = v.theme;
    modalTitle.textContent = v.title;
    modalBody.innerHTML = v.html();
    modalBody.scrollTop = 0;
    document.body.classList.add("modal-open");
    modal.showModal();
  }
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });
  $("[data-close]").addEventListener("click", () => modal.close());
  modal.addEventListener("close", () => document.body.classList.remove("modal-open"));
  $$(".cta[data-open]").forEach((b) => b.addEventListener("click", () => openView(b.dataset.open)));

  /* ------------------------------------------------------------
     5) Küçük sürprizler: kahve, kedi, lamba, bitki
     ------------------------------------------------------------ */
  const toastEl = $("#toast");
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2600);
  }

  let coffees = 0;
  let sleeping = false;
  function setSleeping(v) {
    if (v === sleeping) return;
    sleeping = v;
    catEl.classList.toggle("sleep", v);
    if (!v) lookAt(lastPointer.x, lastPointer.y);
  }

  const actions = {
    coffee() {
      const lines = S.coffeeLines;
      toast(lines[Math.min(coffees, lines.length - 1)]);
      coffees++;
      const mug = $("#mug");
      mug.classList.add("hot");
      setTimeout(() => mug.classList.remove("hot"), 1600);
    },
    cat() {
      toast(sleeping ? "Zzz… uyandırma beni 😴" : pick(S.catLines));
    },
    lamp() {
      lampManual = !(lampManual ?? lampAuto);
      toast(lampManual ? "Lamba açıldı 💡" : "Lamba kapandı");
      syncLamp();
    },
    plant() {
      const p = $("#plant");
      p.classList.remove("wiggle");
      void p.offsetWidth;
      p.classList.add("wiggle");
      toast("Suladın! 🌱 Teşekkür ederim.");
    },
  };

  /* Kedinin gözleri imleci takip eder */
  const pupils = $$(".pupil", catEl);
  const catSvg = $("#catSvg");
  const eyeSpots = [[64, 66], [96, 66]];
  const lastPointer = { x: innerWidth / 2, y: innerHeight / 2 };
  function lookAt(x, y) {
    if (sleeping) return;
    const r = catSvg.getBoundingClientRect();
    pupils.forEach((p, i) => {
      const cx = r.left + (eyeSpots[i][0] / 160) * r.width;
      const cy = r.top + (eyeSpots[i][1] / 172) * r.height;
      const dx = x - cx, dy = y - cy;
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(4, d / 40);
      p.setAttribute("transform", `translate(${((dx / d) * k).toFixed(2)} ${((dy / d) * k).toFixed(2)})`);
    });
  }

  /* Pencere paralaksı */
  let raf = 0;
  addEventListener("pointermove", (e) => {
    lastPointer.x = e.clientX; lastPointer.y = e.clientY;
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      lookAt(lastPointer.x, lastPointer.y);
      if (!reduceMotion && !isNarrow()) {
        scene.style.setProperty("--px", ((lastPointer.x / innerWidth) * 2 - 1).toFixed(3));
        scene.style.setProperty("--py", ((lastPointer.y / innerHeight) * 2 - 1).toFixed(3));
      }
    });
  });

  /* ------------------------------------------------------------
     6) Masadaki nesneler: sürükle-bırak + tıkla
     ------------------------------------------------------------ */
  const lamp = $("#lamp");
  function placeGlow() {
    const sr = scene.getBoundingClientRect(), r = lamp.getBoundingClientRect();
    glow.style.left = `${r.left - sr.left + r.width * 0.68}px`;
    glow.style.top = `${r.top - sr.top + r.height * 0.42}px`;
  }
  addEventListener("resize", placeGlow);

  let zTop = 40;
  $$(".item").forEach((el) => {
    let pid = null, sx = 0, sy = 0, ox = 0, oy = 0, dragging = false, justDragged = false;

    el.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || isNarrow()) return;
      pid = e.pointerId;
      sx = e.clientX; sy = e.clientY;
      ox = parseFloat(el.style.getPropertyValue("--dx")) || 0;
      oy = parseFloat(el.style.getPropertyValue("--dy")) || 0;
      dragging = false;
      el.classList.remove("tidy");
      el.setPointerCapture(pid);
    });

    el.addEventListener("pointermove", (e) => {
      if (e.pointerId !== pid) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (!dragging) {
        if (Math.hypot(dx, dy) < 6) return;
        dragging = true;
        el.classList.add("dragging");
        el.style.zIndex = ++zTop > 90 ? (zTop = 41) : zTop;
      }
      let nx = ox + dx, ny = oy + dy;

      // Nesnenin merkezi sahnenin dışına çıkmasın
      const cur = { x: parseFloat(el.style.getPropertyValue("--dx")) || 0, y: parseFloat(el.style.getPropertyValue("--dy")) || 0 };
      const r = el.getBoundingClientRect(), sr = scene.getBoundingClientRect();
      const cx = r.left + r.width / 2 + (nx - cur.x), cy = r.top + r.height / 2 + (ny - cur.y);
      nx += clamp(cx, sr.left + 30, sr.right - 30) - cx;
      ny += clamp(cy, sr.top + 60, sr.bottom - 30) - cy;

      el.style.setProperty("--dx", `${nx}px`);
      el.style.setProperty("--dy", `${ny}px`);
      if (el === lamp) placeGlow();
    });

    const end = (e) => {
      if (e.pointerId !== pid) return;
      pid = null;
      if (dragging) {
        el.classList.remove("dragging");
        justDragged = true;
        setTimeout(() => (justDragged = false), 0);
      }
    };
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);

    el.addEventListener("click", () => {
      if (justDragged) return;
      const { open, action } = el.dataset;
      if (open) openView(open);
      else if (action) actions[action]?.();
    });
  });

  $("#tidyBtn").addEventListener("click", () => {
    $$(".item").forEach((el) => {
      el.classList.add("tidy");
      el.style.removeProperty("--dx");
      el.style.removeProperty("--dy");
      setTimeout(() => el.classList.remove("tidy"), 700);
    });
    const t0 = performance.now();
    (function follow(now) { placeGlow(); if (now - t0 < 700) requestAnimationFrame(follow); })(t0);
    toast("Masa toplandı ✨ (ama yine dağıtırsın)");
  });

  /* ------------------------------------------------------------
     Başlat
     ------------------------------------------------------------ */
  applyTime(nowMinutes());
  placeGlow();
  if (document.fonts?.ready) document.fonts.ready.then(placeGlow);
  addEventListener("load", placeGlow);

  console.log("%cMerhaba meraklı geliştirici! 👋", "font:700 16px sans-serif;color:#ff6b4a");
  console.log("Kaynak kodu okumaya geldiysen: içerik dosyası content.js, gerisi bu dosyada.");
})();
