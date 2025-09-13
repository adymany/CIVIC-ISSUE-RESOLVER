const { NextResponse } = require('next/server');
const prisma = require('@/lib/prisma').default;
const bcrypt = require('bcryptjs');
const inMemoryDb = require('@/lib/in-memory-db').default;

// POST /api/auth/signup - Create a new user
async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    try {
      // Try to use Prisma (PostgreSQL)
      const existingUser = await prisma.user.findUnique({
        where: {
          email,
        },
      });
      
      if (existingUser) {
        return NextResponse.json(
          { error: 'User already exists' },
          { status: 400 }
        );
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user in database
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
        },
      });
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      
      return NextResponse.json(userWithoutPassword, { status: 201 });
    } catch (prismaError) {
      console.log('Prisma database error, falling back to in-memory database:', prismaError);
      
      // Fallback to in-memory database
      try {
        const existingUser = await inMemoryDb.findUserByEmail(email);
        
        if (existingUser) {
          return NextResponse.json(
            { error: 'User already exists' },
            { status: 400 }
          );
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user in in-memory database
        const user = await inMemoryDb.createUser({
          email,
          password: hashedPassword,
          name,
          role: 'USER',
        });
        
        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        
        return NextResponse.json(userWithoutPassword, { status: 201 });
      } catch (inMemoryError) {
        console.error('In-memory database error:', inMemoryError);
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

module.exports = {
  POST
};