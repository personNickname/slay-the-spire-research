import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const here = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: process.env.VITE_BASE ?? "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@sts/engine": path.resolve(here, "../packages/sts-engine/src/index.ts"),
    },
  },
  server: {
    port: 5173,
    fs: { allow: [path.resolve(here, "..")] },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
