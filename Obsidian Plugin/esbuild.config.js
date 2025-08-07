const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['main.ts'],
  bundle: true,
  outfile: 'out.js',
  external: ['markdown-it'], // Mark 'markdown-it' as external
}).catch(() => process.exit(1));
