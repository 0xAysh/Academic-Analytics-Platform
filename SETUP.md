# Setup Guide - Running the Repository Locally

## Prerequisites

- Node.js (v14+): `node --version`
- PostgreSQL (v12+): `psql --version`
- Git: `git --version`

## Quick Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd group-project-0xAysh
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start PostgreSQL
```bash
# Linux/Ubuntu
sudo systemctl start postgresql

# macOS (Homebrew)
brew services start postgresql

# Windows: Start PostgreSQL service from Services panel
```

### 4. Create Database
```bash
# Connect as superuser
sudo -u postgres psql
# or
psql -U postgres
```

```sql
CREATE DATABASE academic_dashboard;
CREATE USER your_db_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE academic_dashboard TO your_db_user;
\q
```

### 5. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# Database (use either DB_* or PG* format)
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASS=your_password
DB_NAME=academic_dashboard

# JWT Secret (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your_jwt_secret_key_here

# Server Port (optional, defaults to 3001)
PORT=3001
```

### 6. Run Database Migrations
```bash
node db/reset.js
```

### 7. Start Server
```bash
node server.js
```

Server runs at: `http://localhost:3001`

## Verify Setup

```bash
# Check database connection
psql -U your_db_user -d academic_dashboard

# List tables
\dt

# Exit
\q
```

## Troubleshooting

**Database connection fails:**
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Verify `.env` credentials
- Check database exists: `psql -U postgres -l`

**Port 3001 in use:**
- Change `PORT` in `.env` or kill process: `lsof -i :3001` then `kill -9 PID`

**Module not found:**
```bash
rm -rf node_modules && npm install
```

**Migration fails:**
- Check PostgreSQL logs
- Verify user permissions: `GRANT ALL PRIVILEGES ON DATABASE academic_dashboard TO your_db_user;`

## Useful Commands

```bash
# Reset database (WARNING: deletes all data)
node db/reset.js

# Export database
node export-database.js

# View database
psql -U your_db_user -d academic_dashboard
```

## Project Structure

```
group-project-0xAysh/
├── public/          # Frontend (HTML, JS, CSS)
├── db/              # Database (queries, migrations, reset.js)
├── routes/          # API routes
├── middleware/      # Express middleware
├── utils/           # Utility functions
├── server.js        # Server entry point
└── .env             # Environment variables
```
