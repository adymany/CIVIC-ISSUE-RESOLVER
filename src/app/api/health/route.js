const { NextResponse } = require('next/server');

// GET /api/health - Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Civic Reporting System API is running'
  });
}