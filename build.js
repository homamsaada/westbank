import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { cpSync, rmSync, existsSync } from 'fs';

console.log('🔨 Building settlement dashboard...\n');

await build({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});

// Copy dist → docs for GitHub Pages
if (existsSync('docs')) rmSync('docs', { recursive: true });
cpSync('dist', 'docs', { recursive: true });

console.log('\n✅ Build complete!');
console.log('   dist/  → production build');
console.log('   docs/  → GitHub Pages deployment');
