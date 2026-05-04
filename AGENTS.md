# AGENTS.md

## Cursor Cloud specific instructions

### Project Overview
ToolChess is a Chinese Chess (Cờ Tướng) mobile game with:
- **Frontend**: React Native (Expo SDK 54) at `/workspace` — runs on web via `npx expo start --web`
- **Backend**: Express.js API at `/workspace/backend` — runs via `npm run dev` (nodemon, port 3000)
- **Database**: MySQL 8.0, database name `ToolChessDB`

### Starting Services

1. **MySQL**: `mkdir -p /var/run/mysqld && chown mysql:mysql /var/run/mysqld && mysqld --user=mysql --datadir=/var/lib/mysql &` — wait ~5s for startup
2. **Backend**: `cd /workspace/backend && npm run dev` (requires `.env` file and MySQL running)
3. **Frontend (web)**: `cd /workspace && npx expo start --web --port 8081`

### Backend `.env` Setup
Copy from `backend/.env.example` and modify for MySQL:
- `DB_HOST=localhost`, `DB_PORT=3306`, `DB_USER=root`, `DB_PASSWORD=` (empty for local dev)
- `DB_DATABASE=ToolChessDB`
- Generate JWT secrets: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

### Known Caveats
- **DB driver mismatch**: `database/` SQL scripts use T-SQL (SQL Server) syntax. The backend `config/database.js` uses `mysql2`. Some repository files (e.g., `userRepository.js`) still use old `mssql` driver syntax (`pool.request().input(...).query(...)`) while others (e.g., `premiumPackageRepository.js`) correctly use the `executeQuery` helper with MySQL `?` placeholders. Auth endpoints (register/login) will fail until `userRepository.js` is migrated to MySQL syntax.
- **No ESLint config**: The project has no `.eslintrc` or `eslint.config.js`.
- **No test files**: `npm test` (jest) exits with code 1 because no test files exist yet.
- **Expo web deps**: `react-dom`, `react-native-web`, and `@expo/metro-runtime` must be installed for web mode (`npx expo install react-dom react-native-web @expo/metro-runtime`).
- **Frontend API URL**: `src/config/constants.js` has a hardcoded LAN IP. For local dev, the backend is at `http://localhost:3000/api`.

### Useful Commands
See `backend/package.json` scripts and root `package.json` scripts for standard commands.
- Backend dev: `cd backend && npm run dev`
- Backend tests: `cd backend && npm test` (no tests exist yet)
- Frontend web: `npx expo start --web --port 8081`
- DB connection test: `cd backend && npm run test:db` (uses SQL Server syntax in test script, basic connection still works)
