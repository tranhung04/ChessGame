# ToolChess Rebuild - Complete Specification

## Overview

This specification covers the complete rebuild of the ToolChess mobile game application with a modern, clean architecture. The project involves:

- **Frontend**: React Native (Expo) mobile app for Android/iOS
- **Backend**: NodeJS REST API server (Express/NestJS)
- **Database**: Microsoft SQL Server
- **Integrations**: VNPay payment gateway, Gmail SMTP

## Specification Documents

### 1. [requirements.md](./requirements.md)
Complete requirements document with 25 major requirements covering:
- Frontend architecture and UI components
- Game engine and AI logic
- Authentication and security
- Premium packages and payments
- Database schema and migrations
- Testing and documentation requirements

**Format**: EARS (Easy Approach to Requirements Syntax) with INCOSE quality rules

### 2. [design.md](./design.md)
Comprehensive design document including:
- System architecture diagrams
- Component interfaces and APIs
- Complete API endpoint specifications with request/response examples
- Database schema with SQL scripts
- Game engine and AI module design
- Authentication flow (JWT + Refresh Token)
- VNPay payment integration flow
- Email service design
- Error handling strategy
- 18 Correctness Properties for property-based testing
- Testing strategy (unit, integration, e2e)
- Performance optimization guidelines
- Monitoring and logging strategy
- Risk analysis and mitigation

### 3. [tasks.md](./tasks.md)
Detailed implementation plan with 32 major tasks organized into phases:
- Database setup (1 task)
- Backend implementation (11 tasks)
- Frontend implementation (13 tasks)
- Integration and testing (4 tasks)
- Documentation (1 task)
- Security and optimization (2 tasks)

Each task includes:
- Sub-tasks with clear objectives
- Requirements traceability
- Test tasks (marked with *)
- Checkpoints for validation

### 4. [ARCHITECTURE_OVERVIEW.md](./ARCHITECTURE_OVERVIEW.md)
Executive summary document covering:
- Technology stack details
- System architecture diagrams
- API endpoints summary table
- Database schema summary with relationships
- Chess board port strategy (Web → React Native)
- Critical risk analysis with mitigation code examples
- Deployment checklist
- Success metrics

## Key Features

### Security
- JWT authentication with refresh tokens
- Bcrypt password hashing (12 rounds)
- Rate limiting on sensitive endpoints
- CORS and Helmet security headers
- Secure token storage (expo-secure-store)
- VNPay signature verification

### Game Features
- Chinese chess (Cờ Tướng) game engine
- AI opponent with intelligent move selection
- Fire mode (blast adjacent enemies)
- Premium score bonuses
- Leaderboard system
- Game history tracking

### Premium System
- 4 premium packages (Basic, Standard, Pro, VIP)
- Score multipliers (10% to 50%)
- Revive system (2 to unlimited)
- VNPay payment integration
- Email confirmations

### Anti-Cheat
- Server-side score validation
- Score bounds checking
- Time-based validation
- Move history storage (optional)
- Statistical analysis
- Rate limiting on game submissions

## Technology Constraints

### Must Use
- ✅ React Native with Expo (Frontend)
- ✅ NodeJS (Backend)
- ✅ SQL Server (Database)
- ✅ Gmail SMTP (Email)
- ✅ VNPay (Payment)

### Must NOT Use
- ❌ Firebase
- ❌ Supabase
- ❌ Auth0
- ❌ Any BaaS (Backend-as-a-Service)
- ❌ NoSQL databases

## Getting Started

### Prerequisites
- Node.js 18+ (LTS)
- SQL Server 2019+
- Android Studio (for Android development)
- Xcode (for iOS development, optional)
- VNPay sandbox account
- Gmail account with App Password

### Implementation Order

1. **Phase 1: Database Setup**
   - Create SQL Server database
   - Run schema creation scripts
   - Seed premium packages data

2. **Phase 2: Backend Development**
   - Set up NodeJS project
   - Implement authentication system
   - Implement premium and payment systems
   - Implement game session management
   - Implement email service

3. **Phase 3: Frontend Development**
   - Set up React Native Expo project
   - Port game engine from web version
   - Implement chess board UI
   - Implement authentication screens
   - Implement game screen
   - Implement shop and profile screens

4. **Phase 4: Integration & Testing**
   - End-to-end testing
   - Security testing
   - Performance optimization
   - Documentation

### Quick Start Commands

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev

# Frontend
cd frontend
npm install
# Edit src/config/constants.js with API URL
npm start

# Database
# Run SQL scripts in database/migrations/
```

## Testing Strategy

### Unit Tests
- Frontend: Jest + React Native Testing Library
- Backend: Jest or Mocha + Chai
- Target: 80%+ code coverage

### Property-Based Tests
- Use fast-check library
- Minimum 100 iterations per property
- 18 correctness properties defined in design.md

### Integration Tests
- API endpoint testing
- Authentication flow testing
- Payment flow testing
- Game flow testing

### Manual Testing
- Complete checklist in requirements.md (22.2)
- Test on real devices
- Test with VNPay sandbox
- Test email delivery

## Documentation

### API Documentation
- All endpoints documented in design.md
- Request/response examples provided
- Error codes documented
- Swagger/OpenAPI spec (optional)

### Code Documentation
- Inline comments for complex logic
- JSDoc for public APIs
- README files for each module

### User Documentation
- Game rules and how to play
- Premium features guide
- Payment process guide
- FAQ

## Risk Mitigation

### Critical Risks Addressed
1. **VNPay Integration**: Thorough testing, logging, fallback mechanisms
2. **Refresh Token Race Conditions**: Single-flight pattern, database transactions
3. **Anti-Cheat Bypass**: Server-side validation, move history, statistical analysis
4. **Database Performance**: Proper indexing, connection pooling, query optimization

See ARCHITECTURE_OVERVIEW.md for detailed mitigation strategies with code examples.

## Success Criteria

### Technical
- ✅ All tests passing
- ✅ API response time < 200ms (p95)
- ✅ Error rate < 1%
- ✅ Uptime > 99.9%
- ✅ Zero critical security vulnerabilities

### Functional
- ✅ Users can register and login
- ✅ Users can play chess game
- ✅ Users can purchase premium packages
- ✅ Users can view leaderboard
- ✅ Premium bonuses apply correctly
- ✅ Payments process successfully

### Quality
- ✅ Code review completed
- ✅ Security audit passed
- ✅ Performance testing passed
- ✅ Documentation complete

## Project Structure

```
toolchess-rebuild/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── middleware/
│   │   └── utils/
│   ├── tests/
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── services/
│   │   ├── context/
│   │   ├── navigation/
│   │   ├── game/
│   │   └── config/
│   ├── assets/
│   ├── app.json
│   └── package.json
├── database/
│   ├── migrations/
│   │   ├── V001_create_tables.sql
│   │   ├── V002_create_indexes.sql
│   │   └── V003_seed_data.sql
│   └── schema.md
└── docs/
    ├── api/
    ├── deployment/
    └── user-guide/
```

## Contributing

This is a specification document. Implementation should follow:
1. Read requirements.md thoroughly
2. Review design.md for architecture details
3. Follow tasks.md for implementation order
4. Refer to ARCHITECTURE_OVERVIEW.md for technical decisions
5. Write tests for all new code
6. Update documentation as needed

## License

MIT License - See LICENSE file for details

## Contact

For questions or clarifications about this specification, please contact the project team.

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Status**: Ready for Implementation
