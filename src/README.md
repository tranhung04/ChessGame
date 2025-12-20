# ToolChess Mobile - Source Code Structure

This document describes the organization of the ToolChess mobile application source code.

## Directory Structure

```
src/
├── components/          # Shared/reusable components
├── config/             # Application configuration
│   ├── constants.js    # Environment config, colors, game config
│   └── README.md       # Configuration documentation
├── context/            # React Context providers
│   └── AuthContext.js  # Authentication state management
├── game/               # Game engine (pure logic, no UI)
│   ├── ChessGame.js    # Core game logic
│   ├── EnemyAI.js      # AI opponent logic
│   ├── constants.js    # Game-specific constants
│   └── index.js        # Game module exports
├── navigation/         # Navigation configuration
│   ├── AppNavigator.js # Main navigation setup
│   └── README.md       # Navigation documentation
├── screens/            # Screen components
│   ├── Auth/           # Authentication screens
│   │   ├── LoginScreen.js
│   │   └── RegisterScreen.js
│   ├── Game/           # Game screen and components
│   │   ├── GameScreen.js
│   │   └── components/
│   ├── Home/           # Home dashboard
│   │   └── HomeScreen.js
│   ├── Leaderboard/    # Leaderboard screen
│   │   └── LeaderboardScreen.js
│   ├── Profile/        # User profile screen
│   │   └── ProfileScreen.js
│   └── Shop/           # Premium shop screen
│       └── ShopScreen.js
└── services/           # API and external services
    └── api.js          # API client with interceptors
```

## Key Principles

### 1. Separation of Concerns
- **Game Logic**: Pure JavaScript in `game/` folder, no UI dependencies
- **UI Components**: React Native components in `screens/` and `components/`
- **Business Logic**: Services and API calls in `services/`
- **State Management**: Context providers in `context/`

### 2. No Hardcoded Values
- All configuration in `config/constants.js`
- Environment-specific values (API URLs) configured per environment
- Colors, game values, storage keys all centralized

### 3. Clean Architecture
- Components are organized by feature/screen
- Shared components in `components/` folder
- Each major feature has its own folder

## Module Dependencies

### Game Engine
```
ChessGame.js (Pure Logic)
    ↓
EnemyAI.js (Uses ChessGame)
    ↓
GameScreen.js (UI Layer)
```

### Authentication Flow
```
AuthContext.js (State Management)
    ↓
api.js (API Client with Interceptors)
    ↓
Auth Screens (Login/Register)
```

### Navigation Flow
```
App.js
    ↓
AuthProvider (Wraps entire app)
    ↓
AppNavigator (Conditional rendering based on auth state)
    ↓
Auth Stack OR Main Tabs
```

## Getting Started

### Running the App
```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### Environment Configuration
Edit `src/config/constants.js` to change API URLs for different environments.

### Adding a New Screen
1. Create screen file in `src/screens/[FeatureName]/[ScreenName].js`
2. Add route in `src/navigation/AppNavigator.js`
3. Import and use in navigation structure

### Adding a New API Endpoint
1. Add method to appropriate API object in `src/services/api.js`
2. Use in screen/component with error handling

## Best Practices

1. **Use Context for Global State**: Authentication, user data
2. **Use Local State for UI State**: Form inputs, loading states
3. **Keep Components Small**: Break down complex screens into smaller components
4. **Error Handling**: Always handle API errors gracefully
5. **Loading States**: Show loading indicators during async operations
6. **Type Safety**: Use PropTypes or TypeScript for component props
7. **Consistent Styling**: Use colors from `COLORS` constant

## Testing

- Unit tests for game logic in `game/` folder
- Integration tests for API services
- Component tests for critical UI components
- Manual testing checklist in project documentation

## Documentation

Each major folder contains a README.md explaining its purpose and usage patterns.
