# Configuration

This folder contains application configuration files.

## Environment Configuration

The app supports three environments:
- **dev**: Development environment (uses __DEV__ flag)
- **staging**: Staging environment
- **prod**: Production environment

### Changing API URL

To change the API URL for different environments, update the `ENV` object in `constants.js`:

```javascript
const ENV = {
  dev: {
    API_BASE_URL: 'http://your-dev-api-url/api',
  },
  staging: {
    API_BASE_URL: 'https://staging-api.toolchess.com/api',
  },
  prod: {
    API_BASE_URL: 'https://api.toolchess.com/api',
  }
};
```

### No Hardcoded URLs

All API URLs are configured through the `API_BASE_URL` constant. Never hardcode URLs directly in components or services.

## Usage

```javascript
import { API_BASE_URL, COLORS, GAME_CONFIG } from '../config/constants';
```
