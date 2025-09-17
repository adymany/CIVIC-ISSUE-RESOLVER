import { NextResponse } from 'next/server';
import dbAdapter from '@/lib/db-adapter';

// Helper function to validate and clean image data
function cleanImageData(imageUrl) {
  if (!imageUrl) return null;
  
  // If it's a data URL, check if it's reasonable size
  if (imageUrl.startsWith('data:image/')) {
    // If it's too long, it might be corrupted
    if (imageUrl.length > 100000) { // 100KB limit
      console.warn('Image data URL is too long, rejecting');
      return null; // Return null instead of a corrupted marker
    }
    
    // Additional validation for base64 data URLs
    try {
      // Check if it's a valid data URL format
      const dataUrlRegex = /^data:image\/(png|jpg|jpeg|gif);base64,[A-Za-z0-9+/=]+$/;
      if (!dataUrlRegex.test(imageUrl)) {
        console.warn('Invalid image data URL format');
        return null;
      }
      
      return imageUrl;
    } catch (error) {
      console.warn('Error validating image data URL:', error.message);
      return null;
    }
  }
  
  // For regular URLs, validate they look like URLs
  if (imageUrl.startsWith('http')) {
    try {
      new URL(imageUrl); // This will throw if it's not a valid URL
      return imageUrl;
    } catch (error) {
      console.warn('Invalid image URL:', imageUrl);
      return null;
    }
  }
  
  // If it's neither a data URL nor a regular URL, it's likely corrupted
  console.warn('Unrecognized image URL format:', imageUrl);
  return null;
}

// POST /api/reports - Create a new report
export async function POST(request) {
  try {
    const body = await request.json();
    
    // In a real implementation, you would validate the data here
    const { title, description, imageUrl, latitude, longitude, address, userId } = body;
    
    // Validate required fields
    if (!title || !description || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'Title, description, latitude, and longitude are required' },
        { status: 400 }
      );
    }
    
    // Validate latitude and longitude are numbers
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: 'Latitude and longitude must be valid numbers' },
        { status: 400 }
      );
    }
    
    // Validate latitude and longitude ranges
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { error: 'Latitude must be between -90 and 90, longitude between -180 and 180' },
        { status: 400 }
      );
    }
    
    // Clean and validate image data
    const cleanedImageUrl = cleanImageData(imageUrl);
    
    // Handle the case where no user is provided or user doesn't exist
    let reportData = {
      title: title.trim(),
      description: description.trim(),
      imageUrl: cleanedImageUrl,
      latitude: lat,
      longitude: lng,
      address: address || null, // Include address in report data
    };
    
    // Validate title and description lengths
    if (reportData.title.length < 5 || reportData.title.length > 100) {
      return NextResponse.json(
        { error: 'Title must be between 5 and 100 characters' },
        { status: 400 }
      );
    }
    
    if (reportData.description.length < 10 || reportData.description.length > 1000) {
      return NextResponse.json(
        { error: 'Description must be between 10 and 1000 characters' },
        { status: 400 }
      );
    }
    
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