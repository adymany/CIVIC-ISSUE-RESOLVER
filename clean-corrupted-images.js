// Script to clean corrupted image data from the database
import dbAdapter from './src/lib/db-adapter.js';

async function cleanCorruptedImages() {
  try {
    console.log('Connecting to database...');
    
    console.log('Fetching all reports...');
    const reports = await dbAdapter.findReports({});
    
    console.log(`Found ${reports.length} reports. Checking for corrupted image data...`);
    
    let corruptedCount = 0;
    let fixedCount = 0;
    
    for (const report of reports) {
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
    
    console.log(`\nCleanup complete!`);
    console.log(`- ${corruptedCount} reports with corrupted image data found`);
    console.log(`- ${fixedCount} reports successfully fixed`);
    
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

// Run the cleanup
cleanCorruptedImages();