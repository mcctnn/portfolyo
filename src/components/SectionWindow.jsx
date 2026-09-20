import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useContent } from "../data/ContentContext";
import { VIEWS } from "./views";

/** Sahnenin üstünde açılan pencere. Kapanınca adres "/" olur. */
export default function SectionWindow({ section }) {
  const navigate = useNavigate();
  const dialog = useRef(null);
  const { content } = useContent();
  const { file, theme, View } = VIEWS[section];
  // Kapatma her zaman adresi "/" yapar; pencere, sahneden çıkınca kaldırılır
  const close = () => navigate("/");

  useEffect(() => {
    const d = dialog.current;
    if (!d.open) d.showModal();
    document.body.classList.add("modal-open");
    return () => document.body.classList.remove("modal-open");
  }, [section]);

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
          <button className="dot red" type="button" aria-label="Kapat" onClick={close} />
          <i className="dot yellow" /><i className="dot green" />
          <span className="win-title" id="modalTitle">{file}</span>
        </div>
        <div className="win-body"><View content={content} /></div>
      </div>
    </dialog>
  );
}
