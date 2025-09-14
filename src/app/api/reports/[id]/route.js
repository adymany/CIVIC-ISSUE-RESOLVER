import { NextResponse } from 'next/server';
import dbAdapter from '@/lib/db-adapter';

// PATCH /api/reports/[id] - Update a report's status
export async function PATCH(request, { params }) {
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
    
    // Use the database adapter (PostgreSQL via Prisma)
    const updatedReport = await dbAdapter.updateReportStatus(id, status);
    
    if (!updatedReport) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }
    
    // Clean up any corrupted image data
    const cleanReport = {
      ...updatedReport,
      // If imageUrl is extremely long, it might be corrupted data
      imageUrl: updatedReport.imageUrl && updatedReport.imageUrl.length > 10000 
        ? '[CORRUPTED_DATA]' 
        : updatedReport.imageUrl
    };
    
    return NextResponse.json(cleanReport);
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json(
      { error: 'Failed to update report' },
      { status: 500 }
    );
  }
}

// GET /api/reports/[id] - Get a specific report
export async function GET(request, { params }) {
  try {
    // Await params before using
    const { id } = await params;
    
    // Use the database adapter (PostgreSQL via Prisma)
    const report = await dbAdapter.findReportById(id);
    
    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
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
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    );
  }
}