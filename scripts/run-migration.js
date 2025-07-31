const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('Installing required dependencies...');
  execSync('npm install mongodb uuid @types/uuid', { stdio: 'inherit' });
  
  console.log('Compiling TypeScript migration script...');
  execSync('npx tsc scripts/migrate-to-mongodb.ts --target es2020 --module commonjs --moduleResolution node --outDir scripts/dist --skipLibCheck', { stdio: 'inherit' });
  
  console.log('Running migration...');
  execSync('node scripts/dist/migrate-to-mongodb.js', { stdio: 'inherit' });
  
  console.log('Migration completed successfully!');
} catch (error) {
  console.error('Migration failed:', error.message);
  process.exit(1);
}