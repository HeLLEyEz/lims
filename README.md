# Lab Inventory Management System (LIMS)

A comprehensive electronic lab inventory management system built with Next.js, TypeScript, Prisma, and Supabase. This system provides real-time inventory tracking, user role management, analytics, and automated alerts for laboratory components and supplies.


## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [User Roles & Access](#user-roles--access)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Known Limitations](#known-limitations)
- [Future Improvements](#future-improvements)
- [License](#license)

## ✨ Features

### 🔐 Authentication & Authorization
- **Multi-role User System**: Admin, Lab Technician, Researcher, Manufacturing Engineer, and User roles
- **Secure Authentication**: Password-based login with bcrypt encryption
- **Role-based Access Control**: Different dashboards and permissions for each role
- **Session Management**: Persistent login sessions with localStorage

### 📦 Inventory Management
- **Component Tracking**: Complete inventory of electronic components
- **Category Management**: Organized component categories (Resistors, Capacitors, ICs, etc.)
- **Stock Monitoring**: Real-time quantity tracking with low-stock alerts
- **Location Management**: Bin and shelf location tracking
- **Pricing Information**: Unit price tracking and total inventory value

### 📊 Analytics & Reporting
- **Dashboard Analytics**: Real-time charts and statistics
- **Transaction History**: Complete inward/outward transaction logs
- **Trend Analysis**: Monthly and custom date range analytics
- **Low Stock Reports**: Automated alerts for items below threshold
- **Old Stock Reports**: Identification of stagnant inventory

### 🔄 Transaction Management
- **Inward Transactions**: Stock addition with reason and project tracking
- **Outward Transactions**: Stock removal with validation
- **Project Tracking**: Associate transactions with specific projects
- **User Attribution**: Track who performed each transaction

### 🎨 User Interface
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Interactive Charts**: Recharts-based analytics visualization
- **Real-time Updates**: Live data updates without page refresh
- **Mobile Responsive**: Works seamlessly on all devices

## 🛠️ Technology Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe JavaScript development
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Recharts**: Data visualization library
- **React Hook Form**: Form handling and validation
- **Zod**: Schema validation

### Backend
- **Next.js API Routes**: Server-side API endpoints
- **Prisma ORM**: Database toolkit and ORM
- **Supabase**: PostgreSQL database and hosting
- **bcryptjs**: Password hashing and verification

### Database
- **PostgreSQL**: Primary database (hosted on Supabase)
- **Prisma Migrations**: Database schema management

### Development Tools
- **ESLint**: Code linting
- **TypeScript**: Static type checking
- **tsx**: TypeScript execution for scripts

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (API Routes)  │◄──►│   (Supabase)    │
│                 │    │                 │    │                 │
│ • React         │    │ • Prisma ORM    │    │ • PostgreSQL    │
│ • TypeScript    │    │ • bcryptjs      │    │ • Row Level     │
│ • Tailwind CSS  │    │ • Validation    │    │   Security      │
│ • Recharts      │    │ • Error Handling│    │ • Real-time     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Architectural Decisions

1. **Full-Stack Next.js**: Single codebase for frontend and backend
2. **TypeScript First**: Type safety across the entire application
3. **Prisma ORM**: Type-safe database queries and migrations
4. **Supabase**: Managed PostgreSQL with built-in security
5. **Component-Based UI**: Reusable UI components with Radix UI
6. **Client-Side State**: React Context for authentication state

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**
- **Supabase Account** (for database hosting)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/lims.git
cd lims
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the project root:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

Replace:
- `[YOUR-PASSWORD]` with your Supabase database password
- `[PROJECT-REF]` with your Supabase project reference ID

## 🗄️ Database Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project reference ID and database password

### 2. Set Up Database Schema

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed database with sample data
npx tsx scripts/seed.ts
```

### 3. Verify Setup

```bash
# Check database connection
npx prisma studio
```

## 🏃‍♂️ Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## 👥 User Roles & Access

### Default Login Credentials

After seeding the database, you can access the system with:

**Admin User:**
- Email: `admin@lab.com`
- Password: `admin123`
- Role: `ADMIN`

### Role Descriptions

#### 🔧 Admin
- **Access**: Full system access
- **Features**:
  - User management
  - System configuration
  - All inventory operations
  - Analytics and reports
  - Database management

#### 🔬 Lab Technician
- **Access**: `/lab-tech`
- **Features**:
  - Component management
  - Transaction processing
  - Stock monitoring
  - Basic reports

#### 🧪 Researcher
- **Access**: `/researcher`
- **Features**:
  - Component search
  - Transaction history
  - Project-based tracking
  - Limited inventory operations

#### 🏭 Manufacturing Engineer
- **Access**: `/manufacturing`
- **Features**:
  - Production component tracking
  - Bulk operations
  - Manufacturing reports
  - Supply chain management

#### 👤 User
- **Access**: `/user`
- **Features**:
  - Component search
  - View inventory
  - Basic transaction history
  - Read-only access

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/login`
Login with email and password.

**Request:**
```json
{
  "email": "admin@lab.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "email": "admin@lab.com",
    "role": "ADMIN",
    "firstName": "Admin",
    "lastName": "User"
  },
  "message": "Login successful"
}
```

### Component Endpoints

#### GET `/api/components`
Get all components with pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search term
- `category`: Category filter

#### POST `/api/components`
Create a new component.

**Request:**
```json
{
  "name": "Arduino Uno R3",
  "manufacturer": "Arduino",
  "partNumber": "ARDUINO-UNO-R3",
  "quantity": 10,
  "unitPrice": 450.00,
  "categoryId": "category_id"
}
```

### Transaction Endpoints

#### GET `/api/transactions`
Get transaction history.

#### POST `/api/transactions`
Create a new transaction.

**Request:**
```json
{
  "componentId": "component_id",
  "type": "OUTWARD",
  "quantity": 5,
  "reason": "IoT project",
  "project": "Smart Home System"
}
```

## 📁 Project Structure

```
lims/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   │   └── login/
│   ├── admin/                    # Admin dashboard
│   │   ├── dashboard/
│   │   ├── overview/
│   │   ├── components/
│   │   ├── transactions/
│   │   ├── users/
│   │   ├── reports/
│   │   └── system/
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   ├── components/
│   │   ├── transactions/
│   │   └── users/
│   ├── lab-tech/                 # Lab technician pages
│   ├── researcher/               # Researcher pages
│   ├── manufacturing/            # Manufacturing pages
│   └── user/                     # General user pages
├── components/                   # Reusable UI components
│   ├── ui/                       # Base UI components
│   ├── dashboard/                # Dashboard components
│   ├── inventory/                # Inventory components
│   └── auth/                     # Authentication components
├── contexts/                     # React contexts
│   └── AuthContext.tsx
├── lib/                          # Utility libraries
│   ├── prisma.ts                 # Prisma client
│   ├── auth.ts                   # Authentication utilities
│   └── utils.ts                  # General utilities
├── prisma/                       # Database schema
│   └── schema.prisma
├── scripts/                      # Database scripts
│   └── seed.ts                   # Database seeding
└── public/                       # Static assets
```

## ⚠️ Known Limitations

### Current Limitations

1. **Authentication**: 
   - No password reset functionality
   - No email verification
   - No OAuth integration

2. **Database**:
   - No real-time subscriptions
   - Limited backup options
   - No data export functionality

3. **Features**:
   - No barcode/QR code scanning
   - No bulk import/export
   - No advanced search filters
   - No email notifications

4. **Performance**:
   - No caching layer
   - No CDN for static assets
   - Limited pagination for large datasets

5. **Security**:
   - No rate limiting
   - No audit logging
   - Basic input validation

## 🔮 Future Improvements

1. **Enhanced Authentication**:
   - [ ] Password reset functionality
   - [ ] Email verification
   - [ ] OAuth integration (Google, GitHub)
   - [ ] Two-factor authentication

2. **Advanced Features**:
   - [ ] Barcode/QR code scanning
   - [ ] Bulk import/export (CSV, Excel)
   - [ ] Advanced search and filters
   - [ ] Email notifications

3. **User Experience**:
   - [ ] Dark mode support
   - [ ] Mobile app (React Native)
   - [ ] Offline functionality
   - [ ] Progressive Web App (PWA)

4. **Analytics & Reporting**:
   - [ ] Advanced analytics dashboard
   - [ ] Custom report builder
   - [ ] Data visualization improvements
   - [ ] Export reports (PDF, Excel)

5. **Advanced Features**:
   - [ ] AI-powered demand forecasting
   - [ ] Automated reordering
   - [ ] Predictive maintenance
   - [ ] Machine learning insights


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://prisma.io/) - Database toolkit
- [Supabase](https://supabase.com/) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Radix UI](https://www.radix-ui.com/) - UI primitives

