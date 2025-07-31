const { execSync } = require('child_process');

try {
  console.log('Compiling TypeScript script...');
  execSync('npx tsc scripts/add-created-by.ts --target es2020 --module commonjs --moduleResolution node --outDir scripts/dist --skipLibCheck --esModuleInterop', { stdio: 'inherit' });
  
  console.log('Running add createdBy script...');
  execSync('node scripts/dist/scripts/add-created-by.js', { stdio: 'inherit' });
  
  console.log('CreatedBy field added successfully!');
} catch (error) {
  console.error('Script failed:', error.message);
  process.exit(1);
}