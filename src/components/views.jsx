import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { safeHref } from "../lib/util";
import { renderMarkdown } from "../lib/markdown";
import { pickText } from "../i18n";

const COLORS = ["#ff6b4a", "#4cc9a4", "#ffc857", "#8fb8ff", "#ff9ecb"];
const NOTE_COLORS = ["#ffe27a", "#ff9ecb", "#9fe3c8", "#b9d4ff", "#ffc9a3"];

const Empty = ({ children }) => <p className="empty">{children}</p>;

function AboutView({ content: { profile, facts }, t }) {
  return (
    <>
      <h2>{t.titles.about}</h2>
      {profile.aboutLead && <p className="lead">{profile.aboutLead}</p>}
      {profile.aboutBody.map((p, i) => <p key={i}>{p}</p>)}
      {facts.length > 0 && (
        <ul className="facts">
          {facts.map((f) => <li key={f.id}><span>{f.icon}</span>{f.text}</li>)}
        </ul>
      )}
      {profile.aboutNow && <p className="now"><b>{t.now_label}</b> {profile.aboutNow}</p>}
    </>
  );
}

function ProjectsView({ content: { projects }, t }) {
  return (
    <>
      <h2>{t.titles.projects}</h2>
      <p className="prompt"><span>{t.projectsPrompt}</span> $ ls -la</p>
      {projects.length === 0 ? <Empty>{t.empty}</Empty> : (
        <div className="cards">
          {projects.map((p, i) => {
            const demo = safeHref(p.demoUrl), code = safeHref(p.codeUrl);
            return (
              <article className="card" key={p.id} style={{ "--c": COLORS[i % COLORS.length] }}>
                <div className="emoji">{p.emoji}</div>
                <h3>{p.title}</h3>
                <p>{p.description}</p>
                {p.tags.length > 0 && <div className="chips">{p.tags.map((tag) => <span className="chip" key={tag}>{tag}</span>)}</div>}
                <div className="links">
                  {demo ? <a href={demo} target="_blank" rel="noopener noreferrer">{t.demo} ↗</a> : <span className="soon">{t.demo} · {t.soon}</span>}
                  {code ? <a href={code} target="_blank" rel="noopener noreferrer">{t.code} ↗</a> : <span className="soon">{t.code} · {t.soon}</span>}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}

function SkillsView({ content: { skills }, t }) {
  let n = 0;
  return (
    <>
      <h2>{t.titles.skills}</h2>
      {skills.length === 0 ? <Empty>{t.empty}</Empty> : skills.map((g) => (
        <div className="group" key={g.id}>
          <h3>{g.name}</h3>
          <div className="notes">
            {g.items.map((it) => {
              const i = n++;
              return <span className="note" key={it} style={{ "--n": NOTE_COLORS[i % NOTE_COLORS.length], "--rot": `${((i * 37) % 7) - 3}deg` }}>{it}</span>;
            })}
          </div>
        </div>
      ))}
    </>
  );
}

function JourneyView({ content: { journey }, t }) {
  return (
    <>
      <h2>{t.titles.journey}</h2>
      {journey.length === 0 ? <Empty>{t.empty}</Empty> : (
        <ol className="tl">
          {journey.map((j) => <li key={j.id}><small>{j.when}</small><h3>{j.title}</h3><p>{j.body}</p></li>)}
        </ol>
      )}
    </>
  );
}

/* ---------- İletişim + form ---------- */

function ContactForm({ t, lang }) {
  const f = t.form;
  const [state, setState] = useState({ status: "idle", error: "" });
  const [values, setValues] = useState({ name: "", email: "", body: "", website: "" });
  const opened = useRef(Date.now());
  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const name = values.name.trim(), email = values.email.trim(), body = values.body.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setState({ status: "idle", error: f.invalidEmail });
    if (body.length < 5) return setState({ status: "idle", error: f.tooShort });

    // Bot önlemi: gizli alan doluysa ya da form 2 saniyeden kısa sürede gönderildiyse sessizce başarılı say
    if (values.website || Date.now() - opened.current < 2000) return setState({ status: "sent", error: "" });
    if (!supabase) return setState({ status: "idle", error: f.offline });

    setState({ status: "sending", error: "" });
    const { error } = await supabase.from("messages").insert({ name, email, body, lang });
    if (!error) {
      setValues({ name: "", email: "", body: "", website: "" });
      return setState({ status: "sent", error: "" });
    }
    setState({ status: "idle", error: error.message?.includes("too_many_messages") ? f.tooMany : f.error });
  };

  if (state.status === "sent") {
    return (
      <div className="form-done" role="status">
        <p>{f.sent}</p>
        <button className="btn ghost small" type="button" onClick={() => { opened.current = Date.now(); setState({ status: "idle", error: "" }); }}>{f.again}</button>
      </div>
    );
  }

  const busy = state.status === "sending";
  return (
    <form className="contact-form" onSubmit={submit} noValidate>
      <h3>{f.title}</h3>
      <div className="row2">
        <label>{f.name}
          <input type="text" required maxLength={100} autoComplete="name" value={values.name} onChange={set("name")} />
        </label>
        <label>{f.email}
          <input type="email" required maxLength={200} autoComplete="email" value={values.email} onChange={set("email")} />
        </label>
      </div>
      <label>{f.message}
        <textarea required rows={5} maxLength={4000} value={values.body} onChange={set("body")} />
      </label>
      {/* bot tuzağı: insanlar görmez */}
      <label className="hp" aria-hidden="true">Website
        <input type="text" tabIndex={-1} autoComplete="off" value={values.website} onChange={set("website")} />
      </label>
      {state.error && <p className="form-error" role="alert">{state.error}</p>}
      <button className="btn primary" type="submit" disabled={busy}>{busy ? f.sending : f.send}</button>
    </form>
  );
}

function ContactView({ content: { profile, links }, t, lang }) {
  const usable = links.filter((l) => safeHref(l.href));
  return (
    <>
      <h2>{t.titles.contact}</h2>
      {profile.contactLead && <p className="lead">{profile.contactLead}</p>}
      {usable.length === 0 ? <Empty>{t.emptyLinks}</Empty> : (
        <div className="contact-list">
          {usable.map((l) => (
            <a key={l.id} href={safeHref(l.href)} target="_blank" rel="noopener noreferrer">
              <span className="ic">{l.icon}</span>
              <span><b>{l.label}</b><small>{l.hint}</small></span>
              <span className="go">→</span>
            </a>
          ))}
        </div>
      )}
      <ContactForm t={t} lang={lang} />
    </>
  );
}

/* ---------- Yazılar ---------- */

function PostsView({ t, lang, to, slug }) {
  const [state, setState] = useState({ status: "loading", posts: [] });

  useEffect(() => {
    if (!supabase) { setState({ status: "ready", posts: [] }); return; }
    let alive = true;
    supabase.from("posts").select("*").eq("published", true).order("published_at", { ascending: false })
      .then(({ data, error }) => { if (alive) setState(error ? { status: "error", posts: [] } : { status: "ready", posts: data }); });
    return () => { alive = false; };
  }, []);

  const post = slug ? state.posts.find((p) => p.slug === slug) : null;
  const title = post ? pickText(lang, post.title, post.title_en) : "";

  useEffect(() => {
    if (post) document.title = `${title} — ${t.titles.posts}`;
  }, [post, title, t]);

  const date = (p) => new Date(p.published_at).toLocaleDateString(t.dateLocale, { day: "numeric", month: "long", year: "numeric" });

  if (state.status === "loading") return <><h2>{t.titles.posts}</h2><p className="muted">{t.posts.loading}</p></>;
  if (state.status === "error") return <><h2>{t.titles.posts}</h2><Empty>{t.posts.error}</Empty></>;

  if (slug) {
    if (!post) {
      return <><Link className="back" to={to("posts")}>{t.posts.back}</Link><Empty>{t.posts.notFound}</Empty></>;
    }
    const hasEn = !!(post.body_en || post.title_en);
    return (
      <article className="post">
        <Link className="back" to={to("posts")}>{t.posts.back}</Link>
        <h2>{post.emoji} {title}</h2>
        <p className="meta">{date(post)}{lang === "en" && !hasEn ? ` · ${t.posts.trOnly}` : ""}</p>
        <div className="prose">{renderMarkdown(pickText(lang, post.body, post.body_en))}</div>
      </article>
    );
  }

  return (
    <>
      <h2>{t.titles.posts}</h2>
      {state.posts.length === 0 ? <Empty>{t.posts.empty}</Empty> : (
        <div className="post-list">
          {state.posts.map((p) => (
            <Link className="post-card" key={p.id} to={to("posts", p.slug)}>
              <span className="emoji">{p.emoji}</span>
              <span>
                <b>{pickText(lang, p.title, p.title_en)}</b>
                <small>{date(p)}</small>
                <span className="excerpt">{pickText(lang, p.excerpt, p.excerpt_en)}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

export const VIEWS = {
  about: { theme: "paper", View: AboutView },
  projects: { theme: "dark", View: ProjectsView },
  skills: { theme: "paper", View: SkillsView },
  journey: { theme: "paper", View: JourneyView },
  posts: { theme: "paper", View: PostsView },
  contact: { theme: "paper", View: ContactView },
};
