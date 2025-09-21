const config = {
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8001',
  apiVersion: process.env.REACT_APP_API_VERSION || 'api/v1',
  environment: process.env.REACT_APP_ENV || 'development',
  isDevelopment: process.env.REACT_APP_ENV === 'development',
  appName: process.env.REACT_APP_APP_NAME || 'CN Dashboard',
  tokenKey: process.env.REACT_APP_TOKEN_KEY || 'cn_dashboard_token',
  debugMode: process.env.REACT_APP_DEBUG_MODE === 'true',
};

export default config;


