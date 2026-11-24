import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const bff = process.env.BFF_URL ?? "http://localhost:3001";

export default defineConfig({
  plugins: [react()],
  server: { port: Number(process.env.UI_PORT ?? 5173), strictPort: true, proxy: { "/api": bff } },
});
