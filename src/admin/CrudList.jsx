import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useContent } from "../data/ContentContext";
import { FieldInput, fromForm, toForm } from "./fields";

function RowForm({ config, initial, busy, onSave, onCancel }) {
  const [form, setForm] = useState(() => toForm(config.fields, initial));
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <form
      className="panel form"
      onSubmit={(e) => { e.preventDefault(); onSave(fromForm(config.fields, form)); }}
    >
      <h3>{initial?.id ? `${config.noun} düzenle` : `Yeni ${config.noun}`}</h3>
      <div className="fields">
        {config.fields.map((f) => <FieldInput key={f.key} field={f} value={form[f.key]} onChange={set(f.key)} />)}
      </div>
      <div className="actions">
        <button className="btn primary" type="submit" disabled={busy}>{busy ? "Kaydediliyor…" : "Kaydet"}</button>
        <button className="btn ghost" type="button" onClick={onCancel} disabled={busy}>Vazgeç</button>
      </div>
    </form>
  );
}

/** Bir tablodaki satırları listeler; ekleme, düzenleme, silme ve sıralama sağlar. */
export default function CrudList({ config }) {
  const { table, title, noun, help, summary, detail } = config;
  const { reload } = useContent();
  const [rows, setRows] = useState(null);
  const [editing, setEditing] = useState(null); // null | {} (yeni) | satır
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data, error: err } = await supabase.from(table).select("*").order("sort_order").order("id");
    if (err) setError(err.message);
    else { setRows(data); setError(""); }
  }, [table]);

  useEffect(() => { setRows(null); setEditing(null); load(); }, [load]);

  // Değişikliği hem listeye hem de sitenin önbelleğine yansıt
  const run = async (action) => {
    setBusy(true);
    setError("");
    const err = await action();
    if (err) setError(err.message);
    else { await load(); reload(); }
    setBusy(false);
    return !err;
  };

  const save = async (values) => {
    const ok = await run(async () => {
      if (editing?.id) {
        return (await supabase.from(table).update(values).eq("id", editing.id)).error;
      }
      const next = rows.reduce((m, r) => Math.max(m, r.sort_order), 0) + 1;
      return (await supabase.from(table).insert({ ...values, sort_order: next })).error;
    });
    if (ok) setEditing(null);
  };

  const remove = (row) => {
    if (!window.confirm(`"${summary(row)}" silinsin mi? Bu işlem geri alınamaz.`)) return;
    run(async () => (await supabase.from(table).delete().eq("id", row.id)).error);
  };

  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    run(async () => {
      const results = await Promise.all(
        next.map((r, idx) => (r.sort_order === idx + 1 ? null : supabase.from(table).update({ sort_order: idx + 1 }).eq("id", r.id))),
      );
      return results.find((r) => r?.error)?.error;
    });
  };

  return (
    <section>
      <div className="section-head">
        <div>
          <h2>{title}</h2>
          {help && <p className="muted">{help}</p>}
        </div>
        {!editing && <button className="btn primary" type="button" onClick={() => setEditing({})} disabled={!rows}>+ Yeni {noun}</button>}
      </div>

      {error && <p className="alert" role="alert">Hata: {error}</p>}

      {editing && (
        <RowForm key={editing.id ?? "new"} config={config} initial={editing} busy={busy} onSave={save} onCancel={() => setEditing(null)} />
      )}

      {rows === null ? <p className="muted">Yükleniyor…</p> : rows.length === 0 ? (
        <p className="panel muted">Henüz {noun} yok. "+ Yeni {noun}" ile ekleyebilirsin.</p>
      ) : (
        <ul className="rows">
          {rows.map((r, i) => (
            <li className="row" key={r.id}>
              <div className="row-main">
                <b>{summary(r)}</b>
                {detail(r) && <span>{detail(r)}</span>}
              </div>
              <div className="row-actions">
                <button type="button" title="Yukarı taşı" aria-label="Yukarı taşı" onClick={() => move(i, -1)} disabled={busy || i === 0}>↑</button>
                <button type="button" title="Aşağı taşı" aria-label="Aşağı taşı" onClick={() => move(i, 1)} disabled={busy || i === rows.length - 1}>↓</button>
                <button type="button" onClick={() => setEditing(r)} disabled={busy}>Düzenle</button>
                <button type="button" className="danger" onClick={() => remove(r)} disabled={busy}>Sil</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
