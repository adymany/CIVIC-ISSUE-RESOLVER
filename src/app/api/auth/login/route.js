import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbAdapter from '@/lib/db-adapter';

// POST /api/auth/login - Authenticate a user
export async function POST(request) {
  try {
    const { email, password, mobile } = await request.json();

    // Validate input
    if ((!email || !password) && !mobile) {
      return NextResponse.json(
        { error: 'Email and password or mobile number are required' },
        { status: 400 }
      );
    }

    let user;

    // Find user by email or mobile
    if (email) {
      user = await dbAdapter.findUserByEmail(email);
    } else if (mobile) {
      user = await dbAdapter.findUserByMobile(mobile);
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password if email/password login
    if (email && password) {
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }
    }

    // Return user (without password)
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}