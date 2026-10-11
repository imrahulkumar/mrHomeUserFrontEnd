import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

// Regenerate the PNG icons from public/icon.svg with: npm run generate-pwa-assets
export default defineConfig({
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, resizeOptions: { background: '#2a2420' } },
    apple: { ...minimal2023Preset.apple, resizeOptions: { background: '#2a2420' } },
  },
  images: ['public/icon.svg'],
});
