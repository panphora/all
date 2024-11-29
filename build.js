// build.js
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
  // UMD builds
  {
    ...baseConfig,
    format: 'iife',
    globalName: '$',
    outfile: 'dist/dollar.umd.js',
    minify: false,
  },
  {
    ...baseConfig,
    format: 'iife',
    globalName: '$',
    outfile: 'dist/dollar.umd.min.js',
    minify: true,
  },
];

// Run all builds
Promise.all(builds.map(config => esbuild.build(config)))
  .then(() => console.log('⚡ Build complete!'))
  .catch(() => process.exit(1));

// Watch mode (development)
if (process.argv.includes('--watch')) {
  const ctx = await esbuild.context({
    ...baseConfig,
    format: 'esm',
    outfile: 'dist/dollar.esm.js',
    minify: false,
  });

  await ctx.watch();
  console.log('👀 Watching for changes...');
}