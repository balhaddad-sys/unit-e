# Unit E Ward Rounds Application

A comprehensive digital solution for managing ward rounds in healthcare facilities. The Unit E Ward Rounds application streamlines clinical workflows, improves patient information accessibility, and enhances team communication during daily rounds.

**Version:** 1.0.0  
**Last Updated:** January 4, 2026  
**Status:** Production Ready

---

## Table of Contents

1. [Features](#features)
2. [Quick Start](#quick-start)
3. [Configuration](#configuration)
4. [Usage](#usage)
5. [Architecture](#architecture)
6. [API References](#api-references)
7. [Troubleshooting](#troubleshooting)
8. [Changelog](#changelog)

---

## Features

### Core Functionality

- **Patient Management**
  - Create, read, update, and delete patient records
  - Comprehensive patient demographics and medical history
  - Real-time patient status updates
  - Integration with hospital information systems

- **Ward Round Organization**
  - Schedule and manage daily ward rounds
  - Assign clinical teams to rounds
  - Prioritize patient visits
  - Track round progression in real-time

- **Clinical Documentation**
  - Structured note-taking during rounds
  - Digital vital signs recording
  - Assessment and plan documentation
  - Electronic signature support
  - Audit trail for all documentation changes

- **Team Collaboration**
  - Multi-user access with role-based permissions
  - Real-time notifications for team members
  - Task assignment and tracking
  - Communication logs within patient records

- **Data Analytics**
  - Round duration analytics
  - Patient admission/discharge tracking
  - Clinical outcome metrics
  - Performance dashboards
  - Customizable reports

- **Security & Compliance**
  - HIPAA compliant data storage
  - End-to-end encryption for sensitive data
  - Role-based access control (RBAC)
  - Comprehensive audit logging
  - Session management and timeout controls

- **Mobile Support**
  - Responsive web design
  - Offline mode for critical functions
  - Push notifications
  - Touch-optimized interface

---

## Quick Start

### Prerequisites

- Node.js v16.0.0 or higher
- npm v7.0.0 or higher
- Docker (optional, for containerized deployment)
- PostgreSQL 13+ (for database)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/balhaddad-sys/unit-e.git
   cd unit-e
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set Up Database**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Access Application**
   ```
   http://localhost:3000
   ```

### Docker Quick Start

```bash
docker-compose up -d
```

This will start the application and PostgreSQL database in containers.

---

## Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Application
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/unit_e
DB_POOL_SIZE=20

# Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRATION=24h
REFRESH_TOKEN_EXPIRATION=7d

# API Configuration
API_VERSION=v1
API_RATE_LIMIT=100
RATE_LIMIT_WINDOW_MS=900000

# Email Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASSWORD=your_email_password
SMTP_FROM=noreply@unit-e.hospital.com

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# CORS
CORS_ORIGIN=http://localhost:3000

# Session
SESSION_SECRET=your_session_secret_key
SESSION_TIMEOUT=3600000

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# External Services (Optional)
HOSPITAL_API_URL=https://api.hospital.com
HOSPITAL_API_KEY=your_api_key

# Notifications
NOTIFICATION_ENABLED=true
NOTIFICATION_SERVICE=email,push

# Security
ENABLE_HTTPS=true
HELMET_ENABLED=true
```

### Database Configuration

The application uses PostgreSQL. Configure connection details in `.env`:

```env
DATABASE_URL=postgresql://username:password@hostname:5432/database_name
```

### Feature Flags

Enable or disable features via environment variables or configuration file:

```env
FEATURE_MOBILE_APP=true
FEATURE_ANALYTICS=true
FEATURE_VIDEO_ROUNDS=false
FEATURE_OFFLINE_MODE=true
```

---

## Usage

### User Roles

#### Administrator
- Full system access
- User and team management
- System configuration
- Audit log access
- Report generation

#### Consultant
- View and manage assigned wards
- Create and manage ward rounds
- Access all patient information
- Approve clinical documentation
- View analytics dashboards

#### Doctor/Resident
- Access assigned ward information
- Document during rounds
- View team tasks
- Submit notes for approval

#### Nurse
- View patient information
- Update vital signs
- Manage patient requests
- Assist with documentation

#### Pharmacist
- View medication information
- Document medication reviews
- Flag drug interactions
- Communicate with clinical team

### Getting Started with Your First Ward Round

1. **Log In**
   - Enter your credentials
   - Two-factor authentication (if enabled)

2. **Navigate to Ward Dashboard**
   - Select your assigned ward
   - View patient list
   - Check pending tasks

3. **Create or Select a Ward Round**
   - Click "New Round" or select existing round
   - Assign team members
   - Set visit order

4. **Start Patient Visit**
   - Click patient name to open record
   - Review vital signs and history
   - Document findings in structured notes

5. **Complete Documentation**
   - Enter assessment and plan
   - Add prescriptions if applicable
   - Attach relevant files/images
   - Sign documentation

6. **Complete Round**
   - Mark all patients as visited
   - Add round summary
   - Submit for review

### Key Workflows

#### Creating a Patient Record
```
Dashboard → Patients → Add Patient → Fill Details → Save
```

#### Documenting During Rounds
```
Ward Round → Select Patient → Open Medical Record → Add Note → Save & Sign
```

#### Viewing Analytics
```
Dashboard → Analytics → Select Report Type → Apply Filters → Generate Report
```

#### Managing Team Members
```
Settings → Team Management → Manage Members → Assign Roles → Save
```

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────┐
│                   Client Applications                    │
│          (Web Browser, Mobile App, Offline Cache)       │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              API Gateway & Load Balancer                 │
│                  (nginx/Express.js)                      │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│            Authentication & Authorization                 │
│              (JWT, OAuth 2.0, RBAC)                      │
└────────────────────┬────────────────────────────────────┘
                     │
     ┌───────────────┼───────────────┐
     │               │               │
┌────▼─────┐  ┌─────▼────┐  ┌──────▼──────┐
│ Business  │  │   Data   │  │ Integration │
│  Logic    │  │  Services│  │   Services  │
│ (Services)│  │(Models)  │  │(3rd Party)  │
└────┬─────┘  └─────┬────┘  └──────┬──────┘
     │              │              │
     └──────────────┼──────────────┘
                    │
         ┌──────────┼──────────┐
         │          │          │
    ┌────▼──┐  ┌────▼──┐  ┌───▼─────┐
    │Database│  │ Cache │  │File     │
    │   (PG) │  │(Redis)│  │Storage  │
    └────────┘  └───────┘  └─────────┘
```

### Technology Stack

**Backend:**
- Node.js with Express.js
- TypeScript for type safety
- PostgreSQL for persistent data
- Redis for caching and sessions
- Socket.io for real-time updates

**Frontend:**
- React.js with TypeScript
- Redux for state management
- Material-UI or custom design system
- Axios for API communication
- Service Workers for offline support

**Infrastructure:**
- Docker for containerization
- Kubernetes for orchestration (optional)
- GitHub Actions for CI/CD
- AWS/GCP/Azure for hosting

### Design Patterns

- **MVC Pattern:** Separation of concerns for backend services
- **Repository Pattern:** Abstract data access layer
- **Singleton Pattern:** Database connection management
- **Observer Pattern:** Real-time event notifications
- **Strategy Pattern:** Multiple authentication strategies

### Data Flow

1. **Request Phase:** Client sends request to API
2. **Authentication:** JWT validation and user verification
3. **Authorization:** Role-based access control check
4. **Processing:** Business logic execution
5. **Data Access:** Repository queries database
6. **Caching:** Store results in Redis if applicable
7. **Response:** Return formatted response to client
8. **Notification:** Broadcast real-time updates via WebSocket

---

## API References

### Base URL
```
https://api.unit-e.hospital.com/api/v1
```

### Authentication

All API requests require a valid JWT token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

### Common Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

### Endpoints

#### Authentication

**POST /auth/login**
- Login with credentials
- Returns: JWT token, refresh token, user details

**POST /auth/refresh**
- Refresh JWT token
- Required: Refresh token

**POST /auth/logout**
- Logout current user
- Clears session

**POST /auth/reset-password**
- Request password reset
- Required: Email address

#### Patients

**GET /patients**
- List all patients (paginated)
- Query Parameters: `page`, `limit`, `search`, `ward`, `status`
- Returns: Array of patients

**GET /patients/:id**
- Get patient details
- Returns: Patient object with full medical record

**POST /patients**
- Create new patient
- Body: Patient details
- Returns: Created patient object

**PUT /patients/:id**
- Update patient information
- Body: Updated patient details
- Returns: Updated patient object

**DELETE /patients/:id**
- Archive patient record
- Returns: Confirmation message

**GET /patients/:id/vital-signs**
- Get patient vital signs history
- Query Parameters: `from`, `to`, `limit`
- Returns: Vital signs array

**POST /patients/:id/vital-signs**
- Record vital signs
- Body: Vital signs data
- Returns: Created vital sign record

#### Ward Rounds

**GET /rounds**
- List ward rounds
- Query Parameters: `ward`, `date`, `status`, `page`, `limit`
- Returns: Array of rounds

**POST /rounds**
- Create new ward round
- Body: Round details (ward, date, team members)
- Returns: Created round object

**GET /rounds/:id**
- Get round details
- Returns: Complete round information

**PUT /rounds/:id**
- Update round
- Body: Updated round details
- Returns: Updated round object

**POST /rounds/:id/start**
- Start a ward round
- Returns: Round status update

**POST /rounds/:id/complete**
- Complete a ward round
- Body: Final summary
- Returns: Completion confirmation

**GET /rounds/:id/patients**
- Get patients in a round
- Returns: Array of patients in round

#### Clinical Notes

**POST /notes**
- Create clinical note
- Body: Note content, assessment, plan, patient_id, round_id
- Returns: Created note object

**GET /notes/:id**
- Get note details
- Returns: Note with full content and audit trail

**PUT /notes/:id**
- Update note
- Body: Updated note content
- Returns: Updated note object

**POST /notes/:id/sign**
- Electronically sign note
- Body: Signature, timestamp
- Returns: Signed note confirmation

#### Analytics

**GET /analytics/rounds**
- Get round statistics
- Query Parameters: `from`, `to`, `ward`
- Returns: Round analytics data

**GET /analytics/patients**
- Get patient statistics
- Query Parameters: `from`, `to`
- Returns: Patient analytics

**GET /analytics/team**
- Get team performance metrics
- Query Parameters: `ward`, `period`
- Returns: Team analytics

### Rate Limiting

API requests are rate limited to 100 requests per 15 minutes per user.

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1609459200
```

---

## Troubleshooting

### Common Issues

#### Issue: "Cannot connect to database"

**Solution:**
1. Verify DATABASE_URL in .env file
2. Ensure PostgreSQL is running
3. Check database credentials
4. Verify network connectivity
5. Review PostgreSQL logs for errors

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql
```

#### Issue: "Authentication failed"

**Solution:**
1. Clear browser cookies and cache
2. Verify JWT_SECRET is set correctly
3. Check token expiration time
4. Verify user account is active
5. Check CORS configuration

#### Issue: "Slow performance or timeouts"

**Solution:**
1. Check server resources (CPU, memory, disk)
2. Review database query performance
3. Clear Redis cache
4. Check network latency
5. Review application logs for bottlenecks

```bash
# Check application logs
tail -f logs/application.log

# Monitor system resources
top
```

#### Issue: "Real-time updates not working"

**Solution:**
1. Verify Socket.io is enabled
2. Check WebSocket connectivity
3. Review firewall rules
4. Check browser console for errors
5. Restart application server

```bash
# Test WebSocket connection
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" http://localhost:3000
```

#### Issue: "File upload failing"

**Solution:**
1. Check MAX_FILE_SIZE setting
2. Verify UPLOAD_DIR exists and is writable
3. Check disk space availability
4. Review file permissions
5. Check nginx upload configuration

```bash
# Check upload directory
ls -la uploads/
# Create if missing
mkdir -p uploads
chmod 755 uploads
```

#### Issue: "Email notifications not sending"

**Solution:**
1. Verify SMTP credentials
2. Check SMTP host and port
3. Review email logs
4. Verify firewall allows SMTP port
5. Test SMTP connection

```bash
# Test SMTP connectivity
telnet smtp.example.com 587
```

### Debug Mode

Enable debug logging for detailed troubleshooting:

```env
LOG_LEVEL=debug
DEBUG=*
```

### Health Check

Monitor application health:

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "cache": "connected",
  "uptime": 3600000
}
```

### Log Analysis

Key log files to monitor:

- `logs/application.log` - Application events
- `logs/error.log` - Error messages
- `logs/audit.log` - Security audit trail
- `logs/database.log` - Database queries

---

## Changelog

### Version 1.0.0 - January 4, 2026

#### Features
- ✨ Initial release of Unit E Ward Rounds application
- ✨ Complete patient management system
- ✨ Ward round organization and scheduling
- ✨ Clinical documentation with electronic signatures
- ✨ Real-time team collaboration features
- ✨ Role-based access control (RBAC)
- ✨ Comprehensive analytics and reporting
- ✨ Mobile-responsive design
- ✨ Offline mode support
- ✨ HIPAA compliant security implementation

#### Backend
- Express.js REST API with TypeScript
- PostgreSQL database with migration system
- JWT authentication with refresh tokens
- Redis caching layer
- Socket.io for real-time updates
- Comprehensive error handling

#### Frontend
- React.js single-page application
- Redux state management
- Material-UI components
- Service workers for offline support
- Real-time notification system

#### Security
- End-to-end encryption for sensitive data
- Session timeout management
- Audit logging for all operations
- CORS configuration
- Rate limiting on API endpoints
- CSRF protection

#### Infrastructure
- Docker containerization
- Docker Compose for local development
- GitHub Actions CI/CD pipeline
- Environment-based configuration

#### Documentation
- API documentation with examples
- Setup and installation guide
- Configuration reference
- Architecture overview
- Troubleshooting guide

#### Bug Fixes
- Fixed timezone handling in ward round scheduling
- Resolved patient search pagination issues
- Corrected vital signs chart rendering
- Fixed authentication token expiration edge cases

---

## Support & Contribution

### Getting Help

- 📧 **Email:** support@unit-e.hospital.com
- 📞 **Phone:** +1-XXX-XXX-XXXX
- 📖 **Documentation:** https://docs.unit-e.hospital.com
- 🐛 **Issue Tracker:** https://github.com/balhaddad-sys/unit-e/issues

### Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure:
- Code follows project style guidelines
- Tests are written for new features
- Documentation is updated
- Commits are clean and descriptive

### Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to conduct@unit-e.hospital.com

### License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Additional Resources

- [API Documentation](./docs/API.md)
- [Architecture Guide](./docs/ARCHITECTURE.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Development Guide](./docs/DEVELOPMENT.md)
- [Security Policy](./SECURITY.md)

---

**Last Updated:** January 4, 2026  
**Maintained By:** Unit E Development Team  
**Repository:** https://github.com/balhaddad-sys/unit-e
