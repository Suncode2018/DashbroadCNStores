const config = {
  // API Configuration
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8001/',
  apiVersion: process.env.REACT_APP_API_VERSION || 'v1',
  
  // Environment
  environment: process.env.REACT_APP_ENV || 'development',
  isDevelopment: process.env.REACT_APP_ENV === 'development',
  isProduction: process.env.REACT_APP_ENV === 'production',
  
  // Application
  appName: process.env.REACT_APP_APP_NAME || 'CN Dashboard',
  appVersion: process.env.REACT_APP_APP_VERSION || '1.0.0',
  
  // Authentication
  authTimeout: parseInt(process.env.REACT_APP_AUTH_TIMEOUT) || 3600000, // 1 hour
  tokenKey: process.env.REACT_APP_TOKEN_KEY || 'cn_dashboard_token',
  
  // Features
  enableExport: process.env.REACT_APP_ENABLE_EXPORT === 'true',
  enableAnalytics: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
  
  // Debug
  debugMode: process.env.REACT_APP_DEBUG_MODE === 'true',
  
  // API Endpoints
  endpoints: {
    auth: {
      login: '/auth/login',
      logout: '/auth/logout',
      profile: '/auth/profile',
    },
    dashboard: {
      stats: '/dashboard/stats',
      sales: '/dashboard/sales',
    },
    branches: {
      list: '/branches',
      detail: '/branches/:id',
    },
    export: {
      sales: '/export/sales',
      branches: '/export/branches',
    },
  },
};

export default config;