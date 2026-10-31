import { lazy, Suspense } from "react";
import { Link, Route, Routes } from "react-router-dom";
import Scene from "./components/Scene";
import SectionWindow from "./components/SectionWindow";
import { SECTIONS, pathFor, useI18n } from "./i18n";

// Yönetim paneli ayrı pakete bölünür; ziyaretçiler bunu indirmez.
const Admin = lazy(() => import("./admin/Admin"));

function NotFound() {
  const { t, lang } = useI18n();
  return (
    <main className="notfound">
      <p className="big">404</p>
      <h1>{t.notFound.title}</h1>
      <p>{t.notFound.text}</p>
      <Link className="btn primary" to={pathFor(lang)}>{t.notFound.back}</Link>
    </main>
  );
}

/** Her bölüm için bir rota; yazılar (posts) adresin sonunda isteğe bağlı slug alır. */
const sectionRoutes = (lang) =>
  SECTIONS.map((s) => (
    <Route
      key={s.key}
      path={s.hasChild ? `${s.slug[lang]}/:slug?` : s.slug[lang]}
      element={<SectionWindow key={s.key} section={s.key} />}
    />
  ));

export default function App() {
  return (
    <Routes>
      <Route element={<Scene />}>
        <Route index element={null} />
        {sectionRoutes("tr")}
        <Route path="en">
          <Route index element={null} />
          {sectionRoutes("en")}
        </Route>
      </Route>
      <Route
        path="admin/:tab?"
        element={<Suspense fallback={<div className="admin-loading">Yükleniyor…</div>}><Admin /></Suspense>}
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
