const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminEmail = 'admin@civicreporter.com';
  const adminPassword = 'admin123';
  
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });
  
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Admin User',
        role: 'ADMIN',
      },
    });
    
    console.log('Created admin user:', admin.email);
  } else {
    console.log('Admin user already exists');
  }
  
  // Create sample user
  const userEmail = 'user@civicreporter.com';
  const userPassword = 'user123';
  
  const existingUser = await prisma.user.findUnique({
    where: { email: userEmail },
  });
  
  if (!existingUser) {
    const hashedPassword = await bcrypt.hash(userPassword, 10);
    
    const user = await prisma.user.create({
      data: {
        email: userEmail,
        password: hashedPassword,
        name: 'Regular User',
        role: 'USER',
      },
    });
    
    console.log('Created sample user:', user.email);
  } else {
    console.log('Sample user already exists');
  }
  
  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });