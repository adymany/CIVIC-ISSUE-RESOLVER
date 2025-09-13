const { NextResponse } = require('next/server');
const prisma = require('@/lib/prisma').default;
const bcrypt = require('bcryptjs');
const inMemoryDb = require('@/lib/in-memory-db').default;

// POST /api/auth/login - Authenticate a user
async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    try {
      // Try to use Prisma (PostgreSQL)
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      
      return NextResponse.json(userWithoutPassword);
    } catch (prismaError) {
      console.log('Prisma database error, falling back to in-memory database:', prismaError);
      
      // Fallback to in-memory database
      try {
        const user = await inMemoryDb.findUserByEmail(email);
        
        if (!user) {
          return NextResponse.json(
            { error: 'Invalid credentials' },
            { status: 401 }
          );
        }
        
        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
          return NextResponse.json(
            { error: 'Invalid credentials' },
            { status: 401 }
          );
        }
        
        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        
        return NextResponse.json(userWithoutPassword);
      } catch (inMemoryError) {
        console.error('In-memory database error:', inMemoryError);
        return NextResponse.json(
          { error: 'Failed to log in' },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error('Error logging in:', error);
    return NextResponse.json(
      { error: 'Failed to log in' },
      { status: 500 }
    );
  }
}

module.exports = {
  POST
};