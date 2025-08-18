const path = require('path');

const buildEslintCommand = (filenames) =>
  `next lint --fix --file ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(' --file ')}`;

module.exports = {
  'supabase/*.{js,ts}': ['deno fmt'],
  '*.{js,jsx,ts,tsx}': [buildEslintCommand, 'prettier --write', 'tsc-files --noEmit'],
};
