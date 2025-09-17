// Periodic script to clean corrupted image data from the database
// This script can be scheduled to run regularly using cron or similar scheduling tools
import dbAdapter from './src/lib/db-adapter.js';

async function periodicImageCleanup() {
  try {
    console.log('Starting periodic image cleanup...');
    
    // Get current timestamp for logging
    const startTime = new Date().toISOString();
    console.log(`Cleanup started at: ${startTime}`);
    
    console.log('Fetching all reports...');
    const reports = await dbAdapter.findReports({});
    
    console.log(`Found ${reports.length} reports. Checking for corrupted image data...`);
    
    let corruptedCount = 0;
    let fixedCount = 0;
    
    // Process reports in batches to avoid memory issues with large datasets
    const batchSize = 50;
    for (let i = 0; i < reports.length; i += batchSize) {
      const batch = reports.slice(i, i + batchSize);
      
      for (const report of batch) {
        // Check if imageUrl is corrupted
        if (report.imageUrl && 
            (report.imageUrl === '[CORRUPTED_DATA]' || 
             report.imageUrl.length > 100000 ||
             (report.imageUrl.startsWith('data:image/') && !/^data:image\/(png|jpg|jpeg|gif);base64,[A-Za-z0-9+/=]+$/.test(report.imageUrl)))) {
          
          corruptedCount++;
          console.log(`Found corrupted image data in report ${report.id}`);
          
          // Update the report with null imageUrl
          try {
            await dbAdapter.updateReport(report.id, { imageUrl: null });
            console.log(`Fixed report ${report.id}`);
            fixedCount++;
          } catch (updateError) {
            console.error(`Failed to update report ${report.id}:`, updateError.message);
          }
        }
      }
      
      // Add a small delay between batches to avoid overwhelming the database
      if (i + batchSize < reports.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Log completion
    const endTime = new Date().toISOString();
    console.log(`\nPeriodic cleanup completed at: ${endTime}`);
    console.log(`- ${corruptedCount} reports with corrupted image data found`);
    console.log(`- ${fixedCount} reports successfully fixed`);
    
    // Return stats for monitoring
    return {
      startTime,
      endTime,
      totalReports: reports.length,
      corruptedCount,
      fixedCount
    };
  } catch (error) {
    console.error('Error during periodic cleanup:', error);
    throw error;
  }
}

// Run the cleanup if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  periodicImageCleanup()
    .then((stats) => {
      console.log('Cleanup process completed successfully with stats:', stats);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Cleanup process failed:', error);
      process.exit(1);
    });
}

// Export the function for use in other modules
export default periodicImageCleanup;