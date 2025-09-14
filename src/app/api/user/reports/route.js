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

// GET /api/user/reports - Get reports for the current user
export async function GET(request) {
  try {
    // Get user ID from header (in a real app, you would verify a JWT token)
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');
    
    // Build query filters
    const where = {
      userId: userId // Only get reports for this user
    };
    
    // Apply status filter if provided
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
    console.error('Error fetching user reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}