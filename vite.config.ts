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

  // ✨ NUEVO: rutas relativas, clave para que cargue bien dentro de WordPress
  base: "",

  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },

  // Tu root ya apunta a /client (donde está index.html)
  root: path.resolve(import.meta.dirname, "client"),

  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,

    // ✨ NUEVO: genera manifest.json para integrarlo desde PHP en WP
    manifest: true,

    // ✨ NUEVO: fuerza a Vite a tomar /client/index.html como entry (WP-friendly)
    rollupOptions: {
      input: path.resolve(import.meta.dirname, "client", "index.html"),
    },
  },

  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
