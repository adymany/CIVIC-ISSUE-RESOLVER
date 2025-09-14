// In-memory database implementation as a fallback
// This is used when PostgreSQL database is not available

class InMemoryDatabase {
  constructor() {
    this.users = [];
    this.reports = [];
    this.nextUserId = 1;
    this.nextReportId = 1;
  }

  // User methods
  async findUserByEmail(email) {
    const user = this.users.find(u => u.email === email);
    return user || null;
  }

  async findUserByMobile(mobile) {
    const user = this.users.find(u => u.mobile === mobile);
    return user || null;
  }

  async findUserById(id) {
    const user = this.users.find(u => u.id === id);
    return user || null;
  }

  async createUser(userData) {
    const newUser = {
      id: `user_${this.nextUserId++}`,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id, userData) {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) return null;
    
    this.users[userIndex] = {
      ...this.users[userIndex],
      ...userData,
      updatedAt: new Date()
    };
    
    return this.users[userIndex];
  }

  // Report methods
  async findReportById(id) {
    const report = this.reports.find(r => r.id === id);
    return report || null;
  }

  async createReport(reportData) {
    const newReport = {
      id: `report_${this.nextReportId++}`,
      ...reportData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.reports.push(newReport);
    return newReport;
  }

  async updateReport(id, reportData) {
    const reportIndex = this.reports.findIndex(r => r.id === id);
    if (reportIndex === -1) return null;
    
    this.reports[reportIndex] = {
      ...this.reports[reportIndex],
      ...reportData,
      updatedAt: new Date()
    };
    
    return this.reports[reportIndex];
  }

  // Add the missing updateReportStatus method
  async updateReportStatus(id, status) {
    return await this.updateReport(id, { status });
  }

  async findReports(where = {}) {
    return this.reports.filter(report => {
      // Simple filtering implementation
      if (where.status && report.status !== where.status) {
        return false;
      }
      return true;
    });
  }

  // Initialize with some default data
  async initialize() {
    // Create default admin user if it doesn't exist
    const adminExists = await this.findUserByEmail('admin@civicreporter.com');
    if (!adminExists) {
      await this.createUser({
        email: 'admin@civicreporter.com',
        mobile: '9876543210',
        password: '$2a$10$rZ7znSJhPdC9/UzX5BF6Ae5FQRyQOKH78ChA7oB4cwh/U4q.7EjaG', // admin123
        name: 'Admin User',
        role: 'ADMIN'
      });
    }

    // Create default regular user if it doesn't exist
    const userExists = await this.findUserByEmail('user@civicreporter.com');
    if (!userExists) {
      await this.createUser({
        email: 'user@civicreporter.com',
        mobile: '9876543211',
        password: '$2a$10$8K1p/a0dURXAm7QiTRqNa.E3YPWs8UkrpC497F5rG1EtI1L19g3O6', // user123
        name: 'Regular User',
        role: 'USER'
      });
    }

    // Create anonymous user if it doesn't exist
    const anonymousExists = await this.findUserByEmail('anonymous@civicreporter.com');
    if (!anonymousExists) {
      await this.createUser({
        email: 'anonymous@civicreporter.com',
        mobile: '0000000000',
        password: '$2a$10$8K1p/a0dURXAm7QiTRqNa.E3YPWs8UkrpC497F5rG1EtI1L19g3O6', // anonymous
        name: 'Anonymous User',
        role: 'USER'
      });
    }
  }
}

// Create singleton instance
const inMemoryDb = new InMemoryDatabase();

// Initialize with default data
inMemoryDb.initialize();

export default inMemoryDb;