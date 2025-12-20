# ToolChess Backend API

NodeJS backend API server for the ToolChess mobile game application.

## Tech Stack

- **Framework**: Express.js
- **Database**: SQL Server
- **Authentication**: JWT (JSON Web Tokens)
- **Payment**: VNPay Gateway
- **Email**: Gmail SMTP (Nodemailer)

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   └── database.js  # Database connection setup
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   │   ├── errorHandler.js
│   │   ├── notFoundHandler.js
│   │   ├── rateLimiter.js
│   │   └── requestLogger.js
│   ├── repositories/    # Data access layer
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic
│   ├── app.js          # Express app setup
│   └── server.js       # Server entry point
├── .env.example        # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- SQL Server (local or remote)
- npm or yarn

### Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file from template:
   ```bash
   cp .env.example .env
   ```

4. Configure environment variables in `.env`:
   - Database credentials
   - JWT secret keys
   - VNPay credentials
   - Gmail SMTP credentials

5. Ensure SQL Server database is set up (see `/database` folder in root)

### Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

### Testing

Run tests:
```bash
npm test
```

## API Endpoints

### Health Check
- `GET /health` - Server health check

### Authentication (Coming Soon)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh-token` - Refresh access token

### User Profile (Coming Soon)
- `GET /api/user/me` - Get current user profile
- `PUT /api/user/me` - Update user profile

### Premium Packages (Coming Soon)
- `GET /api/premium/packages` - Get all premium packages
- `POST /api/premium/subscribe` - Subscribe to premium package

### Payment (Coming Soon)
- `POST /api/payment/vnpay/create` - Create VNPay payment
- `GET /api/payment/vnpay/return` - VNPay callback handler
- `GET /api/payment/status/:orderId` - Get payment status

### Game Sessions (Coming Soon)
- `POST /api/game/start` - Start game session
- `POST /api/game/submit` - Submit game score
- `GET /api/game/history` - Get game history
- `GET /api/game/leaderboard` - Get leaderboard

### Email (Coming Soon)
- `POST /api/email/send` - Send email (admin only)

## Environment Variables

See `.env.example` for all required environment variables.

Key variables:
- `PORT` - Server port (default: 3000)
- `DB_SERVER` - SQL Server host
- `DB_DATABASE` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - JWT signing secret
- `VNPAY_TMN_CODE` - VNPay merchant code
- `VNPAY_HASH_SECRET` - VNPay hash secret
- `SMTP_USER` - Gmail email address
- `SMTP_PASS` - Gmail app password

## Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting on sensitive endpoints
- JWT token authentication
- Password hashing with bcrypt (12 rounds)
- Input validation with Joi
- SQL injection prevention with parameterized queries

### Security Testing

Run security audit:
```bash
npm run security:audit
```

Run security tests (requires server running):
```bash
npm run security:test
```

### Security Documentation

- [Security Hardening Guide](./SECURITY_HARDENING_GUIDE.md) - Comprehensive security setup guide
- [Security Checklist](./SECURITY_CHECKLIST.md) - Pre-deployment security checklist

### Important Security Notes

⚠️ **Before Production Deployment:**

1. **Generate Strong Secrets**: Replace default JWT secrets with strong random values
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Use Strong Database Password**: Change from default weak password

3. **Configure VNPay Credentials**: Set actual VNPay merchant credentials

4. **Set Specific CORS Origins**: Don't use wildcard (*) in production

5. **Enable Database Encryption**: Set `DB_ENCRYPT=true` in production

See [SECURITY_HARDENING_GUIDE.md](./SECURITY_HARDENING_GUIDE.md) for detailed instructions.

## Error Handling

All errors are returned in consistent JSON format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": {}
  }
}
```

## Rate Limiting

- General API: 100 requests/minute
- Auth endpoints: 5 requests/minute
- Payment endpoints: 3 requests/minute
- Game submission: 10 games/hour

## Development

### Adding New Routes

1. Create route file in `src/routes/`
2. Create controller in `src/controllers/`
3. Create service in `src/services/` (if needed)
4. Create repository in `src/repositories/` (if needed)
5. Register route in `src/app.js`

### Database Queries

Use the database wrapper in `src/config/database.js`:

```javascript
const { executeQuery } = require('../config/database');

const result = await executeQuery(
  'SELECT * FROM Users WHERE Id = @userId',
  { userId: 'some-uuid' }
);
```

## License

ISC
