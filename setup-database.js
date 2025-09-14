import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Setting up the Civic Reporting System database...');

// Check if .env file exists, if not create it
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  const envContent = `# Database connection string - Update this with your actual database credentials
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/civic_reporting_system?schema=public"

# Next.js secrets
NEXTAUTH_SECRET="civic-reporting-secret-key"
NEXTAUTH_URL="http://localhost:3001"
`;
  fs.writeFileSync(envPath, envContent);
  console.log('Created .env file with default configuration');
}

// Try to run Prisma migrations
try {
  console.log('Running Prisma migrations...');
  execSync('npx prisma migrate dev', { stdio: 'inherit' });
  console.log('Prisma migrations completed successfully');
} catch (error) {
  console.log('Prisma migration failed. This might be because PostgreSQL is not installed or running.');
  console.log('Please ensure you have PostgreSQL installed and running on your system.');
  console.log('You can download PostgreSQL from: https://www.postgresql.org/download/');
  console.log('After installing PostgreSQL, create a database named "civic_reporting_system"');
  console.log('Then update the DATABASE_URL in the .env file with your actual database credentials');
}

console.log('Setup script completed!');