import React, { useState } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Paper,
  LinearProgress,
  Chip,
  Alert,
  CircularProgress,
  Collapse
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Store as StoreIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  FileDownload as ExportIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Configuration
const config = {
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8001',
  apiVersion: process.env.REACT_APP_API_VERSION || 'api/v1',
  environment: process.env.REACT_APP_ENV || 'development',
  isDevelopment: process.env.REACT_APP_ENV === 'development',
  appName: process.env.REACT_APP_APP_NAME || 'CN Dashboard',
  tokenKey: process.env.REACT_APP_TOKEN_KEY || 'cn_dashboard_token',
  debugMode: process.env.REACT_APP_DEBUG_MODE === 'true',
};

// Theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    success: {
      main: '#4caf50',
    },
    error: {
      main: '#f44336',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
  },
});

// Mock Data
const mockSalesData = [
  { 
    id: 1,
    branch: 'สาขาเซ็นทรัล', 
    sales: 1250000, 
    growth: 12.5,
    location: 'กรุงเทพฯ',
    manager: 'คุณสมชาย'
  },
  { 
    id: 2,
    branch: 'สาขาสยาม', 
    sales: 980000, 
    growth: 8.3,
    location: 'กรุงเทพฯ',
    manager: 'คุณสมหญิง'
  },
  { 
    id: 3,
    branch: 'สาขาอโศก', 
    sales: 1100000, 
    growth: 15.2,
    location: 'กรุงเทพฯ',
    manager: 'คุณสมศักดิ์'
  },
  { 
    id: 4,
    branch: 'สาขาสีลม', 
    sales: 850000, 
    growth: -2.1,
    location: 'กรุงเทพฯ',
    manager: 'คุณสมใจ'
  },
];

// API Service
class ApiService {
  constructor() {
    this.baseURL = config.apiBaseUrl;
  }

  buildUrl(endpoint) {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const cleanBaseUrl = this.baseURL.endsWith('/') ? this.baseURL : `${this.baseURL}/`;
    return `${cleanBaseUrl}${cleanEndpoint}`;
  }

  getAuthHeaders() {
    const token = localStorage.getItem(config.tokenKey);
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async request(endpoint, options = {}) {
    const url = this.buildUrl(endpoint);
    const defaultOptions = {
      headers: this.getAuthHeaders(),
    };

    const requestOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    if (config.debugMode) {
      console.log('API Request:', { url, method: requestOptions.method || 'GET' });
    }

    try {
      const response = await fetch(url, requestOptions);
      
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        let userFriendlyMessage;
        
        switch (response.status) {
          case 400:
            userFriendlyMessage = 'ข้อมูลที่ส่งไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่';
            break;
          case 401:
            userFriendlyMessage = 'ไม่มีสิทธิ์เข้าใช้งาน กรุณาเข้าสู่ระบบใหม่';
            break;
          case 403:
            userFriendlyMessage = 'ไม่มีสิทธิ์ใช้งานฟีเจอร์นี้';
            break;
          case 404:
            userFriendlyMessage = 'ไม่พบข้อมูลที่ต้องการ ระบบอาจยังไม่พร้อมใช้งาน';
            break;
          case 429:
            userFriendlyMessage = 'คำขอมากเกินไป กรุณารอสักครู่แล้วลองใหม่';
            break;
          case 500:
            userFriendlyMessage = 'เกิดข้อผิดพลาดในระบบ กรุณาติดต่อผู้ดูแลระบบ';
            break;
          case 502:
          case 503:
          case 504:
            userFriendlyMessage = 'ระบบไม่พร้อมใช้งานชั่วคราว กรุณาลองใหม่อีกครั้ง';
            break;
          default:
            userFriendlyMessage = `เกิดข้อผิดพลาด (${response.status}) กรุณาลองใหม่อีกครั้ง`;
        }

        const error = new Error(userFriendlyMessage);
        error.status = response.status;
        error.originalMessage = data.detail || data.message || response.statusText;
        throw error;
      }

      if (config.debugMode) {
        console.log('API Response:', data);
      }

      return { success: true, data, status: response.status };
    } catch (error) {
      if (config.debugMode) {
        console.error('API Error:', error);
      }

      let userFriendlyMessage = error.message;
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        userFriendlyMessage = 'ไม่สามารถเชื่อมต่อกับระบบได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
      } else if (error.name === 'AbortError') {
        userFriendlyMessage = 'การเชื่อมต่อใช้เวลานานเกินไป กรุณาลองใหม่';
      } else if (!error.status) {
        userFriendlyMessage = 'ไม่สามารถเชื่อมต่อกับระบบได้ กรุณาตรวจสอบการเชื่อมต่อ';
      }

      return {
        success: false,
        error: userFriendlyMessage,
        originalError: error.originalMessage || error.message,
        status: error.status || 0,
      };
    }
  }

  async get(endpoint, params = {}) {
    let url = endpoint;
    if (Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          searchParams.append(key, params[key]);
        }
      });
      url = `${endpoint}?${searchParams.toString()}`;
    }
    return this.request(url, { method: 'GET' });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async testConnection() {
    return this.request('/');
  }

  async getSalesData() {
    return this.get('/api/v1/sales');
  }

  async login(credentials) {
    return this.post('/auth/login', credentials);
  }

  async logout() {
    return this.post('/auth/logout');
  }

  async getProfile() {
    return this.get('/auth/me');
  }

  async exportSalesData() {
    return this.get('/api/v1/export/sales');
  }
}

const apiService = new ApiService();

// Connection Status Component
const ConnectionStatus = ({ connectionStatus, onRefresh, loading }) => {
  const [showAlert, setShowAlert] = useState(true);

  if (!config.debugMode || !connectionStatus) {
    return null;
  }

  return (
    <Collapse in={showAlert}>
      <Alert
        severity={connectionStatus.success ? 'success' : 'warning'}
        sx={{ m: 2 }}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              size="small"
              onClick={onRefresh}
              disabled={loading}
              sx={{ mr: 1 }}
              title="ทดสอบการเชื่อมต่อใหม่"
            >
              <RefreshIcon />
            </IconButton>
            <IconButton
              color="inherit"
              size="small"
              onClick={() => setShowAlert(false)}
              title="ปิดข้อความนี้"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        }
      >
        <Typography variant="body2">
          <strong>สถานะการเชื่อมต่อ:</strong>{' '}
          {connectionStatus.success ? (
            <>
              <span style={{ color: '#4caf50' }}>เชื่อมต่อสำเร็จ</span> - {config.apiBaseUrl}
              {connectionStatus.data?.message && (
                <><br />{connectionStatus.data.message}</>
              )}
            </>
          ) : (
            <>
              <span style={{ color: '#ff9800' }}>ไม่สามารถเชื่อมต่อได้</span>
              <br />เซิร์ฟเวอร์: {config.apiBaseUrl}
              <br />{connectionStatus.error}
              <br /><small>ระบบจะใช้ข้อมูลตัวอย่างในขณะนี้</small>
            </>
          )}
        </Typography>
      </Alert>
    </Collapse>
  );
};

// Environment Badge Component
const EnvironmentBadge = () => {
  if (!config.debugMode) return null;

  const getColor = () => {
    switch (config.environment) {
      case 'development': return 'primary';
      case 'staging': return 'warning';
      case 'production': return 'error';
      default: return 'default';
    }
  };

  return (
    <Chip
      label={`ENV: ${config.environment.toUpperCase()}`}
      color={getColor()}
      size="small"
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 9999,
        fontSize: '0.7rem',
      }}
    />
  );
};

// Navbar Component
const Navbar = ({ onMenuClick, user, onProfileClick, onLogout }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleProfileMenuOpen = (event) => {
    if (user) {
      setAnchorEl(event.currentTarget);
    } else {
      onProfileClick();
    }
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={onMenuClick}
          edge="start"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          {config.appName} - ระบบติดตามยอดขาย
        </Typography>

        <IconButton
          size="large"
          edge="end"
          aria-label="account of current user"
          onClick={handleProfileMenuOpen}
          color="inherit"
        >
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
            {user ? user.name.charAt(0).toUpperCase() : <PersonIcon />}
          </Avatar>
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileMenuClose}
        >
          <MenuItem onClick={() => { handleProfileMenuClose(); onProfileClick(); }}>
            <PersonIcon sx={{ mr: 1 }} /> โปรไฟล์
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => { handleProfileMenuClose(); onLogout(); }}>
            <LogoutIcon sx={{ mr: 1 }} /> ออกจากระบบ
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

// Side Drawer Component
const SideDrawer = ({ open, onClose, currentPage, onPageChange }) => {
  const menuItems = [
    { text: 'แดชบอร์ด', icon: <DashboardIcon />, page: 'dashboard' },
    { text: 'ข้อมูลสาขา', icon: <StoreIcon />, page: 'branches' },
    { text: 'ยอดขาย', icon: <TrendingUpIcon />, page: 'sales' },
    { text: 'รายงาน', icon: <AssessmentIcon />, page: 'reports' },
  ];

  if (config.debugMode) {
    menuItems.push({
      text: 'API Testing',
      icon: <AssessmentIcon />,
      page: 'api-test'
    });
  }

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: 280,
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={currentPage === item.page}
                onClick={() => {
                  onPageChange(item.page);
                  onClose();
                }}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ color: currentPage === item.page ? 'primary.main' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

// Login Dialog Component
const LoginDialog = ({ open, onClose, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await apiService.login({ username, password });
      
      if (result.success) {
        const { access_token, token_type } = result.data;
        
        localStorage.setItem(config.tokenKey, access_token);
        
        const userData = {
          name: username,
          email: `${username}@company.com`,
          role: 'Manager',
          token: access_token,
          tokenType: token_type
        };
        
        onLogin(userData);
        onClose();
        setUsername('');
        setPassword('');
      } else {
        if (config.isDevelopment) {
          console.warn('API Login failed, trying mock login:', result.error);
          
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const userData = {
            name: username,
            email: `${username}@company.com`,
            role: 'Manager (Mock)',
          };
          
          localStorage.setItem(config.tokenKey, 'mock-jwt-token');
          onLogin(userData);
          onClose();
          setUsername('');
          setPassword('');
        } else {
          alert(`เข้าสู่ระบบไม่สำเร็จ\n\n${result.error}\n\nกรุณาตรวจสอบ:\n• ชื่อผู้ใช้และรหัสผ่าน\n• การเชื่อมต่ออินเทอร์เน็ต`);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      if (config.isDevelopment) {
        const userData = {
          name: username,
          email: `${username}@company.com`,
          role: 'Manager (Offline)',
        };
        
        localStorage.setItem(config.tokenKey, 'mock-jwt-token');
        onLogin(userData);
        onClose();
        setUsername('');
        setPassword('');
      } else {
        alert(`เกิดข้อผิดพลาด\n\n${error.message}\n\nกรุณา:\n• ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต\n• ลองใหม่อีกครั้ง`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Typography variant="h5" component="div" gutterBottom>
          เข้าสู่ระบบ
        </Typography>
        <Typography variant="body2" color="text.secondary">
          กรุณาเข้าสู่ระบบเพื่อใช้งานฟีเจอร์ Export
          <br />
          <small>ทดสอบ: username=rungsun, password=1234</small>
        </Typography>
      </DialogTitle>
      
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="ชื่อผู้ใช้"
            fullWidth
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="เช่น rungsun"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="รหัสผ่าน"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="เช่น 1234"
            InputProps={{
              endAdornment: (
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              ),
            }}
          />
          {loading && <LinearProgress sx={{ mt: 2 }} />}
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} disabled={loading}>
            ยกเลิก
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading || !username || !password}
            sx={{ minWidth: 100 }}
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

// Profile Dialog Component
const ProfileDialog = ({ open, onClose, user }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        ข้อมูลโปรไฟล์
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        {user ? (
          <Box sx={{ textAlign: 'center', pt: 2 }}>
            <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}>
              {user.name.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h6" gutterBottom>
              {user.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {user.email}
            </Typography>
            <Chip label={user.role} color="primary" variant="outlined" />
          </Box>
        ) : (
          <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
            กรุณาเข้าสู่ระบบเพื่อดูข้อมูลโปรไฟล์
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Simple API Test Component
const ApiTestPage = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testLoginAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'rungsun',
          password: '1234'
        })
      });

      const data = await response.json();
      setTestResult({
        success: response.ok,
        status: response.status,
        data: data,
        timestamp: new Date().toLocaleString()
      });
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message,
        timestamp: new Date().toLocaleString()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>API Testing</Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Login API Test</Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Endpoint: POST {config.apiBaseUrl}/auth/login
          </Typography>
          
          <Button
            variant="contained"
            onClick={testLoginAPI}
            disabled={loading}
            sx={{ mb: 2 }}
          >
            {loading ? 'Testing...' : 'Test Login API'}
          </Button>

          {testResult && (
            <Alert 
              severity={testResult.success ? 'success' : 'error'}
              sx={{ mt: 2 }}
            >
              <Typography variant="body2">
                <strong>Status:</strong> {testResult.status || 'Error'}<br />
                <strong>Time:</strong> {testResult.timestamp}<br />
                <strong>Response:</strong>
              </Typography>
              <Box
                component="pre"
                sx={{
                  mt: 1,
                  p: 1,
                  backgroundColor: 'rgba(0,0,0,0.1)',
                  borderRadius: 1,
                  fontSize: '0.8rem',
                  overflow: 'auto'
                }}
              >
                {testResult.error || JSON.stringify(testResult.data, null, 2)}
              </Box>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Alert severity="info">
        <Typography variant="body2">
          <strong>Available Endpoints to Test:</strong><br />
          • GET / - Root endpoint<br />
          • POST /auth/login - Login<br />
          • GET /auth/me - User profile (requires auth)<br />
          • GET /api/v1/sales - Sales data<br />
          • GET /api/v1/branches - Branches data<br />
          • GET /api/v1/export/sales - Export sales (requires auth)
        </Typography>
      </Alert>
    </Box>
  );
};

// Dashboard Component
const Dashboard = ({ onExportRequest, user }) => {
  const [salesData, setSalesData] = useState(mockSalesData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const fetchSalesData = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiService.getSalesData();
      
      if (result.success) {
        setSalesData(result.data);
        setError(null);
      } else {
        if (config.isDevelopment) {
          console.warn('API ไม่พร้อมใช้งาน, ใช้ mock data แทน');
          setSalesData(mockSalesData);
          setError(result.error);
        } else {
          throw new Error(result.error);
        }
      }
    } catch (err) {
      const errorMessage = err.message || 'ไม่สามารถโหลดข้อมูลได้';
      setError(errorMessage);
      
      if (config.isDevelopment) {
        console.warn('ใช้ mock data เนื่องจาก:', errorMessage);
        setSalesData(mockSalesData);
      } else {
        setSalesData([]);
      }
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSalesData();
  }, []);

  const handleExportRequest = async () => {
    if (!user) {
      onExportRequest();
      return;
    }

    setExportLoading(true);
    try {
      const result = await apiService.exportSalesData();
      
      if (result.success || config.isDevelopment) {
        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 3000);
      } else {
        alert(`Export ไม่สำเร็จ\n\n${result.error}\n\nกรุณาลองใหม่อีกครั้ง`);
      }
    } catch (error) {
      console.error('Export error:', error);
      if (config.isDevelopment) {
        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 3000);
      }
    } finally {
      setExportLoading(false);
    }
  };

  const totalSales = salesData.reduce((sum, item) => sum + (item.sales || 0), 0);
  const avgGrowth = salesData.length > 0 
    ? salesData.reduce((sum, item) => sum + (item.growth || 0), 0) / salesData.length 
    : 0;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={40} />
        <Typography variant="h6" sx={{ mt: 2, color: 'primary.main' }}>
          กำลังโหลดข้อมูล...
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          กรุณารอสักครู่
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {exportSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" fontWeight="medium">
              Export ข้อมูลเรียบร้อยแล้ว!
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            ไฟล์ได้ถูกสร้างและพร้อมดาวน์โหลด
          </Typography>
        </Alert>
      )}

      {error && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={fetchSalesData}
              sx={{ whiteSpace: 'nowrap' }}
            >
              โหลดใหม่
            </Button>
          }
        >
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {error.includes('ไม่พบข้อมูล') ? 
                'ข้อมูลยังไม่พร้อม' : 
                'เกิดปัญหาในการโหลดข้อมูล'
              }
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {error.includes('ไม่พบข้อมูล') ? 
                'ระบบกำลังเตรียมข้อมูลให้คุณ กรุณารอสักครู่และลองใหม่' :
                error
              }
              {config.isDevelopment && (
                <><br /><small>ระบบใช้ข้อมูลตัวอย่างในขณะนี้</small></>
              )}
            </Typography>
          </Box>
        </Alert>
      )}

      <Typography variant="h4" gutterBottom>
        แดชบอร์ดภาพรวม
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                ยอดขายรวม
              </Typography>
              <Typography variant="h4" color="text.primary">
                ฿{totalSales.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                เดือนนี้ • {salesData.length} สาขา
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" color="secondary" gutterBottom>
                อัตราการเติบโต
              </Typography>
              <Typography variant="h4" color={avgGrowth > 0 ? 'success.main' : 'error.main'}>
                {avgGrowth > 0 ? '+' : ''}{avgGrowth.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                เฉลี่ยทุกสาขา
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              ข้อมูลยอดขายตามสาขา
            </Typography>
            <Button
              variant="contained"
              startIcon={<ExportIcon />}
              onClick={handleExportRequest}
              disabled={exportLoading}
              sx={{ borderRadius: 2 }}
            >
              {exportLoading ? 'กำลัง Export...' : 'Export ข้อมูล'}
            </Button>
          </Box>
          
          <Grid container spacing={2}>
            {salesData.map((branch, index) => (
              <Grid item xs={12} md={6} key={branch.id || index}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    {branch.branch || `สาขา ${index + 1}`}
                  </Typography>
                  <Typography variant="h5" color="primary" gutterBottom>
                    ฿{(branch.sales || 0).toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                        การเติบโต:
                      </Typography>
                      <Chip
                        label={`${(branch.growth || 0) > 0 ? '+' : ''}${(branch.growth || 0)}%`}
                        color={(branch.growth || 0) > 0 ? 'success' : 'error'}
                        size="small"
                      />
                    </Box>
                    {branch.location && (
                      <Typography variant="caption" color="text.secondary">
                        {branch.location}
                      </Typography>
                    )}
                  </Box>
                  {branch.manager && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      ผจก. {branch.manager}
                    </Typography>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

// Main App Component
function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [connectionLoading, setConnectionLoading] = useState(false);

  React.useEffect(() => {
    if (config.debugMode) {
      testConnection();
    }
    
    const token = localStorage.getItem(config.tokenKey);
    if (token && token !== 'mock-jwt-token') {
      validateToken(token);
    } else if (token === 'mock-jwt-token') {
      setUser({
        name: 'Mock User',
        email: 'mock@company.com',
        role: 'Manager (Mock)',
      });
    }
  }, []);

  const validateToken = async (token) => {
    try {
      const result = await apiService.getProfile();
      if (result.success) {
        setUser(result.data);
      } else {
        localStorage.removeItem(config.tokenKey);
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      localStorage.removeItem(config.tokenKey);
    }
  };

  const testConnection = async () => {
    setConnectionLoading(true);
    try {
      const result = await apiService.testConnection();
      setConnectionStatus(result);
    } catch (error) {
      setConnectionStatus({
        success: false,
        error: 'ไม่สามารถทดสอบการเชื่อมต่อได้',
      });
    } finally {
      setConnectionLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      if (user?.token && user.token !== 'mock-jwt-token') {
        await apiService.logout();
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      localStorage.removeItem(config.tokenKey);
      setUser(null);
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard 
            onExportRequest={() => setLoginDialogOpen(true)} 
            user={user}
          />
        );
      case 'branches':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>ข้อมูลสาขา</Typography>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="body2" fontWeight="medium" gutterBottom>
                หน้านี้กำลังพัฒนา
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ฟีเจอร์นี้จะเปิดใช้งานในเร็วๆ นี้ กรุณารอติดตาม
              </Typography>
            </Alert>
          </Box>
        );
      case 'sales':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>ยอดขาย</Typography>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="body2" fontWeight="medium" gutterBottom>
                หน้านี้กำลังพัฒนา
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ฟีเจอร์นี้จะเปิดใช้งานในเร็วๆ นี้ กรุณารอติดตาม
              </Typography>
            </Alert>
          </Box>
        );
      case 'reports':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>รายงาน</Typography>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="body2" fontWeight="medium" gutterBottom>
                หน้านี้กำลังพัฒนา
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ฟีเจอร์นี้จะเปิดใช้งานในเร็วๆ นี้ กรุณารอติดตาม
              </Typography>
            </Alert>
          </Box>
        );
      case 'api-test':
        return config.debugMode ? <ApiTestPage /> : null;
      default:
        return (
          <Dashboard 
            onExportRequest={() => setLoginDialogOpen(true)} 
            user={user}
          />
        );
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <Navbar
          onMenuClick={() => setDrawerOpen(true)}
          user={user}
          onProfileClick={() => setProfileDialogOpen(true)}
          onLogout={handleLogout}
        />
        
        <SideDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: 'background.default',
            minHeight: '100vh',
            mt: '64px',
          }}
        >
          <ConnectionStatus
            connectionStatus={connectionStatus}
            onRefresh={testConnection}
            loading={connectionLoading}
          />
          
          {renderCurrentPage()}
        </Box>

        <LoginDialog
          open={loginDialogOpen}
          onClose={() => setLoginDialogOpen(false)}
          onLogin={handleLogin}
        />

        <ProfileDialog
          open={profileDialogOpen}
          onClose={() => setProfileDialogOpen(false)}
          user={user}
        />
      </Box>
      
      <EnvironmentBadge />
    </ThemeProvider>
  );
}

export default App;

////////////////////////////////////////////////////////////
// import React, { useState } from 'react';
// import {
//   ThemeProvider,
//   createTheme,
//   CssBaseline,
//   Box,
//   AppBar,
//   Toolbar,
//   Typography,
//   IconButton,
//   Drawer,
//   List,
//   ListItem,
//   ListItemIcon,
//   ListItemText,
//   ListItemButton,
//   Card,
//   CardContent,
//   Grid,
//   Button,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   TextField,
//   DialogActions,
//   Avatar,
//   Menu,
//   MenuItem,
//   Divider,
//   Paper,
//   LinearProgress,
//   Chip,
//   Alert,
//   CircularProgress,
//   Collapse
// } from '@mui/material';
// import {
//   Menu as MenuIcon,
//   Dashboard as DashboardIcon,
//   Store as StoreIcon,
//   TrendingUp as TrendingUpIcon,
//   Assessment as AssessmentIcon,
//   FileDownload as ExportIcon,
//   Person as PersonIcon,
//   Logout as LogoutIcon,
//   Close as CloseIcon,
//   Visibility as VisibilityIcon,
//   VisibilityOff as VisibilityOffIcon,
//   Refresh as RefreshIcon
// } from '@mui/icons-material';

// // Configuration
// const config = {
//   apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8001',
//   apiVersion: process.env.REACT_APP_API_VERSION || 'api/v1',
//   environment: process.env.REACT_APP_ENV || 'development',
//   isDevelopment: process.env.REACT_APP_ENV === 'development',
//   appName: process.env.REACT_APP_APP_NAME || 'CN Dashboard',
//   tokenKey: process.env.REACT_APP_TOKEN_KEY || 'cn_dashboard_token',
//   debugMode: process.env.REACT_APP_DEBUG_MODE === 'true',
// };

// // Theme
// const theme = createTheme({
//   palette: {
//     primary: {
//       main: '#1976d2',
//       light: '#42a5f5',
//       dark: '#1565c0',
//     },
//     secondary: {
//       main: '#ff9800',
//       light: '#ffb74d',
//       dark: '#f57c00',
//     },
//     background: {
//       default: '#f5f5f5',
//       paper: '#ffffff',
//     },
//     success: {
//       main: '#4caf50',
//     },
//     error: {
//       main: '#f44336',
//     },
//   },
//   typography: {
//     fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
//     h4: {
//       fontWeight: 600,
//     },
//     h6: {
//       fontWeight: 500,
//     },
//   },
//   shape: {
//     borderRadius: 12,
//   },
//   components: {
//     MuiCard: {
//       styleOverrides: {
//         root: {
//           boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//           transition: 'all 0.3s ease',
//           '&:hover': {
//             boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
//           },
//         },
//       },
//     },
//     MuiButton: {
//       styleOverrides: {
//         root: {
//           textTransform: 'none',
//           borderRadius: 8,
//         },
//       },
//     },
//   },
// });

// // Mock Data
// const mockSalesData = [
//   { 
//     id: 1,
//     branch: 'สาขาเซ็นทรัล', 
//     sales: 1250000, 
//     growth: 12.5,
//     location: 'กรุงเทพฯ',
//     manager: 'คุณสมชาย'
//   },
//   { 
//     id: 2,
//     branch: 'สาขาสยาม', 
//     sales: 980000, 
//     growth: 8.3,
//     location: 'กรุงเทพฯ',
//     manager: 'คุณสมหญิง'
//   },
//   { 
//     id: 3,
//     branch: 'สาขาอโศก', 
//     sales: 1100000, 
//     growth: 15.2,
//     location: 'กรุงเทพฯ',
//     manager: 'คุณสมศักดิ์'
//   },
//   { 
//     id: 4,
//     branch: 'สาขาสีลม', 
//     sales: 850000, 
//     growth: -2.1,
//     location: 'กรุงเทพฯ',
//     manager: 'คุณสมใจ'
//   },
// ];

// // API Service
// class ApiService {
//   constructor() {
//     this.baseURL = config.apiBaseUrl;
//   }

//   buildUrl(endpoint) {
//     const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
//     const cleanBaseUrl = this.baseURL.endsWith('/') ? this.baseURL : `${this.baseURL}/`;
//     return `${cleanBaseUrl}${cleanEndpoint}`;
//   }

//   getAuthHeaders() {
//     const token = localStorage.getItem(config.tokenKey);
//     return {
//       'Content-Type': 'application/json',
//       'Accept': 'application/json',
//       ...(token && { Authorization: `Bearer ${token}` }),
//     };
//   }

//   async request(endpoint, options = {}) {
//     const url = this.buildUrl(endpoint);
//     const defaultOptions = {
//       headers: this.getAuthHeaders(),
//     };

//     const requestOptions = {
//       ...defaultOptions,
//       ...options,
//       headers: {
//         ...defaultOptions.headers,
//         ...options.headers,
//       },
//     };

//     if (config.debugMode) {
//       console.log('🚀 API Request:', { url, method: requestOptions.method || 'GET' });
//     }

//     try {
//       const response = await fetch(url, requestOptions);
      
//       let data;
//       const contentType = response.headers.get('content-type');
      
//       if (contentType && contentType.includes('application/json')) {
//         data = await response.json();
//       } else {
//         data = await response.text();
//       }

//       if (!response.ok) {
//         throw new Error(data.detail || data.message || `HTTP error! status: ${response.status}`);
//       }

//       if (config.debugMode) {
//         console.log('✅ API Response:', data);
//       }

//       return { success: true, data, status: response.status };
//     } catch (error) {
//       if (config.debugMode) {
//         console.error('❌ API Error:', error);
//       }

//       return {
//         success: false,
//         error: error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
//         status: error.status || 500,
//       };
//     }
//   }

//   async get(endpoint, params = {}) {
//     let url = endpoint;
//     if (Object.keys(params).length > 0) {
//       const searchParams = new URLSearchParams();
//       Object.keys(params).forEach(key => {
//         if (params[key] !== null && params[key] !== undefined) {
//           searchParams.append(key, params[key]);
//         }
//       });
//       url = `${endpoint}?${searchParams.toString()}`;
//     }
//     return this.request(url, { method: 'GET' });
//   }

//   async post(endpoint, data = {}) {
//     return this.request(endpoint, {
//       method: 'POST',
//       body: JSON.stringify(data),
//     });
//   }

//   async testConnection() {
//     return this.request('/');
//   }

//   async getSalesData() {
//     return this.get('/api/v1/sales');
//   }

//   async login(credentials) {
//     return this.post('/auth/login', credentials);
//   }

//   async logout() {
//     return this.post('/auth/logout');
//   }

//   async getProfile() {
//     return this.get('/auth/me');
//   }

//   async exportSalesData() {
//     return this.get('/api/v1/export/sales');
//   }
// }

// const apiService = new ApiService();

// // Connection Status Component
// const ConnectionStatus = ({ connectionStatus, onRefresh, loading }) => {
//   const [showAlert, setShowAlert] = useState(true);

//   if (!config.debugMode || !connectionStatus) {
//     return null;
//   }

//   return (
//     <Collapse in={showAlert}>
//       <Alert
//         severity={connectionStatus.success ? 'success' : 'error'}
//         sx={{ m: 2 }}
//         action={
//           <Box sx={{ display: 'flex', alignItems: 'center' }}>
//             <IconButton
//               color="inherit"
//               size="small"
//               onClick={onRefresh}
//               disabled={loading}
//               sx={{ mr: 1 }}
//             >
//               <RefreshIcon />
//             </IconButton>
//             <IconButton
//               color="inherit"
//               size="small"
//               onClick={() => setShowAlert(false)}
//             >
//               <CloseIcon />
//             </IconButton>
//           </Box>
//         }
//       >
//         <Typography variant="body2">
//           <strong>API Connection:</strong>{' '}
//           {connectionStatus.success ? (
//             <>
//               เชื่อมต่อสำเร็จ - {config.apiBaseUrl}
//               {connectionStatus.data?.message && (
//                 <><br />📡 {connectionStatus.data.message}</>
//               )}
//             </>
//           ) : (
//             <>
//               เชื่อมต่อไม่สำเร็จ - {connectionStatus.error}
//               <br />🔗 ตรวจสอบ: {config.apiBaseUrl}
//             </>
//           )}
//         </Typography>
//       </Alert>
//     </Collapse>
//   );
// };

// // Environment Badge Component
// const EnvironmentBadge = () => {
//   if (!config.debugMode) return null;

//   const getColor = () => {
//     switch (config.environment) {
//       case 'development': return 'primary';
//       case 'staging': return 'warning';
//       case 'production': return 'error';
//       default: return 'default';
//     }
//   };

//   return (
//     <Chip
//       label={`ENV: ${config.environment.toUpperCase()}`}
//       color={getColor()}
//       size="small"
//       sx={{
//         position: 'fixed',
//         bottom: 16,
//         right: 16,
//         zIndex: 9999,
//         fontSize: '0.7rem',
//       }}
//     />
//   );
// };

// // Navbar Component
// const Navbar = ({ onMenuClick, user, onProfileClick, onLogout }) => {
//   const [anchorEl, setAnchorEl] = useState(null);

//   const handleProfileMenuOpen = (event) => {
//     if (user) {
//       setAnchorEl(event.currentTarget);
//     } else {
//       onProfileClick();
//     }
//   };

//   const handleProfileMenuClose = () => {
//     setAnchorEl(null);
//   };

//   return (
//     <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
//       <Toolbar>
//         <IconButton
//           color="inherit"
//           aria-label="open drawer"
//           onClick={onMenuClick}
//           edge="start"
//           sx={{ mr: 2 }}
//         >
//           <MenuIcon />
//         </IconButton>
        
//         <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
//           {config.appName} - ระบบติดตามยอดขาย
//         </Typography>

//         <IconButton
//           size="large"
//           edge="end"
//           aria-label="account of current user"
//           onClick={handleProfileMenuOpen}
//           color="inherit"
//         >
//           <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
//             {user ? user.name.charAt(0).toUpperCase() : <PersonIcon />}
//           </Avatar>
//         </IconButton>

//         <Menu
//           anchorEl={anchorEl}
//           open={Boolean(anchorEl)}
//           onClose={handleProfileMenuClose}
//         >
//           <MenuItem onClick={() => { handleProfileMenuClose(); onProfileClick(); }}>
//             <PersonIcon sx={{ mr: 1 }} /> โปรไฟล์
//           </MenuItem>
//           <Divider />
//           <MenuItem onClick={() => { handleProfileMenuClose(); onLogout(); }}>
//             <LogoutIcon sx={{ mr: 1 }} /> ออกจากระบบ
//           </MenuItem>
//         </Menu>
//       </Toolbar>
//     </AppBar>
//   );
// };

// // Side Drawer Component
// const SideDrawer = ({ open, onClose, currentPage, onPageChange }) => {
//   const menuItems = [
//     { text: 'แดชบอร์ด', icon: <DashboardIcon />, page: 'dashboard' },
//     { text: 'ข้อมูลสาขา', icon: <StoreIcon />, page: 'branches' },
//     { text: 'ยอดขาย', icon: <TrendingUpIcon />, page: 'sales' },
//     { text: 'รายงาน', icon: <AssessmentIcon />, page: 'reports' },
//   ];

//   // Add API Testing page in development mode
//   if (config.debugMode) {
//     menuItems.push({
//       text: '🧪 API Testing',
//       icon: <AssessmentIcon />,
//       page: 'api-test'
//     });
//   }

//   return (
//     <Drawer
//       variant="temporary"
//       open={open}
//       onClose={onClose}
//       ModalProps={{ keepMounted: true }}
//       sx={{
//         '& .MuiDrawer-paper': {
//           boxSizing: 'border-box',
//           width: 280,
//           backgroundColor: 'background.paper',
//         },
//       }}
//     >
//       <Toolbar />
//       <Box sx={{ overflow: 'auto' }}>
//         <List>
//           {menuItems.map((item) => (
//             <ListItem key={item.text} disablePadding>
//               <ListItemButton
//                 selected={currentPage === item.page}
//                 onClick={() => {
//                   onPageChange(item.page);
//                   onClose();
//                 }}
//                 sx={{
//                   '&.Mui-selected': {
//                     backgroundColor: 'primary.light',
//                     '&:hover': {
//                       backgroundColor: 'primary.light',
//                     },
//                   },
//                 }}
//               >
//                 <ListItemIcon sx={{ color: currentPage === item.page ? 'primary.main' : 'inherit' }}>
//                   {item.icon}
//                 </ListItemIcon>
//                 <ListItemText primary={item.text} />
//               </ListItemButton>
//             </ListItem>
//           ))}
//         </List>
//       </Box>
//     </Drawer>
//   );
// };

// // Login Dialog Component
// const LoginDialog = ({ open, onClose, onLogin }) => {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
    
//     try {
//       // Always try real API call first
//       const result = await apiService.login({ username, password });
      
//       if (result.success) {
//         const { access_token, token_type } = result.data;
        
//         // Store the token
//         localStorage.setItem(config.tokenKey, access_token);
        
//         // Create user object (you might want to get this from a profile endpoint)
//         const userData = {
//           name: username,
//           email: `${username}@company.com`,
//           role: 'Manager',
//           token: access_token,
//           tokenType: token_type
//         };
        
//         onLogin(userData);
//         onClose();
//         setUsername('');
//         setPassword('');
//       } else {
//         // If API fails in development, try mock login
//         if (config.isDevelopment) {
//           console.warn('API Login failed, trying mock login:', result.error);
          
//           // Mock login fallback
//           await new Promise(resolve => setTimeout(resolve, 500));
          
//           const userData = {
//             name: username,
//             email: `${username}@company.com`,
//             role: 'Manager (Mock)',
//           };
          
//           localStorage.setItem(config.tokenKey, 'mock-jwt-token');
//           onLogin(userData);
//           onClose();
//           setUsername('');
//           setPassword('');
//         } else {
//           alert('เข้าสู่ระบบไม่สำเร็จ: ' + (result.error || 'ข้อมูลไม่ถูกต้อง'));
//         }
//       }
//     } catch (error) {
//       console.error('Login error:', error);
//       if (config.isDevelopment) {
//         // Mock login as fallback in development
//         const userData = {
//           name: username,
//           email: `${username}@company.com`,
//           role: 'Manager (Offline)',
//         };
        
//         localStorage.setItem(config.tokenKey, 'mock-jwt-token');
//         onLogin(userData);
//         onClose();
//         setUsername('');
//         setPassword('');
//       } else {
//         alert('เกิดข้อผิดพลาด: ' + error.message);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
//       <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
//         <Typography variant="h5" component="div" gutterBottom>
//           เข้าสู่ระบบ
//         </Typography>
//         <Typography variant="body2" color="text.secondary">
//           กรุณาเข้าสู่ระบบเพื่อใช้งานฟีเจอร์ Export
//           <br />
//           <small>ทดสอบ: username=rungsun, password=1234</small>
//         </Typography>
//       </DialogTitle>
      
//       <Box component="form" onSubmit={handleSubmit}>
//         <DialogContent>
//           <TextField
//             autoFocus
//             margin="dense"
//             label="ชื่อผู้ใช้"
//             fullWidth
//             variant="outlined"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             placeholder="เช่น rungsun"
//             sx={{ mb: 2 }}
//           />
//           <TextField
//             margin="dense"
//             label="รหัสผ่าน"
//             type={showPassword ? 'text' : 'password'}
//             fullWidth
//             variant="outlined"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             placeholder="เช่น 1234"
//             InputProps={{
//               endAdornment: (
//                 <IconButton
//                   aria-label="toggle password visibility"
//                   onClick={() => setShowPassword(!showPassword)}
//                   edge="end"
//                 >
//                   {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
//                 </IconButton>
//               ),
//             }}
//           />
//           {loading && <LinearProgress sx={{ mt: 2 }} />}
//         </DialogContent>
        
//         <DialogActions sx={{ p: 3 }}>
//           <Button onClick={onClose} disabled={loading}>
//             ยกเลิก
//           </Button>
//           <Button 
//             type="submit" 
//             variant="contained" 
//             disabled={loading || !username || !password}
//             sx={{ minWidth: 100 }}
//           >
//             {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
//           </Button>
//         </DialogActions>
//       </Box>
//     </Dialog>
//   );
// };

// // Profile Dialog Component
// const ProfileDialog = ({ open, onClose, user }) => {
//   return (
//     <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
//       <DialogTitle>
//         ข้อมูลโปรไฟล์
//         <IconButton
//           aria-label="close"
//           onClick={onClose}
//           sx={{ position: 'absolute', right: 8, top: 8 }}
//         >
//           <CloseIcon />
//         </IconButton>
//       </DialogTitle>
      
//       <DialogContent>
//         {user ? (
//           <Box sx={{ textAlign: 'center', pt: 2 }}>
//             <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}>
//               {user.name.charAt(0).toUpperCase()}
//             </Avatar>
//             <Typography variant="h6" gutterBottom>
//               {user.name}
//             </Typography>
//             <Typography variant="body2" color="text.secondary" gutterBottom>
//               {user.email}
//             </Typography>
//             <Chip label={user.role} color="primary" variant="outlined" />
//           </Box>
//         ) : (
//           <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
//             กรุณาเข้าสู่ระบบเพื่อดูข้อมูลโปรไฟล์
//           </Typography>
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// };

// // Simple API Test Component (inline)
// const ApiTestPage = () => {
//   const [testResult, setTestResult] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const testLoginAPI = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch(`${config.apiBaseUrl}/auth/login`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           username: 'rungsun',
//           password: '1234'
//         })
//       });

//       const data = await response.json();
//       setTestResult({
//         success: response.ok,
//         status: response.status,
//         data: data,
//         timestamp: new Date().toLocaleString()
//       });
//     } catch (error) {
//       setTestResult({
//         success: false,
//         error: error.message,
//         timestamp: new Date().toLocaleString()
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Box sx={{ p: 3 }}>
//       <Typography variant="h4" gutterBottom>🧪 API Testing</Typography>
      
//       <Card sx={{ mb: 3 }}>
//         <CardContent>
//           <Typography variant="h6" gutterBottom>Login API Test</Typography>
//           <Typography variant="body2" color="text.secondary" gutterBottom>
//             Endpoint: POST {config.apiBaseUrl}/auth/login
//           </Typography>
          
//           <Button
//             variant="contained"
//             onClick={testLoginAPI}
//             disabled={loading}
//             sx={{ mb: 2 }}
//           >
//             {loading ? 'Testing...' : 'Test Login API'}
//           </Button>

//           {testResult && (
//             <Alert 
//               severity={testResult.success ? 'success' : 'error'}
//               sx={{ mt: 2 }}
//             >
//               <Typography variant="body2">
//                 <strong>Status:</strong> {testResult.status || 'Error'}<br />
//                 <strong>Time:</strong> {testResult.timestamp}<br />
//                 <strong>Response:</strong>
//               </Typography>
//               <Box
//                 component="pre"
//                 sx={{
//                   mt: 1,
//                   p: 1,
//                   backgroundColor: 'rgba(0,0,0,0.1)',
//                   borderRadius: 1,
//                   fontSize: '0.8rem',
//                   overflow: 'auto'
//                 }}
//               >
//                 {testResult.error || JSON.stringify(testResult.data, null, 2)}
//               </Box>
//             </Alert>
//           )}
//         </CardContent>
//       </Card>

//       <Alert severity="info">
//         <Typography variant="body2">
//           <strong>Available Endpoints to Test:</strong><br />
//           • GET / - Root endpoint<br />
//           • POST /auth/login - Login<br />
//           • GET /auth/me - User profile (requires auth)<br />
//           • GET /api/v1/sales - Sales data<br />
//           • GET /api/v1/branches - Branches data<br />
//           • GET /api/v1/export/sales - Export sales (requires auth)
//         </Typography>
//       </Alert>
//     </Box>
//   );
// };
// const Dashboard = ({ onExportRequest, user }) => {
//   const [salesData, setSalesData] = useState(mockSalesData);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [exportLoading, setExportLoading] = useState(false);
//   const [exportSuccess, setExportSuccess] = useState(false);

//   const fetchSalesData = async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       const result = await apiService.getSalesData();
      
//       if (result.success) {
//         setSalesData(result.data);
//       } else {
//         if (config.isDevelopment) {
//           console.warn('API ไม่พร้อมใช้งาน, ใช้ mock data แทน');
//           setSalesData(mockSalesData);
//           setError('ไม่สามารถเชื่อมต่อ API ได้ (ใช้ข้อมูลตัวอย่าง)');
//         } else {
//           throw new Error(result.error);
//         }
//       }
//     } catch (err) {
//       setError(err.message);
//       if (config.isDevelopment) {
//         setSalesData(mockSalesData);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   React.useEffect(() => {
//     fetchSalesData();
//   }, []);

//   const handleExportRequest = async () => {
//     if (!user) {
//       onExportRequest();
//       return;
//     }

//     setExportLoading(true);
//     try {
//       const result = await apiService.exportSalesData();
      
//       if (result.success || config.isDevelopment) {
//         setExportSuccess(true);
//         setTimeout(() => setExportSuccess(false), 3000);
//       } else {
//         alert('Export ไม่สำเร็จ: ' + result.error);
//       }
//     } catch (error) {
//       console.error('Export error:', error);
//       if (config.isDevelopment) {
//         setExportSuccess(true);
//         setTimeout(() => setExportSuccess(false), 3000);
//       }
//     } finally {
//       setExportLoading(false);
//     }
//   };

//   const totalSales = salesData.reduce((sum, item) => sum + (item.sales || 0), 0);
//   const avgGrowth = salesData.length > 0 
//     ? salesData.reduce((sum, item) => sum + (item.growth || 0), 0) / salesData.length 
//     : 0;

//   if (loading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
//         <CircularProgress />
//         <Typography variant="h6" sx={{ ml: 2 }}>
//           กำลังโหลดข้อมูล...
//         </Typography>
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ p: 3 }}>
//       {exportSuccess && (
//         <Alert severity="success" sx={{ mb: 3 }}>
//           Export ข้อมูลเรียบร้อยแล้ว!
//         </Alert>
//       )}

//       {error && (
//         <Alert 
//           severity="warning" 
//           sx={{ mb: 3 }}
//           action={
//             <Button color="inherit" size="small" onClick={fetchSalesData}>
//               ลองใหม่
//             </Button>
//           }
//         >
//           {error}
//         </Alert>
//       )}

//       <Typography variant="h4" gutterBottom>
//         แดชบอร์ดภาพรวม
//       </Typography>
      
//       {/* Cards สรุปยอดขาย */}
//       <Grid container spacing={3} sx={{ mb: 4 }}>
//         <Grid item xs={12} md={6}>
//           <Card sx={{ height: '100%' }}>
//             <CardContent>
//               <Typography variant="h6" color="primary" gutterBottom>
//                 ยอดขายรวม
//               </Typography>
//               <Typography variant="h4" color="text.primary">
//                 ฿{totalSales.toLocaleString()}
//               </Typography>
//               <Typography variant="body2" color="text.secondary">
//                 เดือนนี้ • {salesData.length} สาขา
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>
        
//         <Grid item xs={12} md={6}>
//           <Card sx={{ height: '100%' }}>
//             <CardContent>
//               <Typography variant="h6" color="secondary" gutterBottom>
//                 อัตราการเติบโต
//               </Typography>
//               <Typography variant="h4" color={avgGrowth > 0 ? 'success.main' : 'error.main'}>
//                 {avgGrowth > 0 ? '+' : ''}{avgGrowth.toFixed(1)}%
//               </Typography>
//               <Typography variant="body2" color="text.secondary">
//                 เฉลี่ยทุกสาขา
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>

//       {/* ตารางข้อมูลสาขา */}
//       <Card>
//         <CardContent>
//           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
//             <Typography variant="h6">
//               ข้อมูลยอดขายตามสาขา
//             </Typography>
//             <Button
//               variant="contained"
//               startIcon={<ExportIcon />}
//               onClick={handleExportRequest}
//               disabled={exportLoading}
//               sx={{ borderRadius: 2 }}
//             >
//               {exportLoading ? 'กำลัง Export...' : 'Export ข้อมูล'}
//             </Button>
//           </Box>
          
//           <Grid container spacing={2}>
//             {salesData.map((branch, index) => (
//               <Grid item xs={12} md={6} key={branch.id || index}>
//                 <Paper sx={{ p: 3, borderRadius: 2 }}>
//                   <Typography variant="h6" gutterBottom>
//                     {branch.branch || `สาขา ${index + 1}`}
//                   </Typography>
//                   <Typography variant="h5" color="primary" gutterBottom>
//                     ฿{(branch.sales || 0).toLocaleString()}
//                   </Typography>
//                   <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//                     <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                       <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
//                         การเติบโต:
//                       </Typography>
//                       <Chip
//                         label={`${(branch.growth || 0) > 0 ? '+' : ''}${(branch.growth || 0)}%`}
//                         color={(branch.growth || 0) > 0 ? 'success' : 'error'}
//                         size="small"
//                       />
//                     </Box>
//                     {branch.location && (
//                       <Typography variant="caption" color="text.secondary">
//                         📍 {branch.location}
//                       </Typography>
//                     )}
//                   </Box>
//                   {branch.manager && (
//                     <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
//                       👤 ผจก. {branch.manager}
//                     </Typography>
//                   )}
//                 </Paper>
//               </Grid>
//             ))}
//           </Grid>
//         </CardContent>
//       </Card>
//     </Box>
//   );
// };

// // Main App Component
// function App() {
//   const [drawerOpen, setDrawerOpen] = useState(false);
//   const [currentPage, setCurrentPage] = useState('dashboard');
//   const [loginDialogOpen, setLoginDialogOpen] = useState(false);
//   const [profileDialogOpen, setProfileDialogOpen] = useState(false);
//   const [user, setUser] = useState(null);
//   const [connectionStatus, setConnectionStatus] = useState(null);
//   const [connectionLoading, setConnectionLoading] = useState(false);

//   // Test API connection on app start
//   React.useEffect(() => {
//     if (config.debugMode) {
//       testConnection();
//     }
    
//     // Check for existing token and validate it
//     const token = localStorage.getItem(config.tokenKey);
//     if (token && token !== 'mock-jwt-token') {
//       // Try to get user profile with the stored token
//       validateToken(token);
//     } else if (token === 'mock-jwt-token') {
//       // Mock user for development
//       setUser({
//         name: 'Mock User',
//         email: 'mock@company.com',
//         role: 'Manager (Mock)',
//       });
//     }
//   }, []);

//   const validateToken = async (token) => {
//     try {
//       const result = await apiService.getProfile();
//       if (result.success) {
//         setUser(result.data);
//       } else {
//         // Token is invalid, remove it
//         localStorage.removeItem(config.tokenKey);
//       }
//     } catch (error) {
//       console.error('Token validation failed:', error);
//       localStorage.removeItem(config.tokenKey);
//     }
//   };

//   const testConnection = async () => {
//     setConnectionLoading(true);
//     try {
//       const result = await apiService.testConnection();
//       setConnectionStatus(result);
//     } catch (error) {
//       setConnectionStatus({
//         success: false,
//         error: 'ไม่สามารถทดสอบการเชื่อมต่อได้',
//       });
//     } finally {
//       setConnectionLoading(false);
//     }
//   };

//   const handleLogin = (userData) => {
//     setUser(userData);
//   };

//   const handleLogout = async () => {
//     try {
//       // Try to call logout API if user has real token
//       if (user?.token && user.token !== 'mock-jwt-token') {
//         await apiService.logout();
//       }
//     } catch (error) {
//       console.error('Logout API error:', error);
//     } finally {
//       // Always clear local data
//       localStorage.removeItem(config.tokenKey);
//       setUser(null);
//     }
//   };

//   const renderCurrentPage = () => {
//     switch (currentPage) {
//       case 'dashboard':
//         return (
//           <Dashboard 
//             onExportRequest={() => setLoginDialogOpen(true)} 
//             user={user}
//           />
//         );
//       case 'branches':
//         return (
//           <Box sx={{ p: 3 }}>
//             <Typography variant="h4" gutterBottom>ข้อมูลสาขา</Typography>
//             <Alert severity="info">หน้านี้กำลังพัฒนา</Alert>
//           </Box>
//         );
//       case 'sales':
//         return (
//           <Box sx={{ p: 3 }}>
//             <Typography variant="h4" gutterBottom>ยอดขาย</Typography>
//             <Alert severity="info">หน้านี้กำลังพัฒนา</Alert>
//           </Box>
//         );
//       case 'reports':
//         return (
//           <Box sx={{ p: 3 }}>
//             <Typography variant="h4" gutterBottom>รายงาน</Typography>
//             <Alert severity="info">หน้านี้กำลังพัฒนา</Alert>
//           </Box>
//         );
//       case 'api-test':
//         return config.debugMode ? <ApiTestPage /> : null;
//       default:
//         return (
//           <Dashboard 
//             onExportRequest={() => setLoginDialogOpen(true)} 
//             user={user}
//           />
//         );
//     }
//   };

//   return (
//     <ThemeProvider theme={theme}>
//       <CssBaseline />
//       <Box sx={{ display: 'flex' }}>
//         <Navbar
//           onMenuClick={() => setDrawerOpen(true)}
//           user={user}
//           onProfileClick={() => setProfileDialogOpen(true)}
//           onLogout={handleLogout}
//         />
        
//         <SideDrawer
//           open={drawerOpen}
//           onClose={() => setDrawerOpen(false)}
//           currentPage={currentPage}
//           onPageChange={setCurrentPage}
//         />

//         <Box
//           component="main"
//           sx={{
//             flexGrow: 1,
//             bgcolor: 'background.default',
//             minHeight: '100vh',
//             mt: '64px',
//           }}
//         >
//           <ConnectionStatus
//             connectionStatus={connectionStatus}
//             onRefresh={testConnection}
//             loading={connectionLoading}
//           />
          
//           {renderCurrentPage()}
//         </Box>

//         <LoginDialog
//           open={loginDialogOpen}
//           onClose={() => setLoginDialogOpen(false)}
//           onLogin={handleLogin}
//         />

//         <ProfileDialog
//           open={profileDialogOpen}
//           onClose={() => setProfileDialogOpen(false)}
//           user={user}
//         />
//       </Box>
      
//       <EnvironmentBadge />
//     </ThemeProvider>
//   );
// }

// export default App;

///////////////////////////////////////////////
// import React, { useState } from 'react';
// import {
//   ThemeProvider,
//   createTheme,
//   CssBaseline,
//   Box,
//   AppBar,
//   Toolbar,
//   Typography,
//   IconButton,
//   Drawer,
//   List,
//   ListItem,
//   ListItemIcon,
//   ListItemText,
//   ListItemButton,
//   Card,
//   CardContent,
//   Grid,
//   Button,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   TextField,
//   DialogActions,
//   Avatar,
//   Menu,
//   MenuItem,
//   Divider,
//   Paper,
//   LinearProgress,
//   Chip,
//   Alert,
//   CircularProgress,
//   Collapse
// } from '@mui/material';
// import {
//   Menu as MenuIcon,
//   Dashboard as DashboardIcon,
//   Store as StoreIcon,
//   TrendingUp as TrendingUpIcon,
//   Assessment as AssessmentIcon,
//   FileDownload as ExportIcon,
//   Person as PersonIcon,
//   Logout as LogoutIcon,
//   Close as CloseIcon,
//   Visibility as VisibilityIcon,
//   VisibilityOff as VisibilityOffIcon,
//   Refresh as RefreshIcon
// } from '@mui/icons-material';

// // Configuration
// const config = {
//   apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8001',
//   apiVersion: process.env.REACT_APP_API_VERSION || 'api/v1',
//   environment: process.env.REACT_APP_ENV || 'development',
//   isDevelopment: process.env.REACT_APP_ENV === 'development',
//   appName: process.env.REACT_APP_APP_NAME || 'CN Dashboard',
//   tokenKey: process.env.REACT_APP_TOKEN_KEY || 'cn_dashboard_token',
//   debugMode: process.env.REACT_APP_DEBUG_MODE === 'true',
// };

// // Theme
// const theme = createTheme({
//   palette: {
//     primary: {
//       main: '#1976d2',
//       light: '#42a5f5',
//       dark: '#1565c0',
//     },
//     secondary: {
//       main: '#ff9800',
//       light: '#ffb74d',
//       dark: '#f57c00',
//     },
//     background: {
//       default: '#f5f5f5',
//       paper: '#ffffff',
//     },
//     success: {
//       main: '#4caf50',
//     },
//     error: {
//       main: '#f44336',
//     },
//   },
//   typography: {
//     fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
//     h4: {
//       fontWeight: 600,
//     },
//     h6: {
//       fontWeight: 500,
//     },
//   },
//   shape: {
//     borderRadius: 12,
//   },
//   components: {
//     MuiCard: {
//       styleOverrides: {
//         root: {
//           boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//           transition: 'all 0.3s ease',
//           '&:hover': {
//             boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
//           },
//         },
//       },
//     },
//     MuiButton: {
//       styleOverrides: {
//         root: {
//           textTransform: 'none',
//           borderRadius: 8,
//         },
//       },
//     },
//   },
// });

// // Mock Data
// const mockSalesData = [
//   { 
//     id: 1,
//     branch: 'สาขาเซ็นทรัล', 
//     sales: 1250000, 
//     growth: 12.5,
//     location: 'กรุงเทพฯ',
//     manager: 'คุณสมชาย'
//   },
//   { 
//     id: 2,
//     branch: 'สาขาสยาม', 
//     sales: 980000, 
//     growth: 8.3,
//     location: 'กรุงเทพฯ',
//     manager: 'คุณสมหญิง'
//   },
//   { 
//     id: 3,
//     branch: 'สาขาอโศก', 
//     sales: 1100000, 
//     growth: 15.2,
//     location: 'กรุงเทพฯ',
//     manager: 'คุณสมศักดิ์'
//   },
//   { 
//     id: 4,
//     branch: 'สาขาสีลม', 
//     sales: 850000, 
//     growth: -2.1,
//     location: 'กรุงเทพฯ',
//     manager: 'คุณสมใจ'
//   },
// ];

// // API Service
// class ApiService {
//   constructor() {
//     this.baseURL = config.apiBaseUrl;
//   }

//   buildUrl(endpoint) {
//     const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
//     const cleanBaseUrl = this.baseURL.endsWith('/') ? this.baseURL : `${this.baseURL}/`;
//     return `${cleanBaseUrl}${cleanEndpoint}`;
//   }

//   getAuthHeaders() {
//     const token = localStorage.getItem(config.tokenKey);
//     return {
//       'Content-Type': 'application/json',
//       'Accept': 'application/json',
//       ...(token && { Authorization: `Bearer ${token}` }),
//     };
//   }

//   async request(endpoint, options = {}) {
//     const url = this.buildUrl(endpoint);
//     const defaultOptions = {
//       headers: this.getAuthHeaders(),
//     };

//     const requestOptions = {
//       ...defaultOptions,
//       ...options,
//       headers: {
//         ...defaultOptions.headers,
//         ...options.headers,
//       },
//     };

//     if (config.debugMode) {
//       console.log('🚀 API Request:', { url, method: requestOptions.method || 'GET' });
//     }

//     try {
//       const response = await fetch(url, requestOptions);
      
//       let data;
//       const contentType = response.headers.get('content-type');
      
//       if (contentType && contentType.includes('application/json')) {
//         data = await response.json();
//       } else {
//         data = await response.text();
//       }

//       if (!response.ok) {
//         throw new Error(data.detail || data.message || `HTTP error! status: ${response.status}`);
//       }

//       if (config.debugMode) {
//         console.log('✅ API Response:', data);
//       }

//       return { success: true, data, status: response.status };
//     } catch (error) {
//       if (config.debugMode) {
//         console.error('❌ API Error:', error);
//       }

//       return {
//         success: false,
//         error: error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
//         status: error.status || 500,
//       };
//     }
//   }

//   async get(endpoint, params = {}) {
//     let url = endpoint;
//     if (Object.keys(params).length > 0) {
//       const searchParams = new URLSearchParams();
//       Object.keys(params).forEach(key => {
//         if (params[key] !== null && params[key] !== undefined) {
//           searchParams.append(key, params[key]);
//         }
//       });
//       url = `${endpoint}?${searchParams.toString()}`;
//     }
//     return this.request(url, { method: 'GET' });
//   }

//   async post(endpoint, data = {}) {
//     return this.request(endpoint, {
//       method: 'POST',
//       body: JSON.stringify(data),
//     });
//   }

//   async testConnection() {
//     return this.request('/');
//   }

//   async getSalesData() {
//     return this.get('/api/v1/sales');
//   }

//   async login(credentials) {
//     return this.post('/api/v1/auth/login', credentials);
//   }

//   async exportSalesData() {
//     return this.get('/api/v1/export/sales');
//   }
// }

// const apiService = new ApiService();

// // Connection Status Component
// const ConnectionStatus = ({ connectionStatus, onRefresh, loading }) => {
//   const [showAlert, setShowAlert] = useState(true);

//   if (!config.debugMode || !connectionStatus) {
//     return null;
//   }

//   return (
//     <Collapse in={showAlert}>
//       <Alert
//         severity={connectionStatus.success ? 'success' : 'error'}
//         sx={{ m: 2 }}
//         action={
//           <Box sx={{ display: 'flex', alignItems: 'center' }}>
//             <IconButton
//               color="inherit"
//               size="small"
//               onClick={onRefresh}
//               disabled={loading}
//               sx={{ mr: 1 }}
//             >
//               <RefreshIcon />
//             </IconButton>
//             <IconButton
//               color="inherit"
//               size="small"
//               onClick={() => setShowAlert(false)}
//             >
//               <CloseIcon />
//             </IconButton>
//           </Box>
//         }
//       >
//         <Typography variant="body2">
//           <strong>API Connection:</strong>{' '}
//           {connectionStatus.success ? (
//             <>
//               เชื่อมต่อสำเร็จ - {config.apiBaseUrl}
//               {connectionStatus.data?.message && (
//                 <><br />📡 {connectionStatus.data.message}</>
//               )}
//             </>
//           ) : (
//             <>
//               เชื่อมต่อไม่สำเร็จ - {connectionStatus.error}
//               <br />🔗 ตรวจสอบ: {config.apiBaseUrl}
//             </>
//           )}
//         </Typography>
//       </Alert>
//     </Collapse>
//   );
// };

// // Environment Badge Component
// const EnvironmentBadge = () => {
//   if (!config.debugMode) return null;

//   const getColor = () => {
//     switch (config.environment) {
//       case 'development': return 'primary';
//       case 'staging': return 'warning';
//       case 'production': return 'error';
//       default: return 'default';
//     }
//   };

//   return (
//     <Chip
//       label={`ENV: ${config.environment.toUpperCase()}`}
//       color={getColor()}
//       size="small"
//       sx={{
//         position: 'fixed',
//         bottom: 16,
//         right: 16,
//         zIndex: 9999,
//         fontSize: '0.7rem',
//       }}
//     />
//   );
// };

// // Navbar Component
// const Navbar = ({ onMenuClick, user, onProfileClick, onLogout }) => {
//   const [anchorEl, setAnchorEl] = useState(null);

//   const handleProfileMenuOpen = (event) => {
//     if (user) {
//       setAnchorEl(event.currentTarget);
//     } else {
//       onProfileClick();
//     }
//   };

//   const handleProfileMenuClose = () => {
//     setAnchorEl(null);
//   };

//   return (
//     <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
//       <Toolbar>
//         <IconButton
//           color="inherit"
//           aria-label="open drawer"
//           onClick={onMenuClick}
//           edge="start"
//           sx={{ mr: 2 }}
//         >
//           <MenuIcon />
//         </IconButton>
        
//         <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
//           {config.appName} - ระบบติดตามยอดขาย
//         </Typography>

//         <IconButton
//           size="large"
//           edge="end"
//           aria-label="account of current user"
//           onClick={handleProfileMenuOpen}
//           color="inherit"
//         >
//           <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
//             {user ? user.name.charAt(0).toUpperCase() : <PersonIcon />}
//           </Avatar>
//         </IconButton>

//         <Menu
//           anchorEl={anchorEl}
//           open={Boolean(anchorEl)}
//           onClose={handleProfileMenuClose}
//         >
//           <MenuItem onClick={() => { handleProfileMenuClose(); onProfileClick(); }}>
//             <PersonIcon sx={{ mr: 1 }} /> โปรไฟล์
//           </MenuItem>
//           <Divider />
//           <MenuItem onClick={() => { handleProfileMenuClose(); onLogout(); }}>
//             <LogoutIcon sx={{ mr: 1 }} /> ออกจากระบบ
//           </MenuItem>
//         </Menu>
//       </Toolbar>
//     </AppBar>
//   );
// };

// // Side Drawer Component
// const SideDrawer = ({ open, onClose, currentPage, onPageChange }) => {
//   const menuItems = [
//     { text: 'แดชบอร์ด', icon: <DashboardIcon />, page: 'dashboard' },
//     { text: 'ข้อมูลสาขา', icon: <StoreIcon />, page: 'branches' },
//     { text: 'ยอดขาย', icon: <TrendingUpIcon />, page: 'sales' },
//     { text: 'รายงาน', icon: <AssessmentIcon />, page: 'reports' },
//   ];

//   return (
//     <Drawer
//       variant="temporary"
//       open={open}
//       onClose={onClose}
//       ModalProps={{ keepMounted: true }}
//       sx={{
//         '& .MuiDrawer-paper': {
//           boxSizing: 'border-box',
//           width: 280,
//           backgroundColor: 'background.paper',
//         },
//       }}
//     >
//       <Toolbar />
//       <Box sx={{ overflow: 'auto' }}>
//         <List>
//           {menuItems.map((item) => (
//             <ListItem key={item.text} disablePadding>
//               <ListItemButton
//                 selected={currentPage === item.page}
//                 onClick={() => {
//                   onPageChange(item.page);
//                   onClose();
//                 }}
//                 sx={{
//                   '&.Mui-selected': {
//                     backgroundColor: 'primary.light',
//                     '&:hover': {
//                       backgroundColor: 'primary.light',
//                     },
//                   },
//                 }}
//               >
//                 <ListItemIcon sx={{ color: currentPage === item.page ? 'primary.main' : 'inherit' }}>
//                   {item.icon}
//                 </ListItemIcon>
//                 <ListItemText primary={item.text} />
//               </ListItemButton>
//             </ListItem>
//           ))}
//         </List>
//       </Box>
//     </Drawer>
//   );
// };

// // Login Dialog Component
// const LoginDialog = ({ open, onClose, onLogin }) => {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
    
//     try {
//       if (config.isDevelopment) {
//         // Mock login for development
//         await new Promise(resolve => setTimeout(resolve, 1000));
        
//         const userData = {
//           name: username,
//           email: `${username}@company.com`,
//           role: 'Manager',
//         };
        
//         localStorage.setItem(config.tokenKey, 'mock-jwt-token');
//         onLogin(userData);
//         onClose();
//         setUsername('');
//         setPassword('');
//       } else {
//         // Real API call for production
//         const result = await apiService.login({ username, password });
        
//         if (result.success) {
//           const { user, token } = result.data;
//           localStorage.setItem(config.tokenKey, token);
//           onLogin(user);
//           onClose();
//           setUsername('');
//           setPassword('');
//         } else {
//           alert('เข้าสู่ระบบไม่สำเร็จ: ' + result.error);
//         }
//       }
//     } catch (error) {
//       alert('เกิดข้อผิดพลาด: ' + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
//       <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
//         <Typography variant="h5" component="div" gutterBottom>
//           เข้าสู่ระบบ
//         </Typography>
//         <Typography variant="body2" color="text.secondary">
//           กรุณาเข้าสู่ระบบเพื่อใช้งานฟีเจอร์ Export
//         </Typography>
//       </DialogTitle>
      
//       <Box component="form" onSubmit={handleSubmit}>
//         <DialogContent>
//           <TextField
//             autoFocus
//             margin="dense"
//             label="ชื่อผู้ใช้"
//             fullWidth
//             variant="outlined"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             sx={{ mb: 2 }}
//           />
//           <TextField
//             margin="dense"
//             label="รหัสผ่าน"
//             type={showPassword ? 'text' : 'password'}
//             fullWidth
//             variant="outlined"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             InputProps={{
//               endAdornment: (
//                 <IconButton
//                   aria-label="toggle password visibility"
//                   onClick={() => setShowPassword(!showPassword)}
//                   edge="end"
//                 >
//                   {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
//                 </IconButton>
//               ),
//             }}
//           />
//           {loading && <LinearProgress sx={{ mt: 2 }} />}
//         </DialogContent>
        
//         <DialogActions sx={{ p: 3 }}>
//           <Button onClick={onClose} disabled={loading}>
//             ยกเลิก
//           </Button>
//           <Button 
//             type="submit" 
//             variant="contained" 
//             disabled={loading || !username || !password}
//             sx={{ minWidth: 100 }}
//           >
//             {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
//           </Button>
//         </DialogActions>
//       </Box>
//     </Dialog>
//   );
// };

// // Profile Dialog Component
// const ProfileDialog = ({ open, onClose, user }) => {
//   return (
//     <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
//       <DialogTitle>
//         ข้อมูลโปรไฟล์
//         <IconButton
//           aria-label="close"
//           onClick={onClose}
//           sx={{ position: 'absolute', right: 8, top: 8 }}
//         >
//           <CloseIcon />
//         </IconButton>
//       </DialogTitle>
      
//       <DialogContent>
//         {user ? (
//           <Box sx={{ textAlign: 'center', pt: 2 }}>
//             <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}>
//               {user.name.charAt(0).toUpperCase()}
//             </Avatar>
//             <Typography variant="h6" gutterBottom>
//               {user.name}
//             </Typography>
//             <Typography variant="body2" color="text.secondary" gutterBottom>
//               {user.email}
//             </Typography>
//             <Chip label={user.role} color="primary" variant="outlined" />
//           </Box>
//         ) : (
//           <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
//             กรุณาเข้าสู่ระบบเพื่อดูข้อมูลโปรไฟล์
//           </Typography>
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// };

// // Dashboard Component
// const Dashboard = ({ onExportRequest, user }) => {
//   const [salesData, setSalesData] = useState(mockSalesData);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [exportLoading, setExportLoading] = useState(false);
//   const [exportSuccess, setExportSuccess] = useState(false);

//   const fetchSalesData = async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       const result = await apiService.getSalesData();
      
//       if (result.success) {
//         setSalesData(result.data);
//       } else {
//         if (config.isDevelopment) {
//           console.warn('API ไม่พร้อมใช้งาน, ใช้ mock data แทน');
//           setSalesData(mockSalesData);
//           setError('ไม่สามารถเชื่อมต่อ API ได้ (ใช้ข้อมูลตัวอย่าง)');
//         } else {
//           throw new Error(result.error);
//         }
//       }
//     } catch (err) {
//       setError(err.message);
//       if (config.isDevelopment) {
//         setSalesData(mockSalesData);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   React.useEffect(() => {
//     fetchSalesData();
//   }, []);

//   const handleExportRequest = async () => {
//     if (!user) {
//       onExportRequest();
//       return;
//     }

//     setExportLoading(true);
//     try {
//       const result = await apiService.exportSalesData();
      
//       if (result.success || config.isDevelopment) {
//         setExportSuccess(true);
//         setTimeout(() => setExportSuccess(false), 3000);
//       } else {
//         alert('Export ไม่สำเร็จ: ' + result.error);
//       }
//     } catch (error) {
//       console.error('Export error:', error);
//       if (config.isDevelopment) {
//         setExportSuccess(true);
//         setTimeout(() => setExportSuccess(false), 3000);
//       }
//     } finally {
//       setExportLoading(false);
//     }
//   };

//   const totalSales = salesData.reduce((sum, item) => sum + (item.sales || 0), 0);
//   const avgGrowth = salesData.length > 0 
//     ? salesData.reduce((sum, item) => sum + (item.growth || 0), 0) / salesData.length 
//     : 0;

//   if (loading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
//         <CircularProgress />
//         <Typography variant="h6" sx={{ ml: 2 }}>
//           กำลังโหลดข้อมูล...
//         </Typography>
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ p: 3 }}>
//       {exportSuccess && (
//         <Alert severity="success" sx={{ mb: 3 }}>
//           Export ข้อมูลเรียบร้อยแล้ว!
//         </Alert>
//       )}

//       {error && (
//         <Alert 
//           severity="warning" 
//           sx={{ mb: 3 }}
//           action={
//             <Button color="inherit" size="small" onClick={fetchSalesData}>
//               ลองใหม่
//             </Button>
//           }
//         >
//           {error}
//         </Alert>
//       )}

//       <Typography variant="h4" gutterBottom>
//         แดชบอร์ดภาพรวม
//       </Typography>
      
//       {/* Cards สรุปยอดขาย */}
//       <Grid container spacing={3} sx={{ mb: 4 }}>
//         <Grid item xs={12} md={6}>
//           <Card sx={{ height: '100%' }}>
//             <CardContent>
//               <Typography variant="h6" color="primary" gutterBottom>
//                 ยอดขายรวม
//               </Typography>
//               <Typography variant="h4" color="text.primary">
//                 ฿{totalSales.toLocaleString()}
//               </Typography>
//               <Typography variant="body2" color="text.secondary">
//                 เดือนนี้ • {salesData.length} สาขา
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>
        
//         <Grid item xs={12} md={6}>
//           <Card sx={{ height: '100%' }}>
//             <CardContent>
//               <Typography variant="h6" color="secondary" gutterBottom>
//                 อัตราการเติบโต
//               </Typography>
//               <Typography variant="h4" color={avgGrowth > 0 ? 'success.main' : 'error.main'}>
//                 {avgGrowth > 0 ? '+' : ''}{avgGrowth.toFixed(1)}%
//               </Typography>
//               <Typography variant="body2" color="text.secondary">
//                 เฉลี่ยทุกสาขา
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>

//       {/* ตารางข้อมูลสาขา */}
//       <Card>
//         <CardContent>
//           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
//             <Typography variant="h6">
//               ข้อมูลยอดขายตามสาขา
//             </Typography>
//             <Button
//               variant="contained"
//               startIcon={<ExportIcon />}
//               onClick={handleExportRequest}
//               disabled={exportLoading}
//               sx={{ borderRadius: 2 }}
//             >
//               {exportLoading ? 'กำลัง Export...' : 'Export ข้อมูล'}
//             </Button>
//           </Box>
          
//           <Grid container spacing={2}>
//             {salesData.map((branch, index) => (
//               <Grid item xs={12} md={6} key={branch.id || index}>
//                 <Paper sx={{ p: 3, borderRadius: 2 }}>
//                   <Typography variant="h6" gutterBottom>
//                     {branch.branch || `สาขา ${index + 1}`}
//                   </Typography>
//                   <Typography variant="h5" color="primary" gutterBottom>
//                     ฿{(branch.sales || 0).toLocaleString()}
//                   </Typography>
//                   <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//                     <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                       <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
//                         การเติบโต:
//                       </Typography>
//                       <Chip
//                         label={`${(branch.growth || 0) > 0 ? '+' : ''}${(branch.growth || 0)}%`}
//                         color={(branch.growth || 0) > 0 ? 'success' : 'error'}
//                         size="small"
//                       />
//                     </Box>
//                     {branch.location && (
//                       <Typography variant="caption" color="text.secondary">
//                         📍 {branch.location}
//                       </Typography>
//                     )}
//                   </Box>
//                   {branch.manager && (
//                     <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
//                       👤 ผจก. {branch.manager}
//                     </Typography>
//                   )}
//                 </Paper>
//               </Grid>
//             ))}
//           </Grid>
//         </CardContent>
//       </Card>
//     </Box>
//   );
// };

// // Main App Component
// function App() {
//   const [drawerOpen, setDrawerOpen] = useState(false);
//   const [currentPage, setCurrentPage] = useState('dashboard');
//   const [loginDialogOpen, setLoginDialogOpen] = useState(false);
//   const [profileDialogOpen, setProfileDialogOpen] = useState(false);
//   const [user, setUser] = useState(null);
//   const [connectionStatus, setConnectionStatus] = useState(null);
//   const [connectionLoading, setConnectionLoading] = useState(false);

//   // Test API connection on app start
//   React.useEffect(() => {
//     if (config.debugMode) {
//       testConnection();
//     }
    
//     // Check for existing token
//     const token = localStorage.getItem(config.tokenKey);
//     if (token) {
//       setUser({
//         name: 'User',
//         email: 'user@company.com',
//         role: 'Manager',
//       });
//     }
//   }, []);

//   const testConnection = async () => {
//     setConnectionLoading(true);
//     try {
//       const result = await apiService.testConnection();
//       setConnectionStatus(result);
//     } catch (error) {
//       setConnectionStatus({
//         success: false,
//         error: 'ไม่สามารถทดสอบการเชื่อมต่อได้',
//       });
//     } finally {
//       setConnectionLoading(false);
//     }
//   };

//   const handleLogin = (userData) => {
//     setUser(userData);
//   };

//   const handleLogout = () => {
//     localStorage.removeItem(config.tokenKey);
//     setUser(null);
//   };

//   const renderCurrentPage = () => {
//     switch (currentPage) {
//       case 'dashboard':
//         return (
//           <Dashboard 
//             onExportRequest={() => setLoginDialogOpen(true)} 
//             user={user}
//           />
//         );
//       case 'branches':
//         return (
//           <Box sx={{ p: 3 }}>
//             <Typography variant="h4" gutterBottom>ข้อมูลสาขา</Typography>
//             <Alert severity="info">หน้านี้กำลังพัฒนา</Alert>
//           </Box>
//         );
//       case 'sales':
//         return (
//           <Box sx={{ p: 3 }}>
//             <Typography variant="h4" gutterBottom>ยอดขาย</Typography>
//             <Alert severity="info">หน้านี้กำลังพัฒนา</Alert>
//           </Box>
//         );
//       case 'reports':
//         return (
//           <Box sx={{ p: 3 }}>
//             <Typography variant="h4" gutterBottom>รายงาน</Typography>
//             <Alert severity="info">หน้านี้กำลังพัฒนา</Alert>
//           </Box>
//         );
//       default:
//         return (
//           <Dashboard 
//             onExportRequest={() => setLoginDialogOpen(true)} 
//             user={user}
//           />
//         );
//     }
//   };

//   return (
//     <ThemeProvider theme={theme}>
//       <CssBaseline />
//       <Box sx={{ display: 'flex' }}>
//         <Navbar
//           onMenuClick={() => setDrawerOpen(true)}
//           user={user}
//           onProfileClick={() => setProfileDialogOpen(true)}
//           onLogout={handleLogout}
//         />
        
//         <SideDrawer
//           open={drawerOpen}
//           onClose={() => setDrawerOpen(false)}
//           currentPage={currentPage}
//           onPageChange={setCurrentPage}
//         />

//         <Box
//           component="main"
//           sx={{
//             flexGrow: 1,
//             bgcolor: 'background.default',
//             minHeight: '100vh',
//             mt: '64px',
//           }}
//         >
//           <ConnectionStatus
//             connectionStatus={connectionStatus}
//             onRefresh={testConnection}
//             loading={connectionLoading}
//           />
          
//           {renderCurrentPage()}
//         </Box>

//         <LoginDialog
//           open={loginDialogOpen}
//           onClose={() => setLoginDialogOpen(false)}
//           onLogin={handleLogin}
//         />

//         <ProfileDialog
//           open={profileDialogOpen}
//           onClose={() => setProfileDialogOpen(false)}
//           user={user}
//         />
//       </Box>
      
//       <EnvironmentBadge />
//     </ThemeProvider>
//   );
// }

// export default App;


////////////////////////////////////////////////////////////////
// import React, { useState } from 'react';
// import {
//   ThemeProvider,
//   createTheme,
//   CssBaseline,
//   Box,
//   AppBar,
//   Toolbar,
//   Typography,
//   IconButton,
//   Drawer,
//   List,
//   ListItem,
//   ListItemIcon,
//   ListItemText,
//   ListItemButton,
//   Card,
//   CardContent,
//   Grid,
//   Button,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   TextField,
//   DialogActions,
//   Avatar,
//   Menu,
//   MenuItem,
//   Divider,
//   Paper,
//   LinearProgress,
//   Chip,
//   Alert
// } from '@mui/material';
// import {
//   Menu as MenuIcon,
//   Dashboard as DashboardIcon,
//   Store as StoreIcon,
//   TrendingUp as TrendingUpIcon,
//   Assessment as AssessmentIcon,
//   FileDownload as ExportIcon,
//   Person as PersonIcon,
//   Logout as LogoutIcon,
//   Close as CloseIcon,
//   Visibility as VisibilityIcon,
//   VisibilityOff as VisibilityOffIcon
// } from '@mui/icons-material';

// // สร้าง Theme สวยงาม
// const theme = createTheme({
//   palette: {
//     primary: {
//       main: '#1976d2',
//       light: '#42a5f5',
//       dark: '#1565c0',
//     },
//     secondary: {
//       main: '#ff9800',
//       light: '#ffb74d',
//       dark: '#f57c00',
//     },
//     background: {
//       default: '#f5f5f5',
//       paper: '#ffffff',
//     },
//   },
//   typography: {
//     fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
//     h4: {
//       fontWeight: 600,
//     },
//     h6: {
//       fontWeight: 500,
//     },
//   },
//   shape: {
//     borderRadius: 12,
//   },
// });

// // Component สำหรับ Navbar
// const Navbar = ({ onMenuClick, user, onProfileClick, onLogout }) => {
//   const [anchorEl, setAnchorEl] = useState(null);

//   const handleProfileMenuOpen = (event) => {
//     if (user) {
//       setAnchorEl(event.currentTarget);
//     } else {
//       onProfileClick();
//     }
//   };

//   const handleProfileMenuClose = () => {
//     setAnchorEl(null);
//   };

//   return (
//     <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
//       <Toolbar>
//         <IconButton
//           color="inherit"
//           aria-label="open drawer"
//           onClick={onMenuClick}
//           edge="start"
//           sx={{ mr: 2 }}
//         >
//           <MenuIcon />
//         </IconButton>
        
//         <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
//           CN Dashboard - ระบบติดตามยอดขาย
//         </Typography>

//         <IconButton
//           size="large"
//           edge="end"
//           aria-label="account of current user"
//           onClick={handleProfileMenuOpen}
//           color="inherit"
//         >
//           <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
//             {user ? user.name.charAt(0).toUpperCase() : <PersonIcon />}
//           </Avatar>
//         </IconButton>

//         <Menu
//           anchorEl={anchorEl}
//           open={Boolean(anchorEl)}
//           onClose={handleProfileMenuClose}
//         >
//           <MenuItem onClick={() => { handleProfileMenuClose(); onProfileClick(); }}>
//             <PersonIcon sx={{ mr: 1 }} /> โปรไฟล์
//           </MenuItem>
//           <Divider />
//           <MenuItem onClick={() => { handleProfileMenuClose(); onLogout(); }}>
//             <LogoutIcon sx={{ mr: 1 }} /> ออกจากระบบ
//           </MenuItem>
//         </Menu>
//       </Toolbar>
//     </AppBar>
//   );
// };

// // Component สำหรับ Drawer
// const SideDrawer = ({ open, onClose, currentPage, onPageChange }) => {
//   const menuItems = [
//     { text: 'แดชบอร์ด', icon: <DashboardIcon />, page: 'dashboard' },
//     { text: 'ข้อมูลสาขา', icon: <StoreIcon />, page: 'branches' },
//     { text: 'ยอดขาย', icon: <TrendingUpIcon />, page: 'sales' },
//     { text: 'รายงาน', icon: <AssessmentIcon />, page: 'reports' },
//   ];

//   return (
//     <Drawer
//       variant="temporary"
//       open={open}
//       onClose={onClose}
//       ModalProps={{
//         keepMounted: true,
//       }}
//       sx={{
//         '& .MuiDrawer-paper': {
//           boxSizing: 'border-box',
//           width: 280,
//           backgroundColor: 'background.paper',
//         },
//       }}
//     >
//       <Toolbar />
//       <Box sx={{ overflow: 'auto' }}>
//         <List>
//           {menuItems.map((item) => (
//             <ListItem key={item.text} disablePadding>
//               <ListItemButton
//                 selected={currentPage === item.page}
//                 onClick={() => {
//                   onPageChange(item.page);
//                   onClose();
//                 }}
//                 sx={{
//                   '&.Mui-selected': {
//                     backgroundColor: 'primary.light',
//                     '&:hover': {
//                       backgroundColor: 'primary.light',
//                     },
//                   },
//                 }}
//               >
//                 <ListItemIcon sx={{ color: currentPage === item.page ? 'primary.main' : 'inherit' }}>
//                   {item.icon}
//                 </ListItemIcon>
//                 <ListItemText primary={item.text} />
//               </ListItemButton>
//             </ListItem>
//           ))}
//         </List>
//       </Box>
//     </Drawer>
//   );
// };

// // Component สำหรับ Login Dialog
// const LoginDialog = ({ open, onClose, onLogin }) => {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
    
//     // จำลองการ Login
//     setTimeout(() => {
//       if (username && password) {
//         onLogin({
//           name: username,
//           email: `${username}@company.com`,
//           role: 'Manager'
//         });
//         onClose();
//         setUsername('');
//         setPassword('');
//       }
//       setLoading(false);
//     }, 1000);
//   };

//   return (
//     <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
//       <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
//         <Typography variant="h5" component="div" gutterBottom>
//           เข้าสู่ระบบ
//         </Typography>
//         <Typography variant="body2" color="text.secondary">
//           กรุณาเข้าสู่ระบบเพื่อใช้งานฟีเจอร์ Export
//         </Typography>
//       </DialogTitle>
      
//       <Box component="form" onSubmit={handleSubmit}>
//         <DialogContent>
//           <TextField
//             autoFocus
//             margin="dense"
//             label="ชื่อผู้ใช้"
//             fullWidth
//             variant="outlined"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             sx={{ mb: 2 }}
//           />
//           <TextField
//             margin="dense"
//             label="รหัสผ่าน"
//             type={showPassword ? 'text' : 'password'}
//             fullWidth
//             variant="outlined"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             InputProps={{
//               endAdornment: (
//                 <IconButton
//                   aria-label="toggle password visibility"
//                   onClick={() => setShowPassword(!showPassword)}
//                   edge="end"
//                 >
//                   {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
//                 </IconButton>
//               ),
//             }}
//           />
//           {loading && <LinearProgress sx={{ mt: 2 }} />}
//         </DialogContent>
        
//         <DialogActions sx={{ p: 3 }}>
//           <Button onClick={onClose} disabled={loading}>
//             ยกเลิก
//           </Button>
//           <Button 
//             type="submit" 
//             variant="contained" 
//             disabled={loading || !username || !password}
//             sx={{ minWidth: 100 }}
//           >
//             {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
//           </Button>
//         </DialogActions>
//       </Box>
//     </Dialog>
//   );
// };

// // Component สำหรับ Profile Dialog
// const ProfileDialog = ({ open, onClose, user }) => {
//   return (
//     <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
//       <DialogTitle>
//         ข้อมูลโปรไฟล์
//         <IconButton
//           aria-label="close"
//           onClick={onClose}
//           sx={{ position: 'absolute', right: 8, top: 8 }}
//         >
//           <CloseIcon />
//         </IconButton>
//       </DialogTitle>
      
//       <DialogContent>
//         {user ? (
//           <Box sx={{ textAlign: 'center', pt: 2 }}>
//             <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}>
//               {user.name.charAt(0).toUpperCase()}
//             </Avatar>
//             <Typography variant="h6" gutterBottom>
//               {user.name}
//             </Typography>
//             <Typography variant="body2" color="text.secondary" gutterBottom>
//               {user.email}
//             </Typography>
//             <Chip label={user.role} color="primary" variant="outlined" />
//           </Box>
//         ) : (
//           <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
//             กรุณาเข้าสู่ระบบเพื่อดูข้อมูลโปรไฟล์
//           </Typography>
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// };

// // Component สำหรับ Dashboard
// const Dashboard = ({ onExportRequest }) => {
//   // ข้อมูลจำลองสำหรับ Dashboard
//   const salesData = [
//     { branch: 'สาขาเซ็นทรัล', sales: 1250000, growth: 12.5 },
//     { branch: 'สาขาสยาม', sales: 980000, growth: 8.3 },
//     { branch: 'สาขาอโศก', sales: 1100000, growth: 15.2 },
//     { branch: 'สาขาสีลม', sales: 850000, growth: -2.1 },
//   ];

//   const totalSales = salesData.reduce((sum, item) => sum + item.sales, 0);
//   const avgGrowth = salesData.reduce((sum, item) => sum + item.growth, 0) / salesData.length;

//   return (
//     <Box sx={{ p: 3 }}>
//       <Typography variant="h4" gutterBottom>
//         แดชบอร์ดภาพรวม
//       </Typography>
      
//       {/* Cards สรุปยอดขาย */}
//       <Grid container spacing={3} sx={{ mb: 4 }}>
//         <Grid item xs={12} md={6}>
//           <Card sx={{ height: '100%' }}>
//             <CardContent>
//               <Typography variant="h6" color="primary" gutterBottom>
//                 ยอดขายรวม
//               </Typography>
//               <Typography variant="h4" color="text.primary">
//                 ฿{totalSales.toLocaleString()}
//               </Typography>
//               <Typography variant="body2" color="text.secondary">
//                 เดือนนี้
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>
        
//         <Grid item xs={12} md={6}>
//           <Card sx={{ height: '100%' }}>
//             <CardContent>
//               <Typography variant="h6" color="secondary" gutterBottom>
//                 อัตราการเติบโต
//               </Typography>
//               <Typography variant="h4" color={avgGrowth > 0 ? 'success.main' : 'error.main'}>
//                 {avgGrowth > 0 ? '+' : ''}{avgGrowth.toFixed(1)}%
//               </Typography>
//               <Typography variant="body2" color="text.secondary">
//                 เฉลี่ยทุกสาขา
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>

//       {/* ตารางข้อมูลสาขา */}
//       <Card>
//         <CardContent>
//           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
//             <Typography variant="h6">
//               ข้อมูลยอดขายตามสาขา
//             </Typography>
//             <Button
//               variant="contained"
//               startIcon={<ExportIcon />}
//               onClick={onExportRequest}
//               sx={{ borderRadius: 2 }}
//             >
//               Export ข้อมูล
//             </Button>
//           </Box>
          
//           <Grid container spacing={2}>
//             {salesData.map((branch, index) => (
//               <Grid item xs={12} md={6} key={index}>
//                 <Paper sx={{ p: 3, borderRadius: 2 }}>
//                   <Typography variant="h6" gutterBottom>
//                     {branch.branch}
//                   </Typography>
//                   <Typography variant="h5" color="primary" gutterBottom>
//                     ฿{branch.sales.toLocaleString()}
//                   </Typography>
//                   <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                     <Typography variant="body2" color="text.secondary">
//                       การเติบโต: 
//                     </Typography>
//                     <Chip
//                       label={`${branch.growth > 0 ? '+' : ''}${branch.growth}%`}
//                       color={branch.growth > 0 ? 'success' : 'error'}
//                       size="small"
//                       sx={{ ml: 1 }}
//                     />
//                   </Box>
//                 </Paper>
//               </Grid>
//             ))}
//           </Grid>
//         </CardContent>
//       </Card>
//     </Box>
//   );
// };

// // Component หลัก App
// function App() {
//   const [drawerOpen, setDrawerOpen] = useState(false);
//   const [currentPage, setCurrentPage] = useState('dashboard');
//   const [loginDialogOpen, setLoginDialogOpen] = useState(false);
//   const [profileDialogOpen, setProfileDialogOpen] = useState(false);
//   const [user, setUser] = useState(null);
//   const [exportSuccess, setExportSuccess] = useState(false);

//   const handleExportRequest = () => {
//     if (user) {
//       // จำลองการ Export
//       setExportSuccess(true);
//       setTimeout(() => setExportSuccess(false), 3000);
//     } else {
//       setLoginDialogOpen(true);
//     }
//   };

//   const handleLogin = (userData) => {
//     setUser(userData);
//   };

//   const handleLogout = () => {
//     setUser(null);
//   };

//   return (
//     <ThemeProvider theme={theme}>
//       <CssBaseline />
//       <Box sx={{ display: 'flex' }}>
//         <Navbar
//           onMenuClick={() => setDrawerOpen(true)}
//           user={user}
//           onProfileClick={() => setProfileDialogOpen(true)}
//           onLogout={handleLogout}
//         />
        
//         <SideDrawer
//           open={drawerOpen}
//           onClose={() => setDrawerOpen(false)}
//           currentPage={currentPage}
//           onPageChange={setCurrentPage}
//         />

//         <Box
//           component="main"
//           sx={{
//             flexGrow: 1,
//             bgcolor: 'background.default',
//             minHeight: '100vh',
//             mt: '64px',
//           }}
//         >
//           {exportSuccess && (
//             <Alert severity="success" sx={{ m: 2 }}>
//               Export ข้อมูลเรียบร้อยแล้ว!
//             </Alert>
//           )}
          
//           <Dashboard onExportRequest={handleExportRequest} />
//         </Box>

//         <LoginDialog
//           open={loginDialogOpen}
//           onClose={() => setLoginDialogOpen(false)}
//           onLogin={handleLogin}
//         />

//         <ProfileDialog
//           open={profileDialogOpen}
//           onClose={() => setProfileDialogOpen(false)}
//           user={user}
//         />
//       </Box>
//     </ThemeProvider>
//   );
// }

// export default App;

//////////////////////////////////////////////
// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;
