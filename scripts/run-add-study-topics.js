const { execSync } = require('child_process');

try {
  console.log('Compiling TypeScript script...');
  execSync('npx tsc scripts/add-study-topics.ts --target es2020 --module commonjs --moduleResolution node --outDir scripts/dist --skipLibCheck --esModuleInterop', { stdio: 'inherit' });
  
  console.log('Running add study topics script...');
  execSync('node scripts/dist/scripts/add-study-topics.js', { stdio: 'inherit' });
  
  console.log('Study topics field added successfully!');
} catch (error) {
  console.error('Script failed:', error.message);
  process.exit(1);
}