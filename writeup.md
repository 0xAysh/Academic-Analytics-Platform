# Project Write-Up

## Team Information

Team Name: [Your Team Name Here]

Team Members:
- Dhrumil Kanadiya - GitHub: https://github.com/DhrumilKanadiya
- Abhishek Rangani - GitHub: https://github.com/abhie2005
- Ayush Rangrej    - GitHub: https://github.com/0xAysh

Repository Link: https://github.com/CSC317-F25/group-project-0xAysh

---

## Description of What We Implemented

We have built a full-stack Academic Analytics Platform that allows students to upload, manage, and visualize their academic transcript data. The application provides comprehensive GPA tracking, interactive data visualizations, and detailed academic performance analytics.

### Core Features

#### 1. Authentication System
- User registration and login with secure password hashing (bcrypt)
- JWT-based authentication with 4-hour token expiry
- Protected routes and API endpoints
- "Remember me" functionality for login convenience
- User profile management (email and name updates)
- Secure password change functionality with current password verification

#### 2. Transcript Management
- PDF Parsing: Client-side PDF parsing using PDF.js to extract transcript data from PDF files
- Text File Support: Support for plain text transcript files
- JSON Import: Ability to import transcript data in JSON format
- Data Sanitization: Automatic removal of sensitive information before storage
- Manual Editing: Full transcript editing interface with chronological term listing
- Real-time Calculations: Automatic GPA and credit calculations when editing courses

#### 3. Dashboard & Analytics
- Overall Metrics: Cumulative GPA, total credits earned, and semester-by-semester breakdown
- Interactive Charts:
  - GPA trend line chart showing progression over time
  - Grade distribution pie chart
  - Credits earned bar chart per semester
- Course Breakdown Table: Detailed view of all courses with grades and GPA points
- Strength Analysis: Identification of strong areas and areas for improvement
- On-going Semester Support: Displays semesters with courses but incomplete grades

#### 4. Data Visualization
- Customizable plot controls for chart configuration
- Responsive chart rendering using Chart.js
- Dynamic chart updates based on transcript data
- Export-ready visualizations

#### 5. Database Architecture
- PostgreSQL database with normalized schema
- User authentication and transcript data storage
- Efficient querying with proper indexing
- Data integrity with foreign key constraints and cascading deletes
- Database export/import functionality for backups

#### 6. User Interface
- Clean, modern design with consistent styling
- Responsive layout for various screen sizes
- Intuitive navigation with protected routes
- Real-time notifications for user actions
- Loading states and error handling
- Accessibility considerations (semantic HTML, proper alt text)

### Technical Stack

- Frontend: HTML5, CSS3, Vanilla JavaScript (ES6 modules)
- Backend: Node.js with Express.js
- Database: PostgreSQL
- Libraries: 
  - Chart.js for data visualization
  - PDF.js for PDF parsing
  - JWT for authentication
  - bcryptjs for password hashing

### Code Organization

- Modular Architecture: Separated concerns with dedicated modules for API calls, data management, utilities, and page-specific logic
- Convention Adherence: 
  - kebab-case for CSS classes
  - camelCase for JavaScript variables and functions
  - snake_case for database fields
  - External CSS files (no inline styles)
  - Proper HTML5 semantic structure
- Error Handling: Comprehensive error handling at API, database, and client levels
- Code Quality: JSDoc documentation, consistent naming, and maintainable structure

---

## Problems Encountered and How We Solved Them

### 1. Inline Styles and CSS Organization
Problem: CSS code was embedded directly in HTML files, violating separation of concerns and making maintenance difficult.

Solution: 
- Extracted all inline `<style>` blocks into external CSS files
- Created dedicated CSS files for page-specific styles (`pages/auth.css`)
- Moved reusable component styles to `components.css`
- Replaced all inline `style=""` attributes with CSS utility classes
- Implemented utility classes (`.hidden`, `.show`, `.flex`, etc.) for common patterns

### 2. Logic Leaks and Code Duplication
Problem: User info management, routing logic, and error handling were duplicated across multiple files, leading to inconsistencies and maintenance issues.

Solution:
- Created centralized utility modules:
  - `utils/user.js` for localStorage user info management
  - `utils/routing.js` for authentication page detection and redirects
- Consolidated duplicate 401 error handling in API client into a single `handleUnauthorized()` method
- Ensured all components use `getTranscriptData()` instead of direct `window.transcriptData` access
- Standardized error logging to `console.error()` for better debugging

### 3. Settings Page Functionality
Problem: Settings page lacked proper profile update and password change functionality, with unclear logic for email changes.

Solution:
- Implemented full profile update API endpoint with email and name editing
- Added password confirmation requirement for email changes (security best practice)
- Created password change functionality with current password verification
- Implemented automatic logout after password change for security
- Removed non-editable "Major" and "Year" fields (these are derived from transcript data)

### 4. Dashboard Semester Display Issue
Problem: Dashboard only displayed 3 semesters instead of 4, missing the on-going semester that had courses but no grades yet.

Solution:
- Identified that the filtering logic excluded terms without complete grades
- Updated `getCompletedTerms()` to include "on-going" semesters (terms with courses but incomplete grades)
- Modified cumulative calculations to include active terms (completed + on-going)
- Updated dashboard rendering to display all active semesters
- Fixed the logic in multiple files: `dashboard.js`, `data.js`, `parser.js`, and `transcripts.js` queries

### 5. Chronological Term Sorting
Problem: Terms were not displayed in chronological order on the edit page, making it difficult for users to navigate their academic history.

Solution:
- Created `utils/terms.js` with `sortTermsChronologically()` function
- Implemented proper term code parsing (SP, SU, FA, WI) with year extraction
- Applied chronological sorting when loading transcript data
- Integrated sorting into edit page for both display and save operations
- Handles various term code formats (SP2024, FA2024, etc.)

### 6. JWT Token Expiry
Problem: JWT tokens had a 7-day expiry, which was too long for security best practices.

Solution:
- Updated JWT expiry from `'7d'` to `'4h'` in `utils/jwt.js`
- Improved security by requiring more frequent re-authentication

### 7. Remember Me Functionality
Problem: "Remember me" checkbox on login page was not functional.

Solution:
- Implemented client-side logic to store user email in `localStorage` when checkbox is checked
- Added automatic email population on page load if email was previously saved
- Integrated with existing authentication flow

### 8. Data Sanitization
Problem: Transcript data was not being sanitized before saving in the edit page, potentially storing sensitive information.

Solution:
- Added `sanitizeTranscriptData()` call in `edit-transcript.js` before API submission
- Ensured consistent data sanitization across upload and edit flows
- Removed sensitive user information before database storage

### 9. Database Export Script Compatibility
Problem: Export script only supported one environment variable format, limiting flexibility.

Solution:
- Updated `export-database.js` to support both `DB_*` and `PG*` environment variable formats
- Added robust error handling and user feedback
- Ensured compatibility with different `.env` file configurations

### 10. Code Quality and Maintainability
Problem: Inconsistent code style, missing documentation, and scattered utility functions made the codebase difficult to maintain.

Solution:
- Conducted comprehensive refactoring following established conventions
- Added JSDoc comments to all public functions
- Removed unnecessary test files and cleanup scripts
- Organized code into logical modules with clear responsibilities
- Standardized error handling and logging patterns

---

## Known Issues or Incomplete Features

### 1. PDF Parser Limitations
- The PDF parser is basic and may not correctly parse all transcript formats
- Complex PDF layouts with tables or unusual formatting may require manual data entry
- Users are warned if no terms are found after PDF parsing

### 2. Mobile Responsiveness
- While the application is responsive, some chart visualizations may not be optimal on very small screens
- Touch interactions for charts could be improved

### 3. Error Recovery
- If a PDF parse fails partially, there's no way to recover the partially parsed data
- Users must re-upload the file if parsing fails

### 4. Data Validation
- While basic validation exists, some edge cases in transcript data formats may not be caught
- Grade format variations might not all be recognized

### 5. Performance
- Large transcript files with many courses may take longer to parse and render

### 6. Accessibility
- Some interactive elements could benefit from better keyboard navigation
- Screen reader support could be enhanced for chart visualizations

---

## Use of GenAI

We used Generative AI (specifically Cursor AI) extensively throughout the development and refactoring process:

### Development Assistance
- Code Generation: Used AI to generate boilerplate code for API routes, database queries, and utility functions
- Refactoring: Leveraged AI to help identify and fix code quality issues, remove inline styles, and organize code into proper modules
- Debugging: Used AI to identify logic leaks, duplicate code, and inconsistencies across the codebase
- Documentation: AI assisted in generating JSDoc comments and code documentation

### Problem Solving
- Architecture Decisions: Consulted AI for best practices on code organization, naming conventions, and module structure
- Bug Fixes: Used AI to diagnose issues like the dashboard semester display problem and chronological sorting
- Security: AI helped implement proper authentication flows, password hashing, and JWT token management

### Code Quality
- Convention Adherence: AI helped ensure consistent use of kebab-case for CSS, camelCase for JavaScript, and snake_case for database fields
- Error Handling: AI assisted in standardizing error handling patterns across the application
- Testing: AI helped identify edge cases and potential issues in the codebase

### Learning and Understanding
- Technology Stack: Used AI to understand and implement features with Chart.js, PDF.js, and JWT authentication
- Best Practices: Consulted AI for security best practices, database design patterns, and frontend/backend architecture

Note: While AI was a valuable tool for development, all code was reviewed, tested, and understood by the team members. AI was used as an assistant to accelerate development and ensure code quality, not as a replacement for understanding the codebase.

---

## System Architecture

### Front-End Architecture

The front-end is built with vanilla JavaScript using ES6 modules, organized into:

- **Pages**: Page-specific logic (`public/js/pages/`)
  - `dashboard.js` - Main dashboard rendering and charts
  - `edit-transcript.js` - Transcript editing interface
  - `settings.js` - User settings and profile management
  - `plot-control.js` - Chart customization controls

- **Core Modules**: Shared functionality (`public/js/core/`)
  - `data.js` - Transcript data management and calculations
  - `upload.js` - File upload and parsing
  - `auth.js` - Authentication gate and logout
  - `nav.js` - Navigation and avatar management

- **API Client**: Centralized API communication (`public/js/api/`)
  - `api.js` - Base API client with error handling
  - `auth.js` - Authentication endpoints
  - `transcripts.js` - Transcript endpoints

- **Utilities**: Reusable helper functions (`public/js/utils/`)
  - `dom.js` - DOM manipulation helpers
  - `notifications.js` - Toast notification system
  - `user.js` - User info management (localStorage)
  - `routing.js` - Routing and auth page detection
  - `parser.js` - PDF/text/JSON parsing
  - `terms.js` - Term sorting and classification

- **Styling**: Organized CSS files (`public/styles/`)
  - `tokens.css` - CSS variables and design tokens
  - `base.css` - Base styles and reset
  - `components.css` - Reusable components
  - `layout.css` - Page layouts and structure
  - `pages/auth.css` - Authentication page styles

### Back-End Architecture

The back-end uses Node.js with Express.js:

- **Server**: `server.js` - Express server setup and route mounting
- **Routes**: Modular route handlers
  - `routes/auth.js` - Authentication endpoints (register, login, profile, password, reset)
  - `routes/transcripts.js` - Transcript CRUD operations
- **Middleware**: 
  - `middleware/auth.js` - JWT token verification
  - `middleware/errorHandler.js` - Centralized error handling
- **Database Layer**:
  - `db/pool.js` - PostgreSQL connection pool
  - `db/queries/users.js` - User database operations
  - `db/queries/transcripts.js` - Transcript database operations
  - `db/queries/passwordReset.js` - Password reset token management
  - `db/migrations/` - Database schema migrations
- **Utilities**:
  - `utils/jwt.js` - JWT token generation and verification
  - `utils/password.js` - Password hashing and verification
  - `utils/validation.js` - Input validation and sanitization

### Database Architecture

PostgreSQL database with normalized schema:

- **Normalization**: Separate tables for users, transcripts, terms, and courses
- **Relationships**: Foreign keys with CASCADE deletes for data integrity
- **Indexing**: Strategic indexes on frequently queried columns
- **Constraints**: UNIQUE constraints on email and user_id for data integrity

### Authentication Flow

1. User registers/logs in → Backend validates credentials
2. Backend generates JWT token (4-hour expiry) → Returns to client
3. Client stores token in localStorage
4. Client includes token in `Authorization: Bearer <token>` header for protected routes
5. Middleware verifies token on each protected request
6. On token expiry or logout, client clears token and redirects to login

### Data Flow

1. **Upload Flow**: User uploads PDF → Client parses → Sanitizes data → POST to `/api/transcripts` → Database stores → Client refreshes dashboard
2. **Edit Flow**: User edits transcript → Client validates → PUT to `/api/transcripts` → Database updates → Client refreshes display
3. **Display Flow**: Dashboard loads → GET `/api/transcripts` → Client calculates metrics → Renders charts and tables

---

## Contributions by Each Member

### Dhrumil Kanadiya
- Designed and implemented PostgreSQL database schema with normalized tables
- Built authentication system (JWT tokens, password hashing, middleware)
- Developed RESTful API endpoints for authentication and transcripts
- Implemented database query modules and error handling

### Abhishek Rangani
- Implemented frontend architecture and core data management modules
- Built PDF parsing system using PDF.js for transcript extraction
- Created dashboard with interactive Chart.js visualizations
- Developed customizable plot controls for data visualization

### Ayush Rangrej
- Designed all HTML pages and comprehensive CSS architecture
- Implemented user interface pages (authentication, settings, transcript editing)
- Built navigation system, notifications, and UX features
- Conducted code refactoring, removed inline styles, and added documentation

---

## Socially Responsible Computing (SRC)

### Stakeholders

**Primary Stakeholders:**
- **Students**: The primary users who benefit from visualizing and analyzing their academic progress
- **Educational Institutions**: May use insights for student support and program evaluation
- **Developers**: Maintain and extend the platform

**Secondary Stakeholders:**
- **Academic Advisors**: Could use aggregated data to support student guidance
- **Institution IT Departments**: May need to integrate with existing systems
- **Data Privacy Regulators**: Ensure compliance with student data protection laws

### Who Benefits

- **Students with Digital Transcripts**: Can easily visualize their academic progress and identify trends
- **Students Planning Course Loads**: Can see credit accumulation and GPA trends to make informed decisions
- **Students Tracking Progress**: Can monitor their academic performance over time

### Who May Be Excluded

- **Students Without Digital Transcripts**: The system requires PDF or text file uploads; students with only paper transcripts may be excluded
- **Non-English Speakers**: The interface is currently English-only, which may exclude international students
- **Students with Visual Impairments**: While we include basic accessibility features, chart visualizations may not be fully accessible to screen readers
- **Students with Limited Technical Skills**: The requirement to upload and parse files may be a barrier
- **Students at Institutions with Non-Standard Transcript Formats**: The PDF parser may not work with all transcript formats

### Design Decisions and Assumptions

**Assumptions Made:**
1. **Standard Transcript Format**: Assumed transcripts follow common academic formats (semester-based, standard grade scales)
2. **English Language**: Designed for English-speaking users and English transcript formats
3. **Digital Access**: Assumed users have access to digital transcript files
4. **Standard Grading Systems**: Assumed 4.0 GPA scale and standard letter grades
5. **Individual Use**: Designed for individual student use, not institutional analytics

**Design Decisions:**
1. **Client-Side PDF Parsing**: Chose to parse PDFs on the client to reduce server load, but this may exclude users with limited device capabilities
2. **JWT Token Storage**: Stored tokens in localStorage for convenience, but this may be less secure than httpOnly cookies
3. **No Email Integration**: Password reset tokens are displayed in UI (development mode), which may not be suitable for production
4. **Data Sanitization**: Removed sensitive information before storage, prioritizing privacy
5. **Single User Focus**: Designed for individual accounts rather than institutional dashboards

### Privacy and Security Considerations

**Privacy:**
- Transcript data is stored per-user with authentication required
- Sensitive information (student ID, SSN, etc.) is sanitized before storage
- User data is isolated by user_id foreign keys
- No sharing or aggregation of data across users

**Security:**
- Passwords are hashed using bcrypt before storage
- JWT tokens expire after 4 hours
- Protected routes require valid authentication
- Input validation and sanitization on all user inputs
- SQL injection protection through parameterized queries

**Potential Privacy Concerns:**
- Transcript data contains academic history which could be sensitive
- If database is compromised, academic records could be exposed
- No encryption at rest for transcript data (relies on database security)
- Password reset tokens in development mode are visible in UI

### Accessibility Considerations

**Implemented:**
- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support for forms
- Error messages with proper role attributes
- Responsive design for various screen sizes

**Limitations:**
- Chart visualizations may not be fully accessible to screen readers
- Some interactive elements could benefit from better keyboard navigation
- Color contrast may not meet all WCAG standards
- PDF parsing interface may be difficult for users with visual impairments

### Recommendations for Future Improvements

1. **Accessibility**: Implement full screen reader support for charts, add keyboard shortcuts, improve color contrast
2. **Internationalization**: Support multiple languages and transcript formats
3. **Institutional Integration**: Allow bulk imports from student information systems
4. **Enhanced Security**: Implement httpOnly cookies for tokens, add encryption at rest
5. **Email Integration**: Implement proper email delivery for password resets
6. **Alternative Input Methods**: Support voice input or assistive technologies for file uploads

---

## Conclusion

This project successfully demonstrates a full-stack web application with authentication, database integration, file parsing, and data visualization. The application follows modern web development practices, maintains clean and maintainable code, and provides a user-friendly interface for academic transcript management and analysis.

