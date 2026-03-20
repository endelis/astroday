// Babel config for Jest — transforms ESM (import/export) to CommonJS.
// Only used in the test environment; Next.js uses its own compiler in production.
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
  ],
};
