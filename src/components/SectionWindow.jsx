import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useContent } from "../data/ContentContext";
import { useI18n } from "../i18n";
import { VIEWS } from "./views";

/** Sahnenin üstünde açılan pencere. Kapanınca adres ana sayfaya döner. */
export default function SectionWindow({ section }) {
  const navigate = useNavigate();
  const { slug } = useParams();
  const dialog = useRef(null);
  const { content } = useContent();
  const { lang, t, to } = useI18n();
  const { theme, View } = VIEWS[section];
  // Kapatma her zaman ana sayfaya döner; pencere, sahneden çıkınca kaldırılır
  const close = () => navigate(to());

  useEffect(() => {
    const d = dialog.current;
    if (!d.open) d.showModal();
    document.body.classList.add("modal-open");
    return () => document.body.classList.remove("modal-open");
  }, [section]);

  // Yazı ile liste arasında geçince pencerenin içi başa dönsün
  useEffect(() => { dialog.current?.querySelector(".win-body")?.scrollTo(0, 0); }, [slug]);

  return (
    <dialog
      ref={dialog}
      className="modal"
      data-theme={theme}
      aria-labelledby="modalTitle"
      onCancel={(e) => { e.preventDefault(); close(); }}
      onClose={close}
      onClick={(e) => { if (e.target === dialog.current) close(); }}
    >
      <div className="win">
        <div className="win-bar">
          <button className="dot red" type="button" aria-label={lang === "en" ? "Close" : "Kapat"} onClick={close} />
          <i className="dot yellow" /><i className="dot green" />
          <span className="win-title" id="modalTitle">{t.files[section]}</span>
        </div>
        <div className="win-body"><View content={content} t={t} lang={lang} to={to} slug={slug} /></div>
      </div>
    </dialog>
  );
}
