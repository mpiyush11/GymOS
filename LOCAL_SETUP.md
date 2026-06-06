# GYMOS V1 Local Development Setup

Follow these exact steps to spin up the GYMOS environment from a fresh clone.

## Prerequisites
*   Node.js (v18 or higher)
*   PostgreSQL (v15 or higher) running locally on port 5432.

## 1. Database Initialization
1. Open your terminal and connect to Postgres (`psql -U postgres`).
2. Create the database: `CREATE DATABASE gymos;`
3. Connect to it: `\c gymos`
4. Install UUID extension: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`

## 2. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env and ensure DATABASE_URL matches your local postgres credentials
   ```
4. Run Schema Migrations (Creates tables):
   ```bash
   node src/db/runMigrations.js
   ```
5. Run the Bootstrap Script (Creates Admin and Demo Gym):
   ```bash
   node src/utils/bootstrap.js
   ```
6. Start the server (runs on port 8080):
   ```bash
   npm run dev
   # (If no dev script exists, run: node index.js)
   ```

## 3. Frontend Setup
1. Open a second terminal and navigate to the frontend directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   # VITE_API_BASE_URL defaults to http://localhost:8080/api/v1 which is correct for local dev.
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```

## 4. Usage
*   Open your browser to `http://localhost:5173`
*   Log in using the bootstrapped credentials:
    *   **Admin:** `admin@gymos.in` / `Admin@123`
    *   **Owner:** `owner@demo.gymos.in` / `Owner@123`