# cart-management-backend
Product &amp; Cart Management System with RBAC
#Cart Management System - Backend API
#A robust Node.js/Express backend with PostgreSQL database, JWT authentication, and role-based access control for managing products and shopping carts.

1. Clone the repository

  git clone <repository-url>
  
  cd backend
  
3. Install dependencies
   npm install

4. Setup PostgreSQL Database

    Login to PostgreSQL
   psql -U postgres

#Create database

CREATE DATABASE cart_management;

4. Configure Environment Variables

Create a .env file in the root directory:

PORT=3000

DB_USER=postgres

DB_HOST=localhost

DB_NAME=cart_management

DB_PASSWORD=your_postgres_password

DB_PORT=5432

JWT_SECRET=your-super-secret-jwt-key-change-in-production

6. Start the Server

# Development mode with nodemon
npm run dev

# Production mode
npm start
