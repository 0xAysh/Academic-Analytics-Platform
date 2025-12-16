# Setup Guide

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Quick Setup

### 1. Clone Repository
```bash
git clone https://github.com/CSC317-F25/group-project-0xAysh.git
cd group-project-0xAysh
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up PostgreSQL Database

Create database and user:
```sql
CREATE DATABASE academic_dashboard;
CREATE USER your_db_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE academic_dashboard TO your_db_user;
```

### 4. Configure Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASS=your_password
DB_NAME=academic_dashboard
JWT_SECRET=your_jwt_secret_here
PORT=3001
```

Generate JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Run Database Migrations
```bash
node db/reset.js
```

### 6. Start Server
```bash
node server.js
```

Server will run on `http://localhost:3001`

## Troubleshooting

**Database connection fails:**
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Check `.env` file has correct credentials
- Ensure database exists: `psql -U postgres -l`

**Port already in use:**
- Change `PORT` in `.env` file
- Or kill process using port 3001: `lsof -ti:3001 | xargs kill`

**Module not found errors:**
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then reinstall

## Database Management

**Reset database (WARNING: deletes all data):**
```bash
node db/reset.js
```

**Export database:**
```bash
node export-database.js
```

**Import backup:**
```bash
pg_restore -U your_db_user -d academic_dashboard backup-2025-11-19.tar
```

