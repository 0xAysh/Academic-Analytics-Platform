# Academic Analytics Platform

**CSC 317 — Group Project Milestone 4**

A full-stack web application for managing and visualizing academic transcript data.

---

## Installation & Setup

For detailed setup instructions, see [SETUP.md](SETUP.md).

Quick start:
1. Clone repository: `git clone <repository-url>`
2. Install dependencies: `npm install`
3. Set up PostgreSQL database
4. Copy `.env.example` to `.env` and configure
5. Run migrations: `node db/reset.js`
6. Start server: `node server.js`

---

## Environment Variables

See `.env.example` for template. Required variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` or `PGHOST` | PostgreSQL host | `localhost` |
| `DB_PORT` or `PGPORT` | PostgreSQL port | `5432` |
| `DB_USER` or `PGUSER` | Database user | `your_db_user` |
| `DB_PASS` or `PGPASSWORD` | Database password | `your_password` |
| `DB_NAME` or `PGDATABASE` | Database name | `academic_dashboard` |
| `JWT_SECRET` | Secret key for JWT tokens | Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `PORT` | Server port (optional) | `3001` |

**Note**: The project supports both `DB_*` and `PG*` environment variable formats. Use one format consistently.

---

## Database Schema

### Tables

#### users
- `id` (SERIAL PRIMARY KEY) - User ID
- `email` (VARCHAR(255) UNIQUE NOT NULL) - User email
- `password_hash` (VARCHAR(255) NOT NULL) - Hashed password
- `name` (VARCHAR(255)) - User's full name

#### transcripts
- `id` (SERIAL PRIMARY KEY) - Transcript ID
- `user_id` (INTEGER UNIQUE NOT NULL) - Foreign key to users.id
- `degree` (VARCHAR(255)) - Degree program

#### terms
- `id` (SERIAL PRIMARY KEY) - Term ID
- `transcript_id` (INTEGER NOT NULL) - Foreign key to transcripts.id
- `term_code` (VARCHAR(50)) - Term code (e.g., "SP2024")
- `term_name` (VARCHAR(255)) - Term name
- `term_gpa` (DECIMAL(3,2)) - Term GPA
- `credits` (DECIMAL(5,2)) - Total credits
- `earned_credits` (DECIMAL(5,2)) - Earned credits
- `points` (DECIMAL(6,2)) - GPA points
- `is_planned` (BOOLEAN DEFAULT FALSE) - Whether term is planned

#### courses
- `id` (SERIAL PRIMARY KEY) - Course ID
- `term_id` (INTEGER NOT NULL) - Foreign key to terms.id
- `code` (VARCHAR(50)) - Course code
- `name` (VARCHAR(255)) - Course name
- `units` (DECIMAL(4,2)) - Course units
- `earned_units` (DECIMAL(4,2)) - Earned units
- `grade` (VARCHAR(10)) - Course grade
- `points` (DECIMAL(5,2)) - GPA points for course

### Relationships

- `users` → `transcripts` (1:1) - One transcript per user
- `transcripts` → `terms` (1:many) - Multiple terms per transcript
- `terms` → `courses` (1:many) - Multiple courses per term

### Indexes

- `idx_transcripts_user_id` on `transcripts(user_id)`
- `idx_terms_transcript_id` on `terms(transcript_id)`
- `idx_courses_term_id` on `courses(term_id)`
- `idx_terms_term_code` on `terms(term_code)`

---

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required | Request Body | Response |
|--------|----------|-------------|----------------|--------------|----------|
| POST | `/api/auth/register` | Register new user | No | `{ email, password, name? }` | `{ success: true, data: { user, token } }` |
| POST | `/api/auth/login` | Login user | No | `{ email, password }` | `{ success: true, data: { user, token } }` |
| POST | `/api/auth/logout` | Logout user | No | None | `{ success: true, message }` |
| PUT | `/api/auth/profile` | Update user profile | Yes | `{ email?, name?, password? }` | `{ success: true, data: { user } }` |
| PUT | `/api/auth/password` | Change password | Yes | `{ currentPassword, newPassword }` | `{ success: true, message }` |

**Authentication**: Protected endpoints require `Authorization: Bearer <token>` header.

### Transcript Endpoints

| Method | Endpoint | Description | Auth Required | Request Body | Response |
|--------|----------|-------------|----------------|--------------|----------|
| GET | `/api/transcripts` | Get user's transcript | Yes | None | `{ success: true, data: transcript \| null }` |
| POST | `/api/transcripts` | Save new transcript | Yes | Transcript data object | `{ success: true, data: transcript }` |
| PUT | `/api/transcripts` | Update transcript | Yes | Transcript data object | `{ success: true, data: transcript }` |

**Transcript Data Structure**:
```json
{
  "studentInfo": {
    "name": "Student Name",
    "degree": "Degree Program"
  },
  "terms": [
    {
      "term": "SP2024",
      "termName": "Spring 2024",
      "termGPA": 3.5,
      "credits": 15.0,
      "earnedCredits": 15.0,
      "points": 52.5,
      "isPlanned": false,
      "courses": [
        {
          "code": "CSC 317",
          "name": "Web Development",
          "units": 3.0,
          "earnedUnits": 3.0,
          "grade": "A",
          "points": 12.0
        }
      ]
    }
  ]
}
```

---

## Feature Overview

### Implemented Features

1. **User Authentication**
   - Registration with email validation
   - Login with JWT tokens (4-hour expiry)
   - Profile management (email, name)
   - Secure password change

2. **Transcript Management**
   - PDF parsing (client-side)
   - Text file import
   - JSON import
   - Manual editing interface
   - Data sanitization
   - Chronological term sorting

3. **Dashboard & Analytics**
   - Cumulative GPA calculation
   - Semester-by-semester breakdown
   - Interactive charts (GPA trends, grade distribution, credits)
   - Course breakdown table
   - Strength analysis
   - On-going semester support

4. **Data Visualization**
   - Customizable plot controls
   - Responsive charts (Chart.js)
   - Dynamic updates

5. **User Interface**
   - Responsive design
   - Protected routes
   - Real-time notifications
   - Loading states
   - Error handling

---

## Known Limitations

1. **PDF Parser**: Basic parser may not handle all transcript formats; complex layouts may require manual entry.

2. **Mobile Responsiveness**: Chart visualizations may not be optimal on very small screens.

3. **Error Recovery**: No partial data recovery if PDF parsing fails.

4. **Data Validation**: Some edge cases in transcript formats may not be caught.

5. **Performance**: Large transcript files (100+ courses) may take longer to parse and render.

6. **Accessibility**: Some interactive elements could benefit from better keyboard navigation; screen reader support for charts could be enhanced.

---

## Database Export

A database backup file is included in the repository: `backup-2025-11-19.tar`

To export a fresh backup:
```bash
node export-database.js
```

To import the included backup:
```bash
pg_restore -U your_db_user -d academic_dashboard backup-2025-11-19.tar
```

Or for SQL format:
```bash
psql -U your_db_user -d academic_dashboard < backup.sql
```