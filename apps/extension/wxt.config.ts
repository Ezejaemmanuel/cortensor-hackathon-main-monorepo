import { defineConfig } from 'wxt';
import path from 'path';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  alias: {
    '@': path.resolve(__dirname, './'),
  },
  vite: () => ({
    css: {
      postcss: {
        plugins: [
          require('tailwindcss'),
          require('autoprefixer'),
        ],
      },
    },
  }),
  webExt: {
    disabled:true
  },
  manifest: {
    permissions: ['sidePanel', 'storage'],
    side_panel: {
      default_path: 'sidepanel.html'
    },
    action: {
      default_title: 'Open Sidepanel'
    }
  },
});
