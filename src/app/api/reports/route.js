const { NextResponse } = require('next/server');
const prisma = require('@/lib/prisma').default;
// const inMemoryDb = require('@/lib/in-memory-db').default; // Removed in-memory DB

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
async function POST(request) {
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
    
    // Use Prisma (PostgreSQL) directly without fallback
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
      let anonymousUser = await prisma.user.findUnique({
        where: { email: 'anonymous@civicreporter.com' },
      });
      
      // If not, create one
      if (!anonymousUser) {
        anonymousUser = await prisma.user.create({
          data: {
            email: 'anonymous@civicreporter.com',
            password: '$2a$10$8K1p/a0dURXAm7QiTRqNa.E3YPWs8UkrpC497F5rG1EtI1L19g3O6', // bcrypt hash of "anonymous"
            name: 'Anonymous User',
          },
        });
      }
      
      reportData.userId = anonymousUser.id;
    } else {
      // If userId is provided, verify it exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      
      if (user) {
        reportData.userId = userId;
      } else {
        // User doesn't exist, use anonymous user instead
        let anonymousUser = await prisma.user.findUnique({
          where: { email: 'anonymous@civicreporter.com' },
        });
        
        if (!anonymousUser) {
          anonymousUser = await prisma.user.create({
            data: {
              email: 'anonymous@civicreporter.com',
              password: '$2a$10$8K1p/a0dURXAm7QiTRqNa.E3YPWs8UkrpC497F5rG1EtI1L19g3O6',
              name: 'Anonymous User',
            },
          });
        }
        
        reportData.userId = anonymousUser.id;
      }
    }
    
    const report = await prisma.report.create({
      data: reportData,
    });
    
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
async function GET(request) {
  try {
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');
    
    // Use Prisma (PostgreSQL) directly without fallback
    // Build query filters
    const where = {};
    if (status) {
      where.status = status;
    }
    
    // Get reports from database
    const reports = await prisma.report.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit ? parseInt(limit) : undefined,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
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

module.exports = {
  POST,
  GET
};