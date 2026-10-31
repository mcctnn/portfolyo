import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const fmt = (iso) => new Date(iso).toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" });

/** İletişim formundan gelen mesajlar. */
export default function MessagesList({ onChange }) {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data, error: err } = await supabase.from("messages").select("*").order("created_at", { ascending: false }).limit(200);
    if (err) setError(err.message);
    else { setRows(data); setError(""); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const run = async (action) => {
    setBusy(true);
    const { error: err } = await action();
    if (err) setError(err.message);
    else { await load(); onChange?.(); }
    setBusy(false);
  };

  const toggle = (m) => run(() => supabase.from("messages").update({ is_read: !m.is_read }).eq("id", m.id));
  const remove = (m) => {
    if (!window.confirm(`${m.name} kişisinin mesajı silinsin mi? Bu işlem geri alınamaz.`)) return;
    run(() => supabase.from("messages").delete().eq("id", m.id));
  };

  const unread = rows?.filter((m) => !m.is_read).length ?? 0;

  return (
    <section>
      <div className="section-head">
        <div>
          <h2>Mesajlar</h2>
          <p className="muted">İletişim formundan gelenler. Yeni mesaj için e-posta bildirimi gitmez, buraya bakman gerekir.{rows && ` ${unread} okunmamış.`}</p>
        </div>
      </div>
      {error && <p className="alert" role="alert">Hata: {error}</p>}
      {rows === null ? <p className="muted">Yükleniyor…</p> : rows.length === 0 ? (
        <p className="panel muted">Henüz mesaj yok.</p>
      ) : (
        <ul className="rows">
          {rows.map((m) => (
            <li className={`row msg${m.is_read ? "" : " unread"}`} key={m.id}>
              <div className="row-main">
                <b>{m.is_read ? "" : "● "}{m.name} <small>· {m.email} · {fmt(m.created_at)} · {m.lang.toUpperCase()}</small></b>
                <p className="msg-body">{m.body}</p>
              </div>
              <div className="row-actions">
                <a className="linkbtn" href={`mailto:${encodeURIComponent(m.email).replace(/%40/g, "@")}?subject=${encodeURIComponent("Re: portfolyo mesajın")}`}>Yanıtla</a>
                <button type="button" onClick={() => toggle(m)} disabled={busy}>{m.is_read ? "Okunmadı yap" : "Okundu"}</button>
                <button type="button" className="danger" onClick={() => remove(m)} disabled={busy}>Sil</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
