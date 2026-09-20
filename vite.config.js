import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // GitHub Pages proje sitesi alt klasörden yayınlanır (/portfolyo/).
  // Kendi alan adına geçilince VITE_BASE boş bırakılır.
  base: process.env.VITE_BASE || "/",
  server: { port: 5174, strictPort: true },
});
