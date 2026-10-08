import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  // Read the backend's existing .env (client/ has no .env of its own)
  const env = loadEnv(mode, path.resolve(__dirname, "../server"), "");
  const backend = env.BACKEND_URL || `http://localhost:${env.PORT || 5000}`;

  const proxy = {
    "/api": { target: backend },
    "/uploads": { target: backend },
    "/socket": { target: backend, ws: true },
  };

  return {
    plugins: [react(), tailwindcss()],
    server: { proxy },
    preview: { proxy },
  };
});