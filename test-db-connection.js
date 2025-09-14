import dbAdapter from './src/lib/db-adapter.js';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test the connection by trying to find reports
    const reports = await dbAdapter.findReports();
    console.log(`Successfully connected to database. Found ${reports.length} reports.`);
    
    // Test finding a user
    const users = await dbAdapter.findReports({});
    console.log(`Found ${users.length} users in the database.`);
    
    console.log('Database connection test completed successfully.');
  } catch (error) {
    console.error('Database connection test failed:', error);
  }
}

testConnection();