#!/usr/bin/env node
// Prints step-by-step instructions for running Astroday migrations in Supabase.

const fs = require('fs');
const path = require('path');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations');

const files = fs
  .readdirSync(MIGRATIONS_DIR)
  .filter(f => f.endsWith('.sql'))
  .sort();

console.log('\n========================================');
console.log('  Astroday — Database Setup Instructions');
console.log('========================================\n');

console.log('Run each migration in order in the Supabase SQL editor:\n');
console.log('  https://supabase.com/dashboard → your project → SQL Editor\n');

files.forEach((file, i) => {
  const filePath = path.join(MIGRATIONS_DIR, file);
  const sql = fs.readFileSync(filePath, 'utf8');
  const lines = sql.split('\n').length;
  const title = sql.split('\n')[0].replace('-- ', '');

  console.log(`Step ${i + 1}: ${file}`);
  console.log(`  ${title}`);
  console.log(`  ${lines} lines\n`);
});

console.log('After running both migrations:\n');
console.log('  1. Go to Authentication → Providers → enable Google OAuth');
console.log('     Add your Google Client ID and Secret from Google Cloud Console.');
console.log('     Set redirect URL to: https://your-project.supabase.co/auth/v1/callback\n');
console.log('  2. Add your app URL to Authentication → URL Configuration:');
console.log('     Site URL:         http://localhost:3001 (dev) or your Vercel URL (prod)');
console.log('     Redirect URLs:    http://localhost:3001/auth/callback\n');
console.log('  3. Confirm in Table Editor that all 8 tables were created:');
console.log('     users, profiles, daily_scores, daily_insights,');
console.log('     journal_entries, quick_tool_cache, meetings, pattern_insights\n');
console.log('  4. Enable automated daily backups:');
console.log('     Project Settings → Database → Enable Point in Time Recovery\n');
console.log('========================================\n');
