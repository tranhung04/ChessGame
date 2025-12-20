# API Service Usage Guide

## Overview
This guide explains how to use the API services in the ToolChess mobile app.

## Authentication Context

### Using the Auth Context

```javascript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, loading, login, logout } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <LoginPrompt />;
  }

  return <div>Welcome {user.username}!</div>;
}
```

### Available Auth Functions

#### Login
```javascript
const { login } = useAuth();

const handleLogin = async () => {
  const result = await login('user@example.com', 'password123');
  
  if (result.success) {
    console.log('Logged in:', result.user);
    // Navigate to home screen
  } else {
    console.error('Login failed:', result.message);
    // Show error message
  }
};
```

#### Register
```javascript
const { register } = useAuth();

const handleRegister = async () => {
  const result = await register('username', 'user@example.com', 'password123');
  
  if (result.success) {
    console.log('Registered:', result.user);
    // Navigate to home screen
  } else {
    console.error('Registration failed:', result.message);
    // Show error message
  }
};
```

#### Logout
```javascript
const { logout } = useAuth();

const handleLogout = async () => {
  await logout();
  // User is logged out, navigate to login screen
};
```

#### Update User
```javascript
const { updateUser } = useAuth();

const refreshUserData = async () => {
  const result = await updateUser();
  
  if (result.success) {
    console.log('User updated:', result.user);
  }
};
```

## API Services

### User API

```javascript
import { userAPI } from '../services/api';

// Get current user profile
const getProfile = async () => {
  try {
    const response = await userAPI.getMe();
    const user = response.data.data;
    console.log('User:', user);
  } catch (error) {
    console.error('Error:', error.response?.data?.error?.message);
  }
};

// Update profile
const updateProfile = async () => {
  try {
    const response = await userAPI.updateMe({
      username: 'newUsername',
      email: 'newemail@example.com'
    });
    const user = response.data.data;
    console.log('Updated user:', user);
  } catch (error) {
    console.error('Error:', error.response?.data?.error?.message);
  }
};
```

### Premium API

```javascript
import { premiumAPI } from '../services/api';

// Get all premium packages
const getPackages = async () => {
  try {
    const response = await premiumAPI.getPackages();
    const packages = response.data.data.packages;
    console.log('Packages:', packages);
  } catch (error) {
    console.error('Error:', error.response?.data?.error?.message);
  }
};

// Subscribe to premium
const subscribe = async (packageId, paymentId) => {
  try {
    const response = await premiumAPI.subscribe(packageId, paymentId);
    const subscription = response.data.data.subscription;
    console.log('Subscription:', subscription);
  } catch (error) {
    console.error('Error:', error.response?.data?.error?.message);
  }
};
```

### Payment API

```javascript
import { paymentAPI } from '../services/api';

// Create VNPay payment
const createPayment = async (packageId) => {
  try {
    const response = await paymentAPI.createPayment(
      packageId,
      'toolchess://payment-return'
    );
    const { orderId, paymentUrl } = response.data.data;
    
    // Open payment URL in WebView
    console.log('Payment URL:', paymentUrl);
  } catch (error) {
    console.error('Error:', error.response?.data?.error?.message);
  }
};

// Check payment status
const checkPaymentStatus = async (orderId) => {
  try {
    const response = await paymentAPI.getPaymentStatus(orderId);
    const payment = response.data.data;
    console.log('Payment status:', payment.status);
  } catch (error) {
    console.error('Error:', error.response?.data?.error?.message);
  }
};

// Get payment history
const getPaymentHistory = async (page = 1) => {
  try {
    const response = await paymentAPI.getTransactions(page, 10);
    const { sessions, pagination } = response.data.data;
    console.log('Payments:', sessions);
  } catch (error) {
    console.error('Error:', error.response?.data?.error?.message);
  }
};
```

### Game API

```javascript
import { gameAPI } from '../services/api';

// Start game
const startGame = async () => {
  try {
    const response = await gameAPI.startGame('normal');
    const session = response.data.data.session;
    console.log('Game session:', session);
    return session;
  } catch (error) {
    console.error('Error:', error.response?.data?.error?.message);
  }
};

// Submit game
const submitGame = async (sessionId, score, turnCount, duration) => {
  try {
    const response = await gameAPI.submitGame(
      sessionId,
      score,
      turnCount,
      duration,
      null // moves (optional)
    );
    const session = response.data.data.session;
    console.log('Final score:', session.finalScore);
    console.log('Rank:', session.rank);
  } catch (error) {
    console.error('Error:', error.response?.data?.error?.message);
  }
};

// Get game history
const getGameHistory = async (page = 1) => {
  try {
    const response = await gameAPI.getHistory(page, 10);
    const { sessions, pagination } = response.data.data;
    console.log('Game history:', sessions);
  } catch (error) {
    console.error('Error:', error.response?.data?.error?.message);
  }
};

// Get leaderboard
const getLeaderboard = async () => {
  try {
    const response = await gameAPI.getLeaderboard(100, 'all');
    const { leaderboard, currentUser } = response.data.data;
    console.log('Leaderboard:', leaderboard);
    console.log('Your rank:', currentUser.rank);
  } catch (error) {
    console.error('Error:', error.response?.data?.error?.message);
  }
};
```

## Error Handling

### Standard Error Response Format

```javascript
{
  success: false,
  error: {
    code: 'ERROR_CODE',
    message: 'Human readable message',
    details: { /* additional info */ }
  }
}
```

### Common Error Codes

- `INVALID_CREDENTIALS` - Wrong email/password
- `TOKEN_EXPIRED` - Access token expired (auto-refreshed)
- `INVALID_REFRESH_TOKEN` - Refresh token invalid (user logged out)
- `VALIDATION_ERROR` - Input validation failed
- `INVALID_SCORE` - Score validation failed
- `PAYMENT_FAILED` - Payment processing failed

### Error Handling Pattern

```javascript
try {
  const response = await someAPI.someMethod();
  const data = response.data.data;
  // Handle success
} catch (error) {
  if (error.response) {
    // Server responded with error
    const errorCode = error.response.data?.error?.code;
    const errorMessage = error.response.data?.error?.message;
    
    switch (errorCode) {
      case 'INVALID_CREDENTIALS':
        // Show "Invalid email or password"
        break;
      case 'VALIDATION_ERROR':
        // Show validation errors
        break;
      default:
        // Show generic error
        break;
    }
  } else if (error.request) {
    // Network error
    console.error('Network error');
  } else {
    // Other error
    console.error('Error:', error.message);
  }
}
```

## Automatic Token Refresh

The API client automatically handles token refresh:

1. When an API call returns 401 with `TOKEN_EXPIRED`
2. The interceptor automatically calls refresh endpoint
3. Gets new access token and refresh token
4. Retries the original request with new token
5. If refresh fails, clears tokens and logs out user

**You don't need to handle token refresh manually!**

## Single-Flight Refresh Pattern

When multiple API calls fail simultaneously due to expired token:

1. First failed request triggers refresh
2. Subsequent failed requests wait for the same refresh
3. All requests retry with the new token
4. Prevents multiple concurrent refresh requests

**This is handled automatically by the interceptor!**

## Best Practices

### 1. Always use try-catch
```javascript
try {
  const response = await api.someMethod();
  // Handle success
} catch (error) {
  // Handle error
}
```

### 2. Show loading states
```javascript
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    const response = await api.someMethod();
    // Handle success
  } catch (error) {
    // Handle error
  } finally {
    setLoading(false);
  }
};
```

### 3. Handle network errors
```javascript
catch (error) {
  if (!error.response) {
    // Network error - show offline message
    Alert.alert('Lỗi kết nối', 'Vui lòng kiểm tra kết nối internet');
  }
}
```

### 4. Use auth context for user state
```javascript
// Don't store user in component state
// Use auth context instead
const { user, updateUser } = useAuth();

// Refresh user data after updates
await updateUser();
```

### 5. Check authentication before API calls
```javascript
const { isAuthenticated } = useAuth();

if (!isAuthenticated) {
  // Navigate to login
  return;
}

// Make API call
```

## Testing

### Testing with Mock Data

```javascript
import { authAPI } from '../services/api';
import MockAdapter from 'axios-mock-adapter';
import api from '../services/api';

const mock = new MockAdapter(api);

// Mock login
mock.onPost('/auth/login').reply(200, {
  success: true,
  data: {
    user: { id: '1', username: 'test' },
    tokens: { accessToken: 'token', refreshToken: 'refresh' }
  }
});

// Test
const result = await authAPI.login({ email: 'test@test.com', password: 'pass' });
```

## Troubleshooting

### Token not being sent
- Check if token is stored in SecureStore
- Check if request interceptor is working
- Check Authorization header in network logs

### Refresh loop
- Check if refresh endpoint is correct
- Check if new tokens are being saved
- Check if refresh token is valid

### 401 errors not handled
- Check if error code matches `TOKEN_EXPIRED`
- Check if response interceptor is configured
- Check if `_retry` flag is working

## Support

For issues or questions:
1. Check this guide
2. Check implementation in `src/services/api.js`
3. Check design document in `.kiro/specs/toolchess-rebuild/design.md`
4. Ask the development team
