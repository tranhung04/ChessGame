# Navigation Structure

This folder contains the navigation configuration for the ToolChess mobile app.

## Navigation Hierarchy

```
AppNavigator (Root)
├── Auth Stack (Unauthenticated)
│   ├── Login Screen
│   └── Register Screen
│
└── Main Stack (Authenticated)
    ├── Main Tabs
    │   ├── Home Tab
    │   ├── Game Tab
    │   ├── Shop Tab
    │   └── Profile Tab
    │
    └── Leaderboard Screen (Modal/Stack)
```

## Navigation Flow

### Authentication Flow
1. User opens app
2. If not authenticated → Show Auth Stack (Login/Register)
3. After successful login/register → Navigate to Main Tabs

### Main App Flow
1. User is authenticated → Show Main Tabs
2. User can navigate between tabs: Home, Game, Shop, Profile
3. User can navigate to Leaderboard from Home screen

## Screen Components

### Auth Stack
- **LoginScreen**: User login with email/password
- **RegisterScreen**: New user registration

### Main Tabs
- **HomeScreen**: Dashboard with stats and quick actions
- **GameScreen**: Chess game interface
- **ShopScreen**: Premium packages shop
- **ProfileScreen**: User profile and settings

### Additional Screens
- **LeaderboardScreen**: Top players ranking

## Usage

The navigation is automatically handled by the `AppNavigator` component based on authentication state from `AuthContext`.

```javascript
// In App.js
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
```

## Navigation Methods

### Navigate to a screen
```javascript
import { useNavigation } from '@react-navigation/native';

const navigation = useNavigation();
navigation.navigate('Leaderboard');
```

### Go back
```javascript
navigation.goBack();
```

### Reset navigation
```javascript
navigation.reset({
  index: 0,
  routes: [{ name: 'Main' }],
});
```
