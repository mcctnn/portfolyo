import { safeHref } from "../lib/util";

const COLORS = ["#ff6b4a", "#4cc9a4", "#ffc857", "#8fb8ff", "#ff9ecb"];
const NOTE_COLORS = ["#ffe27a", "#ff9ecb", "#9fe3c8", "#b9d4ff", "#ffc9a3"];

const Empty = ({ children = "Burası henüz boş, yakında dolacak." }) => <p className="empty">{children}</p>;

function AboutView({ content: { profile, facts } }) {
  return (
    <>
      <h2>Hakkımda</h2>
      {profile.aboutLead && <p className="lead">{profile.aboutLead}</p>}
      {profile.aboutBody.map((p, i) => <p key={i}>{p}</p>)}
      {facts.length > 0 && (
        <ul className="facts">
          {facts.map((f) => <li key={f.id}><span>{f.icon}</span>{f.text}</li>)}
        </ul>
      )}
      {profile.aboutNow && <p className="now"><b>Şu an:</b> {profile.aboutNow}</p>}
    </>
  );
}

function ProjectsView({ content: { projects } }) {
  return (
    <>
      <h2>Projelerim</h2>
      <p className="prompt"><span>~/projeler</span> $ ls -la</p>
      {projects.length === 0 ? <Empty /> : (
        <div className="cards">
          {projects.map((p, i) => {
            const demo = safeHref(p.demoUrl), code = safeHref(p.codeUrl);
            return (
              <article className="card" key={p.id} style={{ "--c": COLORS[i % COLORS.length] }}>
                <div className="emoji">{p.emoji}</div>
                <h3>{p.title}</h3>
                <p>{p.description}</p>
                {p.tags.length > 0 && <div className="chips">{p.tags.map((t) => <span className="chip" key={t}>{t}</span>)}</div>}
                <div className="links">
                  {demo ? <a href={demo} target="_blank" rel="noopener noreferrer">Demo ↗</a> : <span className="soon">Demo · yakında</span>}
                  {code ? <a href={code} target="_blank" rel="noopener noreferrer">Kod ↗</a> : <span className="soon">Kod · yakında</span>}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}

function SkillsView({ content: { skills } }) {
  let n = 0;
  return (
    <>
      <h2>Yeteneklerim</h2>
      {skills.length === 0 ? <Empty /> : skills.map((g) => (
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

function JourneyView({ content: { journey } }) {
  return (
    <>
      <h2>Yolculuğum</h2>
      {journey.length === 0 ? <Empty /> : (
        <ol className="tl">
          {journey.map((j) => <li key={j.id}><small>{j.when}</small><h3>{j.title}</h3><p>{j.body}</p></li>)}
        </ol>
      )}
    </>
  );
}

function ContactView({ content: { profile, links } }) {
  const usable = links.filter((l) => safeHref(l.href));
  return (
    <>
      <h2>Bana yaz</h2>
      {profile.contactLead && <p className="lead">{profile.contactLead}</p>}
      {usable.length === 0 ? <Empty>Bağlantılar yakında burada olacak.</Empty> : (
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
    </>
  );
}

export const VIEWS = {
  about: { file: "hakkimda.txt", theme: "paper", View: AboutView },
  projects: { file: "projeler — terminal", theme: "dark", View: ProjectsView },
  skills: { file: "yetenekler.md", theme: "paper", View: SkillsView },
  journey: { file: "yolculuk.jpg", theme: "paper", View: JourneyView },
  contact: { file: "mesajlar", theme: "paper", View: ContactView },
};
