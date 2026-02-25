import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  base: '/',
  build: {
    minify: 'terser',
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, '/');
          if (!normalizedId.includes('node_modules')) return;

          const modulePath = normalizedId.split('node_modules/')[1];
          if (!modulePath) return 'vendor';

          const packageName = modulePath.startsWith('@')
            ? modulePath.split('/').slice(0, 2).join('/')
            : modulePath.split('/')[0];

          const chunkMap: Record<string, string> = {
            react: 'vendor-react',
            'react-dom': 'vendor-react',
            'react-router-dom': 'vendor-react-router',
            'framer-motion': 'vendor-motion',
            '@supabase/supabase-js': 'vendor-supabase',
            '@tanstack/react-query': 'vendor-query',
            recharts: 'vendor-recharts',
            'lucide-react': 'vendor-icons',
            'html2pdf.js': 'vendor-export',
            '@radix-ui/react-dialog': 'vendor-radix',
            '@radix-ui/react-dropdown-menu': 'vendor-radix',
            '@radix-ui/react-select': 'vendor-radix',
            '@radix-ui/react-tabs': 'vendor-radix',
            '@radix-ui/react-toast': 'vendor-radix',
          };

          if (chunkMap[packageName]) {
            return chunkMap[packageName];
          }
        },
      },
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5000,
    allowedHosts: true,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
