// Database adapter that works with PostgreSQL via Prisma Data Proxy
import prisma from './prisma.js';

// Helper function to validate and clean image data
function cleanImageData(imageUrl) {
  if (!imageUrl) return null;
  
  // If it's a data URL, check if it's reasonable size
  if (imageUrl.startsWith('data:image/')) {
    // If it's too long, it might be corrupted
    if (imageUrl.length > 100000) { // 100KB limit
      console.warn('Image data URL is too long, rejecting');
      return null; // Return null instead of a corrupted marker
    }
    
    // Additional validation for base64 data URLs
    try {
      // Check if it's a valid data URL format
      const dataUrlRegex = /^data:image\/(png|jpg|jpeg|gif);base64,[A-Za-z0-9+/=]+$/;
      if (!dataUrlRegex.test(imageUrl)) {
        console.warn('Invalid image data URL format');
        return null;
      }
      
      return imageUrl;
    } catch (error) {
      console.warn('Error validating image data URL:', error.message);
      return null;
    }
  }
  
  // For regular URLs, validate they look like URLs
  if (imageUrl.startsWith('http')) {
    try {
      new URL(imageUrl); // This will throw if it's not a valid URL
      return imageUrl;
    } catch (error) {
      console.warn('Invalid image URL:', imageUrl);
      return null;
    }
  }
  
  // If it's neither a data URL nor a regular URL, it's likely corrupted
  console.warn('Unrecognized image URL format:', imageUrl);
  return null;
}

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
    // Clean and validate image data before storing
    const cleanedReportData = {
      ...reportData,
      imageUrl: cleanImageData(reportData.imageUrl)
    };
    
    return prisma.report.create({
      data: cleanedReportData
    });
  }

  async findReports(where = {}) {
    return prisma.report.findMany({
      where
    });
  }

  async updateReport(id, reportData) {
    // Clean and validate image data before storing
    const cleanedReportData = {
      ...reportData,
      imageUrl: reportData.imageUrl !== undefined ? cleanImageData(reportData.imageUrl) : undefined
    };
    
    return prisma.report.update({
      where: { id },
      data: cleanedReportData
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

  // Add deleteReport method
  async deleteReport(id) {
    return prisma.report.delete({
      where: { id }
    });
  }
}

// Create singleton instance
const dbAdapter = new DatabaseAdapter();

export default dbAdapter;