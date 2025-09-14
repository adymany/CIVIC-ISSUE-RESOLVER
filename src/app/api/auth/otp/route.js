import { NextResponse } from 'next/server';
import dbAdapter from '@/lib/db-adapter';

// Generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/auth/otp - Send OTP to user's mobile
export async function POST(request) {
  try {
    const { mobile } = await request.json();

    if (!mobile) {
      return NextResponse.json(
        { error: 'Mobile number is required' },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Save OTP (in a real app, you would send it via WhatsApp)
    await dbAdapter.upsertOTP(mobile, otp, expiresAt);

    // In a real app, you would integrate with WhatsApp API here
    console.log(`OTP for ${mobile}: ${otp}`);

    return NextResponse.json({ 
      message: 'OTP sent successfully',
      // In a real app, you would not send the OTP in the response
      // otp: otp // Remove this in production
    });
  } catch (error) {
    console.error('OTP send error:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}

// PUT /api/auth/otp - Verify OTP
export async function PUT(request) {
  try {
    const { mobile, otp } = await request.json();

    if (!mobile || !otp) {
      return NextResponse.json(
        { error: 'Mobile number and OTP are required' },
        { status: 400 }
      );
    }

    // Find OTP record
    const otpRecord = await dbAdapter.findOTP(mobile);

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'OTP not found or expired' },
        { status: 404 }
      );
    }

    // Check if OTP is expired
    if (new Date() > new Date(otpRecord.expiresAt)) {
      await dbAdapter.deleteOTP(mobile); // Clean up expired OTP
      return NextResponse.json(
        { error: 'OTP has expired' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // OTP is valid, delete it
    await dbAdapter.deleteOTP(mobile);

    // Find or create user
    let user = await dbAdapter.findUserByMobile(mobile);
    
    if (!user) {
      // Create a new user if one doesn't exist
      user = await dbAdapter.createUser({
        email: `${mobile}@example.com`, // Generate a placeholder email
        password: 'default-password', // This should be reset by the user
        name: `User ${mobile}`,
        mobile,
        role: 'USER'
      });
    }

    // Return user (without password)
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('OTP verify error:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}