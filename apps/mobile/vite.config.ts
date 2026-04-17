import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig(({ mode }) => {
  const rootEnv = loadEnv(mode, resolve(process.cwd(), "../.."), "");
  return {
    plugins: [react()],
    resolve: {
      alias: { "@": resolve(process.cwd(), "./src") },
    },
    server: { port: 5174 },
    define: {
      "import.meta.env.VITE_BFF_URL": JSON.stringify(rootEnv.VITE_BFF_URL ?? "http://localhost:8787"),
    },
  };
});
