#!/usr/bin/env node

/**
 * Migration Runner Script
 * 
 * This script helps you run database migrations more easily.
 * It validates SQL syntax before you paste it into Supabase.
 */

const fs = require('fs');
const path = require('path');

console.log('📋 Anna AI Migration Helper\n');

// Find all migration files
const migrationsDir = path.join(__dirname, '..', 'database', 'migrations');
const migrationFiles = fs.readdirSync(migrationsDir)
  .filter(file => file.endsWith('.sql'))
  .sort();

if (migrationFiles.length === 0) {
  console.log('❌ No migration files found in database/migrations/');
  process.exit(1);
}

console.log('📁 Available migrations:');
migrationFiles.forEach((file, index) => {
  console.log(`   ${index + 1}. ${file}`);
});

console.log('\n🔧 Migration Instructions:');
console.log('1. Copy the SQL content from the migration file');
console.log('2. Go to Supabase Dashboard → SQL Editor');
console.log('3. Paste and run the SQL');
console.log('4. Verify tables were created in Table Editor');

console.log('\n📝 Latest migration content:');
console.log('═'.repeat(50));

// Show the latest migration content
const latestMigration = migrationFiles[migrationFiles.length - 1];
const migrationPath = path.join(migrationsDir, latestMigration);
const migrationContent = fs.readFileSync(migrationPath, 'utf8');

console.log(migrationContent);
console.log('═'.repeat(50));

console.log('\n✅ Copy the above SQL and run it in your Supabase SQL Editor');

// Basic syntax validation
const hasBegin = migrationContent.includes('BEGIN');
const hasEnd = migrationContent.includes('END');
const hasSemicolons = migrationContent.includes(';');

if (hasBegin && hasEnd && hasSemicolons) {
  console.log('✅ Basic SQL syntax looks good');
} else {
  console.log('⚠️  SQL syntax might have issues - double check before running');
}

console.log('\n💡 Pro tip: Save this migration content to run it quickly next time!');

process.exit(0);