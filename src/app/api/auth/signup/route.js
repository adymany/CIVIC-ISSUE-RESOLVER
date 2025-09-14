import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbAdapter from '@/lib/db-adapter';

// POST /api/auth/signup - Create a new user
export async function POST(request) {
  try {
    const { email, password, name, mobile, role } = await request.json();

    // Validate required fields
    if (!email || !password || !name || !mobile) {
      return NextResponse.json(
        { error: 'Email, password, name, and mobile are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await dbAdapter.findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await dbAdapter.createUser({
      email,
      password: hashedPassword,
      name,
      mobile,
      role: role || 'USER' // Default to USER role if not specified
    });

    // Return user (without password)
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}