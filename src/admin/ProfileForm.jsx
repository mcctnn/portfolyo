import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useContent } from "../data/ContentContext";
import { FieldInput, fromForm, toForm } from "./fields";
import { profileFields } from "./configs";

/** Tek satırlık profil (id = 1): ad, giriş yazısı, hakkımda metinleri, sürpriz mesajlar. */
export default function ProfileForm() {
  const { reload } = useContent();
  const [form, setForm] = useState(null);
  const [state, setState] = useState({ busy: false, error: "", saved: false });

  useEffect(() => {
    supabase.from("profile").select("*").eq("id", 1).maybeSingle().then(({ data, error }) => {
      if (error) setState((s) => ({ ...s, error: error.message }));
      else setForm(toForm(profileFields, data || {}));
    });
  }, []);

  const set = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setState((s) => ({ ...s, saved: false }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setState({ busy: true, error: "", saved: false });
    const { error } = await supabase.from("profile").upsert({ id: 1, ...fromForm(profileFields, form) });
    if (error) setState({ busy: false, error: error.message, saved: false });
    else { await reload(); setState({ busy: false, error: "", saved: true }); }
  };

  return (
    <section>
      <div className="section-head">
        <div>
          <h2>Profil</h2>
          <p className="muted">Ana sayfadaki yazılar, "Hakkımda" metinleri ve nesnelere tıklayınca çıkan mesajlar.</p>
        </div>
      </div>
      {state.error && <p className="alert" role="alert">Hata: {state.error}</p>}
      {!form ? <p className="muted">Yükleniyor…</p> : (
        <form className="panel form" onSubmit={submit}>
          <div className="fields">
            {profileFields.map((f) => <FieldInput key={f.key} field={f} value={form[f.key]} onChange={set(f.key)} />)}
          </div>
          <div className="actions">
            <button className="btn primary" type="submit" disabled={state.busy}>{state.busy ? "Kaydediliyor…" : "Kaydet"}</button>
            {state.saved && <span className="saved" role="status">✓ Kaydedildi</span>}
          </div>
        </form>
      )}
    </section>
  );
}
