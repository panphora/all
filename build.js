import * as esbuild from 'esbuild';
import pkg from './package.json' assert { type: 'json' };

const banner = `/*!
 * dollar v${pkg.version}
 * (c) ${new Date().getFullYear()} ${pkg.author}
 * Released under the MIT License
 */`;

// Shared settings
const baseConfig = {
  entryPoints: ['dollar.js'],
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
    outfile: 'dist/dollar.esm.js',
    minify: false,
  },
  {
    ...baseConfig,
    format: 'esm',
    outfile: 'dist/dollar.esm.min.js',
    minify: true,
  },
  // IIFE builds
  {
    ...baseConfig,
    format: 'iife',
    globalName: '$',
    footer: {
      js: 'window.$ = $.default;'  // Export the default export as window.$
    },
    outfile: 'dist/dollar.umd.js',
    minify: false,
  },
  {
    ...baseConfig,
    format: 'iife',
    globalName: '$',
    footer: {
      js: 'window.$ = $.default;'  // Export the default export as window.$
    },
    outfile: 'dist/dollar.umd.min.js',
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