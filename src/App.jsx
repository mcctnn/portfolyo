import { lazy, Suspense } from "react";
import { Link, Route, Routes } from "react-router-dom";
import Scene from "./components/Scene";
import SectionWindow from "./components/SectionWindow";
import { SECTIONS } from "./components/sections";

// Yönetim paneli ayrı pakete bölünür; ziyaretçiler bunu indirmez.
const Admin = lazy(() => import("./admin/Admin"));

function NotFound() {
  return (
    <main className="notfound">
      <p className="big">404</p>
      <h1>Bu sayfa masadan düşmüş 🙈</h1>
      <p>Aradığın sayfayı bulamadım.</p>
      <Link className="btn primary" to="/">Masaya dön</Link>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Scene />}>
        <Route index element={null} />
        {Object.entries(SECTIONS).map(([path, { key }]) => (
          <Route key={path} path={path} element={<SectionWindow key={key} section={key} />} />
        ))}
      </Route>
      <Route
        path="admin/:tab?"
        element={<Suspense fallback={<div className="admin-loading">Yükleniyor…</div>}><Admin /></Suspense>}
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
