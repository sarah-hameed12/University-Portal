import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Add the proxy configuration here
    proxy: {
      // String shorthand: /api -> http://127.0.0.1:8000/api
      // We forward any request starting with '/api' to the Django backend
      "/api": {
        target: "http://127.0.0.1:8000", // Your Django backend address
        changeOrigin: true, // Recommended for virtual hosted sites, good practice
        // secure: false, // Uncomment if your backend uses https with self-signed cert
        // rewrite: (path) => path.replace(/^\/api/, ''), // Optional: if backend expects paths WITHOUT /api prefix
      },
      // You might also need to proxy /media/ if serving images from Django dev server
      "/media": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },
});
