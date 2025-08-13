import * as esbuild from 'esbuild';
import { readFileSync } from 'fs';
const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

const banner = `/*!
 * All.js v${pkg.version}
 * (c) ${new Date().getFullYear()} ${pkg.author}
 * Released under the MIT License
 */`;

// Shared settings
const baseConfig = {
  entryPoints: ['all.js'],
  banner: { js: banner },
  bundle: true,
  target: 'es2018',
};

// Build configurations
const builds = [
  // ESM builds
  {
    ...baseConfig,
    format: 'esm',
    outfile: 'dist/all.esm.js',
    minify: false,
  },
  {
    ...baseConfig,
    format: 'esm',
    outfile: 'dist/all.esm.min.js',
    minify: true,
  },
  // IIFE builds
  {
    ...baseConfig,
    format: 'iife',
    globalName: 'All',
    footer: {
      js: 'window.All = All.default;'  // Export the default export as window.All
    },
    outfile: 'dist/all.umd.js',
    minify: false,
  },
  {
    ...baseConfig,
    format: 'iife',
    globalName: 'All',
    footer: {
      js: 'window.All = All.default;'  // Export the default export as window.All
    },
    outfile: 'dist/all.umd.min.js',
    minify: true,
  },
];

// Watch mode (development)
if (process.argv.includes('--watch')) {
  console.log('👀 Watching for changes...');
  
  // Create watch contexts for all builds
  const contexts = await Promise.all(
    builds.map(config => esbuild.context(config))
  );
  
  // Start watching all contexts
  await Promise.all(
    contexts.map(ctx => ctx.watch())
  );
} else {
  // One-time build mode
  Promise.all(builds.map(config => esbuild.build(config)))
    .then(() => console.log('⚡ Build complete!'))
    .catch(() => process.exit(1));
}