# MyBudget - Complete Application Documentation

## Table of Contents
1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Database Schema](#database-schema)
5. [Features](#features)
6. [API Endpoints](#api-endpoints)
7. [Authentication](#authentication)
8. [Theme System](#theme-system)
9. [Getting Started](#getting-started)
10. [Configuration](#configuration)

---

## Overview

MyBudget is an AI-powered budget planning and expense tracking web application. It helps users manage their finances by tracking income and expenses, setting monthly budgets, visualizing spending patterns through charts, and generating exportable reports.

### Key Features
- User authentication (signup/login/logout)
- Transaction management (income & expenses)
- Category management with color coding
- Monthly budget setting and tracking
- Visual reports with charts (pie, line, bar, area)
- Export to Excel and PDF
- Dark/Light mode toggle
- Responsive design for mobile and desktop

---

## Technology Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework with App Router |
| **TypeScript** | Type safety and better developer experience |
| **Tailwind CSS** | Utility-first CSS framework |
| **Prisma ORM** | Database access and migrations |
| **SQLite** | Local database (development) |
| **Zustand** | State management |
| **jose** | JWT token handling |
| **bcrypt** | Password hashing |
| **Recharts** | Chart components |
| **xlsx** | Excel file generation |
| **jsPDF** | PDF generation |
| **lucide-react** | Icon library |

---

## Project Structure

```
d:\Web App\
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── dev.db                 # SQLite database file
├── src/
│   ├── app/
│   │   ├── (auth)/            # Authentication pages
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (dashboard)/       # Protected dashboard pages
│   │   │   ├── budgets/
│   │   │   ├── categories/
│   │   │   ├── dashboard/
│   │   │   ├── reports/
│   │   │   ├── settings/
│   │   │   └── transactions/
│   │   ├── api/               # API routes
│   │   │   ├── auth/
│   │   │   ├── budgets/
│   │   │   ├── categories/
│   │   │   ├── dashboard/
│   │   │   ├── export/
│   │   │   ├── reports/
│   │   │   ├── transactions/
│   │   │   └── user/
│   │   ├── globals.css        # Global styles & CSS variables
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── charts/            # Chart components
│   │   ├── layout/            # Layout components (Sidebar, Header)
│   │   ├── ui/                # Reusable UI components
│   │   └── ThemeProvider.tsx  # Theme context provider
│   ├── lib/
│   │   ├── auth.ts            # Authentication utilities
│   │   ├── db.ts              # Prisma client
│   │   └── utils.ts           # Helper functions
│   ├── stores/
│   │   ├── authStore.ts       # Authentication state
│   │   └── themeStore.ts      # Theme state
│   └── middleware.ts          # Route protection
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

---

## Database Schema

### User
| Field | Type | Description |
|-------|------|-------------|
| id | String | Unique identifier (UUID) |
| email | String | User's email (unique) |
| password | String | Hashed password |
| name | String? | Display name |
| currency | String | Preferred currency (default: USD) |
| timezone | String | User's timezone |
| monthStartDay | Int | Day of month to start budget period (1-28) |
| createdAt | DateTime | Account creation date |
| updatedAt | DateTime | Last update date |

### Category
| Field | Type | Description |
|-------|------|-------------|
| id | String | Unique identifier |
| name | String | Category name |
| type | String | "income" or "expense" |
| color | String | Hex color code |
| icon | String? | Icon name |
| isDefault | Boolean | System default category |
| parentId | String? | Parent category (for subcategories) |
| userId | String | Owner user ID |

### Transaction
| Field | Type | Description |
|-------|------|-------------|
| id | String | Unique identifier |
| amount | Float | Transaction amount |
| type | String | "income" or "expense" |
| description | String | Transaction description |
| date | DateTime | Transaction date |
| paymentMethod | String? | Cash, Card, Bank Transfer, etc. |
| notes | String? | Additional notes |
| tags | String? | Comma-separated tags |
| isRecurring | Boolean | Recurring transaction flag |
| categoryId | String | Associated category |
| userId | String | Owner user ID |

### Budget
| Field | Type | Description |
|-------|------|-------------|
| id | String | Unique identifier |
| amount | Float | Budget limit |
| month | String | Month in YYYY-MM format |
| categoryId | String | Associated category |
| userId | String | Owner user ID |

---

## Features

### 1. Dashboard
- Total balance overview
- Monthly income vs expenses summary
- Recent transactions list
- Spending by category (pie chart)
- Income vs Expenses trend (line chart)

### 2. Transactions
- Add new income/expense transactions
- Edit existing transactions
- Delete transactions
- Filter by type, category, date range
- Search transactions

### 3. Budgets
- Set monthly budget limits per category
- Visual progress bars showing spent vs budget
- Budget alerts when approaching limits
- Monthly budget overview

### 4. Categories
- Create custom categories
- Edit category name and color
- Delete unused categories
- Separate income and expense categories
- Default system categories

### 5. Reports
- Monthly spending reports
- Multiple chart visualizations:
  - Pie chart (spending by category)
  - Line chart (daily trend)
  - Bar chart (category comparison)
  - Area chart (cumulative spending)
- Export to Excel (.xlsx)
- Export to PDF

### 6. Settings
- Update profile information
- Change password
- Set preferred currency
- Configure timezone
- Set month start day

### 7. Theme System
- Light mode
- Dark mode
- System preference detection
- Persistent theme selection

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create new account |
| POST | `/api/auth/login` | Login to account |
| POST | `/api/auth/logout` | Logout (clear session) |
| GET | `/api/auth/me` | Get current user |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List all categories |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/[id]` | Update category |
| DELETE | `/api/categories/[id]` | Delete category |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | List transactions (with filters) |
| POST | `/api/transactions` | Create transaction |
| PUT | `/api/transactions/[id]` | Update transaction |
| DELETE | `/api/transactions/[id]` | Delete transaction |

### Budgets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/budgets` | List budgets for month |
| POST | `/api/budgets` | Create/Update budget |
| DELETE | `/api/budgets/[id]` | Delete budget |

### Reports & Export
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports` | Get monthly report data |
| GET | `/api/dashboard` | Get dashboard summary |
| POST | `/api/export/excel` | Generate Excel report |
| POST | `/api/export/pdf` | Generate PDF report |

### User Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/api/user/settings` | Update user settings |

---

## Authentication

MyBudget uses JWT (JSON Web Tokens) for authentication:

1. **Signup**: User creates account with email and password
2. **Password Storage**: Passwords are hashed using bcrypt (10 rounds)
3. **Login**: On successful login, JWT token is generated and stored in HTTP-only cookie
4. **Session**: Token expires after 7 days
5. **Protected Routes**: Middleware checks for valid token on dashboard routes
6. **Logout**: Token cookie is cleared

### Security Features
- HTTP-only cookies (prevents XSS)
- Password hashing with bcrypt
- JWT token expiration
- Route protection middleware

---

## Theme System

The application supports three theme modes:

### Implementation
1. **CSS Variables**: Colors defined in `globals.css`
2. **Class-based switching**: `.dark` class on `<html>` element
3. **Zustand Store**: Theme state with localStorage persistence
4. **ThemeProvider**: Applies theme class based on store state

### Theme Variables
```css
/* Light Mode */
--background: #f8fafc;
--background-secondary: #ffffff;
--text-primary: #1e293b;
--primary: #6366f1;

/* Dark Mode */
--background: #0f172a;
--background-secondary: #1e293b;
--text-primary: #f1f5f9;
--primary: #818cf8;
```

---

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Prisma Studio (database GUI) |

---

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database URL (SQLite for development)
DATABASE_URL="file:./dev.db"

# JWT Secret (change in production!)
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
```

### Production Deployment

For production, consider:

1. **Database**: Switch to PostgreSQL or MySQL
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **Environment Variables**: Set secure JWT_SECRET

3. **Hosting**: Deploy to Vercel, Railway, or similar platforms

---

## Data Storage

### Local Development
- **Location**: `d:\Web App\prisma\dev.db`
- **Type**: SQLite database file
- **View Data**: Run `npm run db:studio` to open Prisma Studio

### Database Management
- **Prisma Studio**: Visual database editor at `http://localhost:5555`
- **Migrations**: Use `npx prisma migrate dev` for schema changes
- **Reset**: Use `npx prisma db push --force-reset` to reset database

---

## Support

For issues or questions:
1. Check the console for error messages
2. Verify database connection
3. Ensure all dependencies are installed
4. Check that environment variables are set

---

*Documentation generated for MyBudget v1.0*
*Last updated: December 2024*
