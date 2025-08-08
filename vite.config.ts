import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],

  // 👉 Rutas relativas para que cargue bien dentro de WP
  base: "",

  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },

  // Ya tienes root en /client (donde está tu index.html)
  root: path.resolve(import.meta.dirname, "client"),

  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,

    // 👉 Necesario para WP (leer assets desde PHP)
    manifest: true,

    // 👉 Como root ya es /client, el entry debe ser "index.html"
    // (o puedes omitir todo rollupOptions y Vite usará <root>/index.html)
    rollupOptions: {
      input: "index.html",
    },
  },

  server: {
    fs: { strict: true, deny: ["**/.*"] },
  },
});
