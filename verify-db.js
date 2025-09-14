import { PrismaClient } from '@prisma/client';

async function verifyDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing database connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test creating a user
    console.log('Testing user creation...');
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'hashed_password_here',
        name: 'Test User',
        mobile: '1234567890',
        role: 'USER'
      }
    });
    console.log('✅ User created:', user.email);
    
    // Test finding the user
    console.log('Testing user lookup...');
    const foundUser = await prisma.user.findUnique({
      where: {
        email: 'test@example.com'
      }
    });
    console.log('✅ User found:', foundUser.email);
    
    // Test creating an OTP
    console.log('Testing OTP creation...');
    const otp = await prisma.oTP.create({
      data: {
        mobile: '1234567890',
        otp: '123456',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000)
      }
    });
    console.log('✅ OTP created for mobile:', otp.mobile);
    
    // Clean up test data
    console.log('Cleaning up test data...');
    await prisma.oTP.delete({
      where: {
        mobile: '1234567890'
      }
    });
    await prisma.user.delete({
      where: {
        email: 'test@example.com'
      }
    });
    console.log('✅ Test data cleaned up');
    
    await prisma.$disconnect();
    console.log('✅ Database verification completed successfully!');
  } catch (error) {
    console.error('❌ Database verification failed:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

verifyDatabase();