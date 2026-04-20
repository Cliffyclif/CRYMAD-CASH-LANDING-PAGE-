import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Dashboard API target: defaults to the dev dashboard on :3000 for local work.
  // Override with VITE_API_BASE for staging/prod.
  const API_TARGET = env.VITE_API_BASE ?? "http://localhost:3000";

  return {
    plugins: [react()],
    resolve: { alias: { "@": resolve(process.cwd(), "./src") } },
    server: {
      port: 5174,
      host: true,
      proxy: {
        "/api": {
          target: API_TARGET,
          changeOrigin: true,
          cookieDomainRewrite: "",
        },
      },
    },
  };
});
