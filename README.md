# Civic Reporting System

A web-based platform that allows citizens to report civic issues such as infrastructure problems, environmental concerns, or public service requests directly to local authorities.

This application is now deployed on Vercel and can be accessed at: [INSERT_YOUR_VERCEL_URL_HERE]

## Features

- User Authentication (Login/Signup)
- Report Submission with descriptions, images, and geolocation
- Report Dashboard for viewing submitted reports and their status
- Admin Dashboard for managing reports
- Camera and geolocation integration

## Technology Stack

- **Frontend**: React 18.2.0, Next.js 15.5.3, Tailwind CSS, JavaScript
- **Backend**: Next.js API Routes, Prisma ORM, PostgreSQL
- **Authentication**: next-auth, bcryptjs

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- PostgreSQL database (optional - in-memory database provided for development)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd civic-reporting-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   
   **Option 1: PostgreSQL (Recommended for production)**
   - Install PostgreSQL on your system
   - Create a database named `civic_reporting_system`
   - Update the `DATABASE_URL` in the `.env` file with your database credentials
   - Run the database setup:
     ```bash
     npm run setup-db
     ```

   **Option 2: In-Memory Database (For development/testing)**
   - The system automatically falls back to an in-memory database if PostgreSQL is not available
   - No additional setup required

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000` (or the port shown in the terminal)

### Default User Accounts

For testing purposes, the system creates the following accounts automatically:

- **Admin User**: 
  - Email: `admin@civicreporter.com`
  - Password: `admin123`

- **Regular User**: 
  - Email: `user@civicreporter.com`
  - Password: `user123`

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run setup-db` - Set up the database (PostgreSQL)
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run Prisma migrations
- `npm run prisma:seed` - Seed the database with test data

## Project Structure

```
.
├── prisma/                 # Prisma schema and migrations
├── public/                 # Static assets and test files
├── src/
│   ├── app/                # Next.js app router pages
│   │   ├── api/            # API routes
│   │   ├── dashboard/      # Admin dashboard page
│   │   ├── report/         # Report submission page
│   │   └── ...             # Other pages
│   ├── components/         # React components
│   └── lib/                # Utility functions and database clients
├── .env                    # Environment variables
├── next.config.js          # Next.js configuration
├── package.json            # Project dependencies and scripts
├── jsconfig.json           # JavaScript configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── postcss.config.mjs      # PostCSS configuration
```

## API Endpoints

- `POST /api/auth/signup` - Create a new user
- `POST /api/auth/login` - Authenticate a user
- `POST /api/reports` - Create a new report
- `GET /api/reports` - Get all reports
- `GET /api/reports/[id]` - Get a specific report
- `PATCH /api/reports/[id]` - Update a report's status
- `GET /api/test-db` - Test database connection

## Development

The application uses Next.js App Router with server components for API handling. The database layer uses Prisma ORM with a fallback to an in-memory database for development.

## Troubleshooting

1. **Database Connection Issues**: 
   - Ensure PostgreSQL is running
   - Check your `DATABASE_URL` in the `.env` file
   - Run `npm run db:setup` to initialize the database

2. **Port Conflicts**:
   - The app will automatically use an available port if 3000 is in use

3. **Missing Dependencies**:
   - Run `npm install` to ensure all dependencies are installed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License.