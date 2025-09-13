const { NextResponse } = require('next/server');
const prisma = require('@/lib/prisma').default;
const inMemoryDb = require('@/lib/in-memory-db').default;

// PATCH /api/reports/[id] - Update a report's status
async function PATCH(request, { params }) {
  try {
    // Await params before using
    const { id } = await params;
    const body = await request.json();
    const { status } = body;
    
    // Validate status
    const validStatuses = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }
    
    try {
      // Try to use Prisma (PostgreSQL)
      const updatedReport = await prisma.report.update({
        where: {
          id: id,
        },
        data: {
          status,
        },
      });
      
      // Clean up any corrupted image data
      const cleanReport = {
        ...updatedReport,
        // If imageUrl is extremely long, it might be corrupted data
        imageUrl: updatedReport.imageUrl && updatedReport.imageUrl.length > 10000 
          ? '[CORRUPTED_DATA]' 
          : updatedReport.imageUrl
      };
      
      return NextResponse.json(cleanReport);
    } catch (prismaError) {
      console.log('Prisma database error, falling back to in-memory database:', prismaError);
      
      // Fallback to in-memory database
      try {
        const updatedReport = await inMemoryDb.updateReportStatus(id, status);
        
        if (!updatedReport) {
          return NextResponse.json(
            { error: 'Report not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json(updatedReport);
      } catch (inMemoryError) {
        console.error('In-memory database error:', inMemoryError);
        return NextResponse.json(
          { error: 'Failed to update report' },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json(
      { error: 'Failed to update report' },
      { status: 500 }
    );
  }
}

// GET /api/reports/[id] - Get a specific report
async function GET(request, { params }) {
  try {
    // Await params before using
    const { id } = await params;
    
    try {
      // Try to use Prisma (PostgreSQL)
      const report = await prisma.report.findUnique({
        where: {
          id: id,
        },
      });
      
      if (!report) {
        throw new Error('Report not found');
      }
      
      // Clean up any corrupted image data
      const cleanReport = {
        ...report,
        // If imageUrl is extremely long, it might be corrupted data
        imageUrl: report.imageUrl && report.imageUrl.length > 10000 
          ? '[CORRUPTED_DATA]' 
          : report.imageUrl
      };
      
      return NextResponse.json(cleanReport);
    } catch (prismaError) {
      console.log('Prisma database error, falling back to in-memory database:', prismaError);
      
      // Fallback to in-memory database
      try {
        const report = await inMemoryDb.findReportById(id);
        
        if (!report) {
          return NextResponse.json(
            { error: 'Report not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json(report);
      } catch (inMemoryError) {
        console.error('In-memory database error:', inMemoryError);
        return NextResponse.json(
          { error: 'Failed to fetch report' },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    );
  }
}

module.exports = {
  PATCH,
  GET
};