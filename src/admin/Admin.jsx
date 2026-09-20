import { useEffect, useState } from "react";
import { Link, Navigate, NavLink, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";
import CrudList from "./CrudList";
import ProfileForm from "./ProfileForm";
import { lists, TABS } from "./configs";

function LoginForm({ signIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState({ busy: false, error: "" });

  const submit = async (e) => {
    e.preventDefault();
    setState({ busy: true, error: "" });
    const { error } = await signIn(email.trim(), password);
    setState({ busy: false, error: error ? "E-posta veya şifre hatalı." : "" });
  };

  return (
    <form className="panel login" onSubmit={submit}>
      <h1>Yönetim paneli</h1>
      <p className="muted">Siteni buradan güncelleyebilirsin.</p>
      <div className="field">
        <label htmlFor="email">E-posta</label>
        <input id="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="password">Şifre</label>
        <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {state.error && <p className="alert" role="alert">{state.error}</p>}
      <button className="btn primary" type="submit" disabled={state.busy}>{state.busy ? "Giriliyor…" : "Giriş yap"}</button>
    </form>
  );
}

function NotAdmin({ email, signOut }) {
  const sql = `insert into public.admins (email) values ('${email}');`;
  return (
    <div className="panel login">
      <h1>Yönetici değilsin</h1>
      <p><b>{email}</b> ile giriş yaptın ama bu hesap yönetici listesinde yok.</p>
      <p className="muted">Supabase panelinde <b>SQL Editor</b>'e şunu yapıştırıp çalıştır, sonra sayfayı yenile:</p>
      <pre>{sql}</pre>
      <button className="btn ghost" type="button" onClick={signOut}>Çıkış yap</button>
    </div>
  );
}

export default function Admin() {
  const { tab } = useParams();
  const { session, isAdmin, signIn, signOut } = useAuth();

  useEffect(() => {
    document.title = "Yönetim — portfolyo";
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  let body;
  if (!supabase) {
    body = <div className="panel login"><h1>Supabase bağlı değil</h1><p className="muted">.env dosyasında VITE_SUPABASE_URL ve VITE_SUPABASE_KEY tanımlı olmalı.</p></div>;
  } else if (session === undefined) {
    body = <p className="muted center">Yükleniyor…</p>;
  } else if (!session) {
    body = <LoginForm signIn={signIn} />;
  } else if (isAdmin === null) {
    body = <p className="muted center">Yetki kontrol ediliyor…</p>;
  } else if (!isAdmin) {
    body = <NotAdmin email={session.user.email} signOut={signOut} />;
  } else if (!tab) {
    return <Navigate to="/admin/profil" replace />;
  } else {
    body = (
      <div className="admin-shell">
        <nav className="admin-nav" aria-label="Bölümler">
          {TABS.map((t) => <NavLink key={t.path} to={`/admin/${t.path}`}>{t.label}</NavLink>)}
        </nav>
        <div className="admin-content">
          {tab === "profil" ? <ProfileForm /> : lists[tab] ? <CrudList key={tab} config={lists[tab]} /> : <Navigate to="/admin/profil" replace />}
        </div>
      </div>
    );
  }

  return (
    <div className="admin">
      <header className="admin-top">
        <Link to="/" className="admin-brand">← Siteye dön</Link>
        <span className="admin-title">Yönetim</span>
        {session && isAdmin ? <button className="btn ghost small" type="button" onClick={signOut}>Çıkış yap</button> : <span />}
      </header>
      <main className="admin-main">{body}</main>
    </div>
  );
}
