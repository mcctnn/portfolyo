import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ContentProvider } from "./data/ContentContext";
import { ToastProvider } from "./components/Toast";
import "./styles/scene.css";
import "./styles/admin.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "") || "/"}>
      <ContentProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </ContentProvider>
    </BrowserRouter>
  </StrictMode>,
);
