import { NextResponse } from 'next/server';
import dbAdapter from '@/lib/db-adapter';

// Helper function to validate and clean image data
function cleanImageData(imageUrl) {
  if (!imageUrl) return null;
  
  // If it's a data URL, check if it's reasonable size
  if (imageUrl.startsWith('data:image/')) {
    // If it's too long, it might be corrupted
    if (imageUrl.length > 100000) { // 100KB limit
      console.warn('Image data URL is too long, marking as corrupted');
      return '[CORRUPTED_DATA]';
    }
    return imageUrl;
  }
  
  // For regular URLs, return as is
  return imageUrl;
}

// POST /api/reports - Create a new report
export async function POST(request) {
  try {
    const body = await request.json();
    
    // In a real implementation, you would validate the data here
    const { title, description, imageUrl, latitude, longitude, userId } = body;
    
    // Validate required fields
    if (!title || !description || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'Title, description, latitude, and longitude are required' },
        { status: 400 }
      );
    }
    
    // Clean and validate image data
    const cleanedImageUrl = cleanImageData(imageUrl);
    
    // Handle the case where no user is provided or user doesn't exist
    let reportData = {
      title,
      description,
      imageUrl: cleanedImageUrl,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    };
    
    // If no userId provided, create/get anonymous user
    if (!userId) {
      // Check if anonymous user exists
      let anonymousUser = await dbAdapter.findUserByEmail('anonymous@civicreporter.com');
      
      // If not, create one
      if (!anonymousUser) {
        anonymousUser = await dbAdapter.createUser({
          email: 'anonymous@civicreporter.com',
          password: '$2a$10$8K1p/a0dURXAm7QiTRqNa.E3YPWs8UkrpC497F5rG1EtI1L19g3O6', // bcrypt hash of "anonymous"
          name: 'Anonymous User',
          mobile: '0000000000', // Add required mobile field
        });
      }
      
      reportData.userId = anonymousUser.id;
    } else {
      // If userId is provided, verify it exists
      const user = await dbAdapter.findUserByEmail(userId);
      
      if (user) {
        reportData.userId = userId;
      } else {
        // User doesn't exist, use anonymous user instead
        let anonymousUser = await dbAdapter.findUserByEmail('anonymous@civicreporter.com');
        
        if (!anonymousUser) {
          anonymousUser = await dbAdapter.createUser({
            email: 'anonymous@civicreporter.com',
            password: '$2a$10$8K1p/a0dURXAm7QiTRqNa.E3YPWs8UkrpC497F5rG1EtI1L19g3O6',
            name: 'Anonymous User',
            mobile: '0000000000', // Add required mobile field
          });
        }
        
        reportData.userId = anonymousUser.id;
      }
    }
    
    const report = await dbAdapter.createReport(reportData);
    
    // Clean the returned report data
    const cleanReport = {
      ...report,
      imageUrl: cleanImageData(report.imageUrl)
    };
    
    return NextResponse.json(cleanReport, { status: 201 });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { error: 'Failed to create report: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}

// GET /api/reports - Get all reports (with optional filtering)
export async function GET(request) {
  try {
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');
    
    // Build query filters
    const where = {};
    if (status) {
      where.status = status;
    }
    
    // Get reports from database
    const reports = await dbAdapter.findReports(where);
    
    // Clean up any corrupted image data
    const cleanReports = reports.map(report => {
      return {
        ...report,
        imageUrl: cleanImageData(report.imageUrl)
      };
    });
    
    return NextResponse.json(cleanReports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}