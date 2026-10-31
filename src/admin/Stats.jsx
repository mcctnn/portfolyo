import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const LANG_NAMES = { tr: "Türkçe", en: "İngilizce" };
const DAYS = 30;

/** Son 30 günün sayfa görüntülemeleri (çerezsiz, kişisel veri tutulmaz). */
export default function Stats() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.rpc("stats_summary", { days: DAYS }).then(({ data: d, error: err }) => {
      if (err) setError(err.message);
      else setData(d);
    });
  }, []);

  // Eksik günleri 0 ile doldur
  const series = (() => {
    if (!data) return [];
    const map = new Map(data.by_day.map((d) => [d.day, d.n]));
    const out = [];
    for (let i = DAYS - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 864e5);
      const key = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Istanbul" }).format(d); // YYYY-MM-DD
      out.push({ day: key, n: map.get(key) || 0 });
    }
    return out;
  })();
  const max = Math.max(1, ...series.map((s) => s.n));
  const last7 = series.slice(-7).reduce((a, s) => a + s.n, 0);

  return (
    <section>
      <div className="section-head">
        <div>
          <h2>İstatistik</h2>
          <p className="muted">Son {DAYS} gün. Yalnızca sayfa adresi ve dil sayılır; IP, çerez veya kimlik tutulmaz. Giriş yapmışken ve localhost'ta yaptığın ziyaretler sayılmaz, aynı sekmede aynı sayfa bir kez sayılır.</p>
        </div>
      </div>
      {error && <p className="alert" role="alert">Hata: {error}</p>}
      {!data && !error && <p className="muted">Yükleniyor…</p>}
      {data && (
        <>
          <div className="stat-cards">
            <div className="panel stat"><b>{data.today}</b><span>bugün</span></div>
            <div className="panel stat"><b>{last7}</b><span>son 7 gün</span></div>
            <div className="panel stat"><b>{data.total}</b><span>{DAYS} gün, tüm sayfalar</span></div>
            <div className="panel stat"><b>{data.home}</b><span>{DAYS} gün, ana sayfa</span></div>
          </div>

          <div className="panel">
            <h3>Günlük görüntüleme</h3>
            <div className="bars" role="img" aria-label={`Son ${DAYS} günün günlük görüntülemeleri`}>
              {series.map((s) => (
                <div className="bar" key={s.day} title={`${s.day}: ${s.n}`}>
                  <i style={{ height: `${(s.n / max) * 100}%` }} />
                </div>
              ))}
            </div>
            <div className="bars-axis"><span>{series[0]?.day}</span><span>{series[series.length - 1]?.day}</span></div>
          </div>

          <div className="stat-cols">
            <div className="panel">
              <h3>En çok bakılan sayfalar</h3>
              {data.by_path.length === 0 ? <p className="muted">Henüz veri yok.</p> : (
                <ul className="plain">
                  {data.by_path.slice(0, 12).map((p) => <li key={p.path}><code>{p.path}</code><b>{p.n}</b></li>)}
                </ul>
              )}
            </div>
            <div className="panel">
              <h3>Dil</h3>
              {data.by_lang.length === 0 ? <p className="muted">Henüz veri yok.</p> : (
                <ul className="plain">
                  {data.by_lang.map((l) => <li key={l.lang}><span>{LANG_NAMES[l.lang] || l.lang}</span><b>{l.n}</b></li>)}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
