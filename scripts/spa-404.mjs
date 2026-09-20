// GitHub Pages bilinmeyen adreslerde 404.html gösterir. SPA'nın /projeler gibi
// adresleri doğrudan açabilmesi için index.html'i 404.html olarak da kopyalıyoruz.
import { copyFileSync, existsSync } from "node:fs";

if (existsSync("dist/index.html")) {
  copyFileSync("dist/index.html", "dist/404.html");
  console.log("dist/404.html oluşturuldu");
}
