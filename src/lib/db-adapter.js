// Database adapter that works with PostgreSQL via Prisma Data Proxy
import prisma from './prisma.js';

class DatabaseAdapter {
  constructor() {
    this.initialize();
  }

  async initialize() {
    try {
      // Check if PostgreSQL is available
      await prisma.$connect();
      console.log('Using PostgreSQL database via Prisma Data Proxy');
    } catch (error) {
      console.error('Failed to connect to database:', error.message);
      throw new Error('Database connection failed');
    }
  }

  // User methods
  async findUserByEmail(email) {
    return prisma.user.findUnique({
      where: { email }
    });
  }

  async findUserByMobile(mobile) {
    return prisma.user.findUnique({
      where: { mobile }
    });
  }

  async createUser(userData) {
    return prisma.user.create({
      data: userData
    });
  }

  // OTP methods with error handling
  async upsertOTP(mobile, otp, expiresAt) {
    try {
      return await prisma.oTP.upsert({
        where: { mobile },
        update: { otp, expiresAt },
        create: { mobile, otp, expiresAt }
      });
    } catch (error) {
      console.error('Error in upsertOTP:', error);
      // If OTP model doesn't exist, return null
      return null;
    }
  }

  async findOTP(mobile) {
    try {
      return await prisma.oTP.findUnique({
        where: { mobile }
      });
    } catch (error) {
      console.error('Error in findOTP:', error);
      // If OTP model doesn't exist, return null
      return null;
    }
  }

  async deleteOTP(mobile) {
    try {
      return await prisma.oTP.delete({
        where: { mobile }
      });
    } catch (error) {
      console.error('Error in deleteOTP:', error);
      // If OTP model doesn't exist, return null
      return null;
    }
  }

  // Report methods
  async createReport(reportData) {
    return prisma.report.create({
      data: reportData
    });
  }

  async findReports(where = {}) {
    return prisma.report.findMany({
      where
    });
  }

  async updateReport(id, reportData) {
    return prisma.report.update({
      where: { id },
      data: reportData
    });
  }

  // Add the missing findReportById method
  async findReportById(id) {
    return prisma.report.findUnique({
      where: { id }
    });
  }

  // Add the missing updateReportStatus method
  async updateReportStatus(id, status) {
    return prisma.report.update({
      where: { id },
      data: { status }
    });
  }
}

// Create singleton instance
const dbAdapter = new DatabaseAdapter();

export default dbAdapter;