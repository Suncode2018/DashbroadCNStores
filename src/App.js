
import React, { useState } from 'react';
import Swal from 'sweetalert2';
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
  Collapse,
  FormControl,
  InputLabel,
  Select,
  Tab,
  Tabs,
  ButtonGroup
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
  Refresh as RefreshIcon,
  Search as SearchIcon,
  ShowChart as LineChartIcon,
  AreaChart as AreaChartIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon
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

// SweetAlert2 Helper Functions
const showSuccessAlert = (title, text) => {
  return Swal.fire({
    icon: 'success',
    title: title,
    text: text,
    confirmButtonText: 'ตกลง',
    confirmButtonColor: '#4caf50',
    timer: 3000,
    timerProgressBar: true,
  });
};

const showErrorAlert = (title, text) => {
  return Swal.fire({
    icon: 'error',
    title: title,
    text: text,
    confirmButtonText: 'ตกลง',
    confirmButtonColor: '#f44336',
  });
};

const showWarningAlert = (title, text, showRetryButton = false) => {
  const config = {
    icon: 'warning',
    title: title,
    text: text,
    confirmButtonText: 'ตกลง',
    confirmButtonColor: '#ff9800',
  };

  if (showRetryButton) {
    config.showCancelButton = true;
    config.cancelButtonText = 'ลองใหม่';
    config.cancelButtonColor = '#1976d2';
  }

  return Swal.fire(config);
};

const showInfoAlert = (title, text) => {
  return Swal.fire({
    icon: 'info',
    title: title,
    text: text,
    confirmButtonText: 'ตกลง',
    confirmButtonColor: '#1976d2',
  });
};

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

  async getAvailableDates() {
    return this.get('/reports/cn-date');
  }

  async getCnReportByDate(startDate, endDate) {
    return this.get(`/reports/cn-by-date?start_date=${startDate}&end_date=${endDate}`);
  }

  async exportSalesData() {
    return this.get('/api/v1/export/sales');
  }
}

const apiService = new ApiService();

// Connection Status Component (Simplified - no more alert banner)
const ConnectionStatus = ({ connectionStatus, onRefresh, loading }) => {
  // Only show in debug mode and only log to console
  React.useEffect(() => {
    if (config.debugMode && connectionStatus) {
      if (connectionStatus.success) {
        console.log('✅ API Connection: OK', connectionStatus.data?.message);
      } else {
        console.log('❌ API Connection: Failed', connectionStatus.error);
      }
    }
  }, [connectionStatus]);

  // Don't render any UI - all notifications handled by SweetAlert2
  return null;
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
        
        showSuccessAlert('เข้าสู่ระบบสำเร็จ', 'ยินดีต้อนรับเข้าสู่ระบบ CN Dashboard');
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
          
          showSuccessAlert('เข้าสู่ระบบสำเร็จ', 'ยินดีต้อนรับเข้าสู่ระบบ (โหมดทดสอบ)');
        } else {
          showErrorAlert(
            'เข้าสู่ระบบไม่สำเร็จ',
            `${result.error}\n\nกรุณาตรวจสอบ:\n• ชื่อผู้ใช้และรหัสผ่าน\n• การเชื่อมต่ออินเทอร์เน็ต`
          );
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
        
        showSuccessAlert('เข้าสู่ระบบสำเร็จ', 'ยินดีต้อนรับเข้าสู่ระบบ (โหมดออฟไลน์)');
      } else {
        showErrorAlert(
          'เกิดข้อผิดพลาด',
          `${error.message}\n\nกรุณา:\n• ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต\n• ลองใหม่อีกครั้ง`
        );
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

// CN Charts Component
const CnChartsCard = ({ dateFilter }) => {
  const [cnData, setCnData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState('line');
  const [error, setError] = useState(null);

  // Mock data for fallback
  const mockCnData = [
    {
      DeliveryDate: "2025-09-01",
      countCnNoALL: 837,
      countCnNo43ALL: 486,
      countCnNo42ALL: 351,
    },
    {
      DeliveryDate: "2025-09-02",
      countCnNoALL: 918,
      countCnNo43ALL: 516,
      countCnNo42ALL: 402,
    },
    {
      DeliveryDate: "2025-09-03",
      countCnNoALL: 895,
      countCnNo43ALL: 539,
      countCnNo42ALL: 356,
    }
  ];

  const fetchCnData = async (startDate, endDate) => {
    if (!startDate || !endDate) {
      setCnData(mockCnData);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await apiService.getCnReportByDate(startDate, endDate);
      
      if (result.success && result.data?.data) {
        setCnData(result.data.data);
      } else {
        setCnData(mockCnData);
        if (config.isDevelopment) {
          showWarningAlert(
            'ข้อมูล CN ยังไม่พร้อม',
            'ระบบจะแสดงข้อมูลตัวอย่างในขณะนี้'
          );
        }
      }
    } catch (err) {
      console.error('Error fetching CN data:', err);
      setCnData(mockCnData);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when date filter changes
  React.useEffect(() => {
    if (dateFilter && dateFilter.startDate && dateFilter.endDate) {
      fetchCnData(dateFilter.startDate, dateFilter.endDate);
    } else {
      setCnData(mockCnData);
    }
  }, [dateFilter]);

  // Chart data preparation
  const chartData = cnData.map(item => ({
    date: new Date(item.DeliveryDate).toLocaleDateString('th-TH', { 
      day: 'numeric', 
      month: 'short' 
    }),
    total: item.countCnNoALL,
    cn43: item.countCnNo43ALL,
    cn42: item.countCnNo42ALL,
  }));

  // Calculate totals for pie chart
  const totalCn43 = cnData.reduce((sum, item) => sum + item.countCnNo43ALL, 0);
  const totalCn42 = cnData.reduce((sum, item) => sum + item.countCnNo42ALL, 0);
  const totalAll = totalCn43 + totalCn42;

  const renderLineChart = () => (
    <Box sx={{ width: '100%', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <Typography variant="h6" color="primary" gutterBottom>
        กราฟเส้นแสดงจำนวน CN
      </Typography>
      <Box sx={{ width: '100%', height: 250, border: '2px dashed #ccc', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <LineChartIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          กราฟเส้น CN ตามช่วงเวลา<br />
          Total: {chartData.reduce((sum, item) => sum + item.total, 0).toLocaleString()} CN<br />
          CN43: {chartData.reduce((sum, item) => sum + item.cn43, 0).toLocaleString()}<br />
          CN42: {chartData.reduce((sum, item) => sum + item.cn42, 0).toLocaleString()}
        </Typography>
      </Box>
    </Box>
  );

  const renderAreaChart = () => (
    <Box sx={{ width: '100%', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <Typography variant="h6" color="secondary" gutterBottom>
        กราฟพื้นที่แสดงสัดส่วน CN
      </Typography>
      <Box sx={{ width: '100%', height: 250, border: '2px dashed #ccc', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <AreaChartIcon sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          กราฟพื้นที่ CN ตามช่วงเวลา<br />
          แสดงการเปลี่ยนแปลงของ CN43 และ CN42<br />
          จำนวนวันที่มีข้อมูล: {chartData.length} วัน
        </Typography>
      </Box>
    </Box>
  );

  const renderBarChart = () => (
    <Box sx={{ width: '100%', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <Typography variant="h6" color="success.main" gutterBottom>
        กราฟแท่งเปรียบเทียบ CN
      </Typography>
      <Box sx={{ width: '100%', height: 250, border: '2px dashed #ccc', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <BarChartIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          กราฟแท่งเปรียบเทียบ CN43 vs CN42<br />
          ค่าเฉลี่ยต่อวัน: {Math.round(totalAll / chartData.length || 0).toLocaleString()} CN<br />
          สูงสุด: {Math.max(...chartData.map(d => d.total)).toLocaleString()} CN
        </Typography>
      </Box>
    </Box>
  );

  const renderPieChart = () => (
    <Box sx={{ width: '100%', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <Typography variant="h6" color="error.main" gutterBottom>
        กราฟวงกลมสัดส่วน CN
      </Typography>
      <Box sx={{ width: '100%', height: 250, border: '2px dashed #ccc', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <PieChartIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          สัดส่วน CN43 vs CN42<br />
          CN43: {totalCn43.toLocaleString()} ({((totalCn43 / totalAll) * 100 || 0).toFixed(1)}%)<br />
          CN42: {totalCn42.toLocaleString()} ({((totalCn42 / totalAll) * 100 || 0).toFixed(1)}%)
        </Typography>
      </Box>
    </Box>
  );

  const renderChart = () => {
    switch (chartType) {
      case 'line': return renderLineChart();
      case 'area': return renderAreaChart();
      case 'bar': return renderBarChart();
      case 'pie': return renderPieChart();
      default: return renderLineChart();
    }
  };

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            CN ทั้งหมด
          </Typography>
          
          <ButtonGroup variant="outlined" size="small">
            <Button
              variant={chartType === 'line' ? 'contained' : 'outlined'}
              startIcon={<LineChartIcon />}
              onClick={() => setChartType('line')}
            >
              เส้น
            </Button>
            <Button
              variant={chartType === 'area' ? 'contained' : 'outlined'}
              startIcon={<AreaChartIcon />}
              onClick={() => setChartType('area')}
            >
              พื้นที่
            </Button>
            <Button
              variant={chartType === 'bar' ? 'contained' : 'outlined'}
              startIcon={<BarChartIcon />}
              onClick={() => setChartType('bar')}
            >
              แท่ง
            </Button>
            <Button
              variant={chartType === 'pie' ? 'contained' : 'outlined'}
              startIcon={<PieChartIcon />}
              onClick={() => setChartType('pie')}
            >
              วงกลม
            </Button>
          </ButtonGroup>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
            <CircularProgress sx={{ mr: 2 }} />
            <Typography>กำลังโหลดข้อมูล CN...</Typography>
          </Box>
        ) : (
          <>
            {renderChart()}
            
            {/* Data Summary */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                สรุปข้อมูล CN (ช่วงเวลาที่เลือก)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">CN ทั้งหมด</Typography>
                  <Typography variant="h6" color="primary">{totalAll.toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">CN43</Typography>
                  <Typography variant="h6" color="secondary">{totalCn43.toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">CN42</Typography>
                  <Typography variant="h6" color="success.main">{totalCn42.toLocaleString()}</Typography>
                </Grid>
              </Grid>
            </Box>

            {dateFilter && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  ข้อมูล CN ตั้งแต่ {new Date(dateFilter.startDate).toLocaleDateString('th-TH')} 
                  ถึง {new Date(dateFilter.endDate).toLocaleDateString('th-TH')}
                  {config.isDevelopment && ' (ข้อมูลตัวอย่าง)'}
                </Typography>
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
const DateFilterCard = ({ onFilterChange }) => {
  const [availableDates, setAvailableDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startMonth, setStartMonth] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endMonth, setEndMonth] = useState('');
  const [endDate, setEndDate] = useState('');

  const getMonthsAndDates = () => {
    const months = new Set();
    const datesByMonth = {};

    availableDates.forEach(item => {
      const date = new Date(item.DeliveryDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long' });
      
      months.add(JSON.stringify({ key: monthKey, label: monthLabel }));
      
      if (!datesByMonth[monthKey]) {
        datesByMonth[monthKey] = [];
      }
      datesByMonth[monthKey].push({
        value: item.DeliveryDate,
        label: date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
      });
    });

    return {
      months: Array.from(months).map(m => JSON.parse(m)).sort((a, b) => a.key.localeCompare(b.key)),
      datesByMonth
    };
  };

  const { months, datesByMonth } = getMonthsAndDates();

  React.useEffect(() => {
    const fetchAvailableDates = async () => {
      setLoading(true);
      try {
        const result = await apiService.getAvailableDates();
        if (result.success && result.data?.data) {
          setAvailableDates(result.data.data);
        } else {
          const mockDates = [];
          for (let i = 1; i <= 30; i++) {
            const date = new Date(2025, 6, i); // July 2025
            mockDates.push({ DeliveryDate: date.toISOString().split('T')[0] });
          }
          setAvailableDates(mockDates);
          
          if (config.isDevelopment) {
            showWarningAlert(
              'ข้อมูลยังไม่พร้อม',
              'ระบบกำลังเตรียมข้อมูลให้คุณ กรุณารอสักครู่และลองใหม่\nระบบใช้ข้อมูลตัวอย่างในขณะนี้'
            );
          }
        }
      } catch (error) {
        console.error('Error fetching dates:', error);
        const mockDates = [];
        for (let i = 1; i <= 30; i++) {
          const date = new Date(2025, 6, i); // July 2025
          mockDates.push({ DeliveryDate: date.toISOString().split('T')[0] });
        }
        setAvailableDates(mockDates);
        
        showWarningAlert(
          'ไม่สามารถโหลดข้อมูลได้',
          'เกิดปัญหาในการเชื่อมต่อ ระบบจะใช้ข้อมูลตัวอย่างในขณะนี้'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableDates();
  }, []);

  const handleSearch = () => {
    if (startDate && endDate) {
      onFilterChange({
        startDate,
        endDate,
        startMonth,
        endMonth
      });
      
      showSuccessAlert(
        'กรองข้อมูลสำเร็จ',
        `ช่วงเวลา: ${new Date(startDate).toLocaleDateString('th-TH')} - ${new Date(endDate).toLocaleDateString('th-TH')}`
      );
    } else {
      showWarningAlert(
        'กรุณาเลือกข้อมูลให้ครบ',
        'โปรดเลือกเดือนและวันที่เริ่มต้นและสิ้นสุด'
      );
    }
  };

  const getStartDates = () => {
    return startMonth ? (datesByMonth[startMonth] || []) : [];
  };

  const getEndDates = () => {
    return endMonth ? (datesByMonth[endMonth] || []) : [];
  };

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          ตัวกรองข้อมูล
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
            <CircularProgress size={20} sx={{ mr: 2 }} />
            <Typography variant="body2" color="text.secondary">
              กำลังโหลดข้อมูลวันที่...
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>เดือนเริ่มต้น</InputLabel>
                <Select
                  value={startMonth}
                  label="เดือนเริ่มต้น"
                  onChange={(e) => {
                    setStartMonth(e.target.value);
                    setStartDate('');
                  }}
                >
                  {months.map((month) => (
                    <MenuItem key={month.key} value={month.key}>
                      {month.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>วันที่เริ่มต้น</InputLabel>
                <Select
                  value={startDate}
                  label="วันที่เริ่มต้น"
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={!startMonth}
                >
                  {getStartDates().map((date) => (
                    <MenuItem key={date.value} value={date.value}>
                      {date.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={12} md={1} sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                ถึง
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>เดือนสิ้นสุด</InputLabel>
                <Select
                  value={endMonth}
                  label="เดือนสิ้นสุด"
                  onChange={(e) => {
                    setEndMonth(e.target.value);
                    setEndDate('');
                  }}
                >
                  {months.map((month) => (
                    <MenuItem key={month.key} value={month.key}>
                      {month.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>วันที่สิ้นสุด</InputLabel>
                <Select
                  value={endDate}
                  label="วันที่สิ้นสุด"
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={!endMonth}
                >
                  {getEndDates().map((date) => (
                    <MenuItem key={date.value} value={date.value}>
                      {date.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={12} md={3}>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleSearch}
                disabled={!startDate || !endDate || loading}
                fullWidth
                sx={{ height: '40px' }}
              >
                ค้นหา
              </Button>
            </Grid>
          </Grid>
        )}

        {startDate && endDate && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
            <Typography variant="body2" color="primary.contrastText">
              ช่วงเวลาที่เลือก: {new Date(startDate).toLocaleDateString('th-TH')} - {new Date(endDate).toLocaleDateString('th-TH')}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
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
      const result = {
        success: response.ok,
        status: response.status,
        data: data,
        timestamp: new Date().toLocaleString()
      };
      setTestResult(result);
      
      if (result.success) {
        showSuccessAlert('API Test สำเร็จ', `Status: ${result.status}\nResponse: ${JSON.stringify(result.data, null, 2)}`);
      } else {
        showErrorAlert('API Test ล้มเหลว', `Status: ${result.status}\nError: ${result.data.detail || 'Unknown error'}`);
      }
    } catch (error) {
      const result = {
        success: false,
        error: error.message,
        timestamp: new Date().toLocaleString()
      };
      setTestResult(result);
      showErrorAlert('API Test ผิดพลาด', error.message);
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
          • GET /api/v1/export/sales - Export sales (requires auth)<br />
          • GET /reports/cn-date - Available dates for filtering<br />
          • GET /reports/cn-by-date - CN data by date range
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
  const [dateFilter, setDateFilter] = useState(null);

  const handleDateFilterChange = (filterData) => {
    setDateFilter(filterData);
    console.log('Date filter applied:', filterData);
  };

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
          
          // Show warning only once when data fails to load
          showWarningAlert(
            'ข้อมูลยังไม่พร้อม',
            'ระบบกำลังเตรียมข้อมูลให้คุณ กรุณารอสักครู่และลองใหม่\nระบบใช้ข้อมูลตัวอย่างในขณะนี้'
          );
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
        showErrorAlert('เกิดข้อผิดพลาด', errorMessage);
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
        showSuccessAlert(
          'Export ข้อมูลสำเร็จ!',
          'ไฟล์ได้ถูกสร้างและพร้อมดาวน์โหลดแล้ว'
        );
      } else {
        showErrorAlert(
          'Export ไม่สำเร็จ',
          `${result.error}\n\nกรุณาลองใหม่อีกครั้ง`
        );
      }
    } catch (error) {
      console.error('Export error:', error);
      if (config.isDevelopment) {
        showSuccessAlert(
          'Export ข้อมูลสำเร็จ!',
          'ไฟล์ได้ถูกสร้างและพร้อมดาวน์โหลดแล้ว (โหมดทดสอบ)'
        );
      } else {
        showErrorAlert('เกิดข้อผิดพลาด', 'ไม่สามารถ Export ข้อมูลได้');
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
      <Typography variant="h4" gutterBottom>
        แดชบอร์ดภาพรวม
      </Typography>

      <DateFilterCard onFilterChange={handleDateFilterChange} />

      {/* CN Charts Card */}
      <CnChartsCard dateFilter={dateFilter} />
      
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
      showInfoAlert('ออกจากระบบแล้ว', 'ขอบคุณที่ใช้บริการ CN Dashboard');
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


// //SweetAlert2
// import React, { useState } from 'react';
// import Swal from 'sweetalert2';
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
//   Collapse,
//   FormControl,
//   InputLabel,
//   Select
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
//   Refresh as RefreshIcon,
//   Search as SearchIcon
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

// // SweetAlert2 Helper Functions
// const showSuccessAlert = (title, text) => {
//   return Swal.fire({
//     icon: 'success',
//     title: title,
//     text: text,
//     confirmButtonText: 'ตกลง',
//     confirmButtonColor: '#4caf50',
//     timer: 3000,
//     timerProgressBar: true,
//   });
// };

// const showErrorAlert = (title, text) => {
//   return Swal.fire({
//     icon: 'error',
//     title: title,
//     text: text,
//     confirmButtonText: 'ตกลง',
//     confirmButtonColor: '#f44336',
//   });
// };

// const showWarningAlert = (title, text, showRetryButton = false) => {
//   const config = {
//     icon: 'warning',
//     title: title,
//     text: text,
//     confirmButtonText: 'ตกลง',
//     confirmButtonColor: '#ff9800',
//   };

//   if (showRetryButton) {
//     config.showCancelButton = true;
//     config.cancelButtonText = 'ลองใหม่';
//     config.cancelButtonColor = '#1976d2';
//   }

//   return Swal.fire(config);
// };

// const showInfoAlert = (title, text) => {
//   return Swal.fire({
//     icon: 'info',
//     title: title,
//     text: text,
//     confirmButtonText: 'ตกลง',
//     confirmButtonColor: '#1976d2',
//   });
// };

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
//       console.log('API Request:', { url, method: requestOptions.method || 'GET' });
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
//         let userFriendlyMessage;
        
//         switch (response.status) {
//           case 400:
//             userFriendlyMessage = 'ข้อมูลที่ส่งไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่';
//             break;
//           case 401:
//             userFriendlyMessage = 'ไม่มีสิทธิ์เข้าใช้งาน กรุณาเข้าสู่ระบบใหม่';
//             break;
//           case 403:
//             userFriendlyMessage = 'ไม่มีสิทธิ์ใช้งานฟีเจอร์นี้';
//             break;
//           case 404:
//             userFriendlyMessage = 'ไม่พบข้อมูลที่ต้องการ ระบบอาจยังไม่พร้อมใช้งาน';
//             break;
//           case 429:
//             userFriendlyMessage = 'คำขอมากเกินไป กรุณารอสักครู่แล้วลองใหม่';
//             break;
//           case 500:
//             userFriendlyMessage = 'เกิดข้อผิดพลาดในระบบ กรุณาติดต่อผู้ดูแลระบบ';
//             break;
//           case 502:
//           case 503:
//           case 504:
//             userFriendlyMessage = 'ระบบไม่พร้อมใช้งานชั่วคราว กรุณาลองใหม่อีกครั้ง';
//             break;
//           default:
//             userFriendlyMessage = `เกิดข้อผิดพลาด (${response.status}) กรุณาลองใหม่อีกครั้ง`;
//         }

//         const error = new Error(userFriendlyMessage);
//         error.status = response.status;
//         error.originalMessage = data.detail || data.message || response.statusText;
//         throw error;
//       }

//       if (config.debugMode) {
//         console.log('API Response:', data);
//       }

//       return { success: true, data, status: response.status };
//     } catch (error) {
//       if (config.debugMode) {
//         console.error('API Error:', error);
//       }

//       let userFriendlyMessage = error.message;
      
//       if (error.name === 'TypeError' && error.message.includes('fetch')) {
//         userFriendlyMessage = 'ไม่สามารถเชื่อมต่อกับระบบได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
//       } else if (error.name === 'AbortError') {
//         userFriendlyMessage = 'การเชื่อมต่อใช้เวลานานเกินไป กรุณาลองใหม่';
//       } else if (!error.status) {
//         userFriendlyMessage = 'ไม่สามารถเชื่อมต่อกับระบบได้ กรุณาตรวจสอบการเชื่อมต่อ';
//       }

//       return {
//         success: false,
//         error: userFriendlyMessage,
//         originalError: error.originalMessage || error.message,
//         status: error.status || 0,
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

//   async getAvailableDates() {
//     return this.get('/reports/cn-date');
//   }

//   async exportSalesData() {
//     return this.get('/api/v1/export/sales');
//   }
// }

// const apiService = new ApiService();

// // Connection Status Component (Simplified - no more alert banner)
// const ConnectionStatus = ({ connectionStatus, onRefresh, loading }) => {
//   // Only show in debug mode and only log to console
//   React.useEffect(() => {
//     if (config.debugMode && connectionStatus) {
//       if (connectionStatus.success) {
//         console.log('✅ API Connection: OK', connectionStatus.data?.message);
//       } else {
//         console.log('❌ API Connection: Failed', connectionStatus.error);
//       }
//     }
//   }, [connectionStatus]);

//   // Don't render any UI - all notifications handled by SweetAlert2
//   return null;
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

//   if (config.debugMode) {
//     menuItems.push({
//       text: 'API Testing',
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
//       const result = await apiService.login({ username, password });
      
//       if (result.success) {
//         const { access_token, token_type } = result.data;
        
//         localStorage.setItem(config.tokenKey, access_token);
        
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
        
//         showSuccessAlert('เข้าสู่ระบบสำเร็จ', 'ยินดีต้อนรับเข้าสู่ระบบ CN Dashboard');
//       } else {
//         if (config.isDevelopment) {
//           console.warn('API Login failed, trying mock login:', result.error);
          
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
          
//           showSuccessAlert('เข้าสู่ระบบสำเร็จ', 'ยินดีต้อนรับเข้าสู่ระบบ (โหมดทดสอบ)');
//         } else {
//           showErrorAlert(
//             'เข้าสู่ระบบไม่สำเร็จ',
//             `${result.error}\n\nกรุณาตรวจสอบ:\n• ชื่อผู้ใช้และรหัสผ่าน\n• การเชื่อมต่ออินเทอร์เน็ต`
//           );
//         }
//       }
//     } catch (error) {
//       console.error('Login error:', error);
//       if (config.isDevelopment) {
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
        
//         showSuccessAlert('เข้าสู่ระบบสำเร็จ', 'ยินดีต้อนรับเข้าสู่ระบบ (โหมดออฟไลน์)');
//       } else {
//         showErrorAlert(
//           'เกิดข้อผิดพลาด',
//           `${error.message}\n\nกรุณา:\n• ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต\n• ลองใหม่อีกครั้ง`
//         );
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

// // Date Filter Component
// const DateFilterCard = ({ onFilterChange }) => {
//   const [availableDates, setAvailableDates] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [startMonth, setStartMonth] = useState('');
//   const [startDate, setStartDate] = useState('');
//   const [endMonth, setEndMonth] = useState('');
//   const [endDate, setEndDate] = useState('');

//   const getMonthsAndDates = () => {
//     const months = new Set();
//     const datesByMonth = {};

//     availableDates.forEach(item => {
//       const date = new Date(item.DeliveryDate);
//       const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
//       const monthLabel = date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long' });
      
//       months.add(JSON.stringify({ key: monthKey, label: monthLabel }));
      
//       if (!datesByMonth[monthKey]) {
//         datesByMonth[monthKey] = [];
//       }
//       datesByMonth[monthKey].push({
//         value: item.DeliveryDate,
//         label: date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
//       });
//     });

//     return {
//       months: Array.from(months).map(m => JSON.parse(m)).sort((a, b) => a.key.localeCompare(b.key)),
//       datesByMonth
//     };
//   };

//   const { months, datesByMonth } = getMonthsAndDates();

//   React.useEffect(() => {
//     const fetchAvailableDates = async () => {
//       setLoading(true);
//       try {
//         const result = await apiService.getAvailableDates();
//         if (result.success && result.data?.data) {
//           setAvailableDates(result.data.data);
//         } else {
//           const mockDates = [];
//           for (let i = 1; i <= 30; i++) {
//             const date = new Date(2025, 6, i); // July 2025
//             mockDates.push({ DeliveryDate: date.toISOString().split('T')[0] });
//           }
//           setAvailableDates(mockDates);
          
//           if (config.isDevelopment) {
//             showWarningAlert(
//               'ข้อมูลยังไม่พร้อม',
//               'ระบบกำลังเตรียมข้อมูลให้คุณ กรุณารอสักครู่และลองใหม่\nระบบใช้ข้อมูลตัวอย่างในขณะนี้'
//             );
//           }
//         }
//       } catch (error) {
//         console.error('Error fetching dates:', error);
//         const mockDates = [];
//         for (let i = 1; i <= 30; i++) {
//           const date = new Date(2025, 6, i); // July 2025
//           mockDates.push({ DeliveryDate: date.toISOString().split('T')[0] });
//         }
//         setAvailableDates(mockDates);
        
//         showWarningAlert(
//           'ไม่สามารถโหลดข้อมูลได้',
//           'เกิดปัญหาในการเชื่อมต่อ ระบบจะใช้ข้อมูลตัวอย่างในขณะนี้'
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAvailableDates();
//   }, []);

//   const handleSearch = () => {
//     if (startDate && endDate) {
//       onFilterChange({
//         startDate,
//         endDate,
//         startMonth,
//         endMonth
//       });
      
//       showSuccessAlert(
//         'กรองข้อมูลสำเร็จ',
//         `ช่วงเวลา: ${new Date(startDate).toLocaleDateString('th-TH')} - ${new Date(endDate).toLocaleDateString('th-TH')}`
//       );
//     } else {
//       showWarningAlert(
//         'กรุณาเลือกข้อมูลให้ครบ',
//         'โปรดเลือกเดือนและวันที่เริ่มต้นและสิ้นสุด'
//       );
//     }
//   };

//   const getStartDates = () => {
//     return startMonth ? (datesByMonth[startMonth] || []) : [];
//   };

//   const getEndDates = () => {
//     return endMonth ? (datesByMonth[endMonth] || []) : [];
//   };

//   return (
//     <Card sx={{ mb: 4 }}>
//       <CardContent>
//         <Typography variant="h6" gutterBottom>
//           ตัวกรองข้อมูล
//         </Typography>
        
//         {loading ? (
//           <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
//             <CircularProgress size={20} sx={{ mr: 2 }} />
//             <Typography variant="body2" color="text.secondary">
//               กำลังโหลดข้อมูลวันที่...
//             </Typography>
//           </Box>
//         ) : (
//           <Grid container spacing={2} alignItems="center">
//             <Grid item xs={12} sm={6} md={2}>
//               <FormControl fullWidth size="small">
//                 <InputLabel>เดือนเริ่มต้น</InputLabel>
//                 <Select
//                   value={startMonth}
//                   label="เดือนเริ่มต้น"
//                   onChange={(e) => {
//                     setStartMonth(e.target.value);
//                     setStartDate('');
//                   }}
//                 >
//                   {months.map((month) => (
//                     <MenuItem key={month.key} value={month.key}>
//                       {month.label}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Grid>

//             <Grid item xs={12} sm={6} md={2}>
//               <FormControl fullWidth size="small">
//                 <InputLabel>วันที่เริ่มต้น</InputLabel>
//                 <Select
//                   value={startDate}
//                   label="วันที่เริ่มต้น"
//                   onChange={(e) => setStartDate(e.target.value)}
//                   disabled={!startMonth}
//                 >
//                   {getStartDates().map((date) => (
//                     <MenuItem key={date.value} value={date.value}>
//                       {date.label}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Grid>

//             <Grid item xs={12} sm={12} md={1} sx={{ textAlign: 'center' }}>
//               <Typography variant="body2" color="text.secondary">
//                 ถึง
//               </Typography>
//             </Grid>

//             <Grid item xs={12} sm={6} md={2}>
//               <FormControl fullWidth size="small">
//                 <InputLabel>เดือนสิ้นสุด</InputLabel>
//                 <Select
//                   value={endMonth}
//                   label="เดือนสิ้นสุด"
//                   onChange={(e) => {
//                     setEndMonth(e.target.value);
//                     setEndDate('');
//                   }}
//                 >
//                   {months.map((month) => (
//                     <MenuItem key={month.key} value={month.key}>
//                       {month.label}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Grid>

//             <Grid item xs={12} sm={6} md={2}>
//               <FormControl fullWidth size="small">
//                 <InputLabel>วันที่สิ้นสุด</InputLabel>
//                 <Select
//                   value={endDate}
//                   label="วันที่สิ้นสุด"
//                   onChange={(e) => setEndDate(e.target.value)}
//                   disabled={!endMonth}
//                 >
//                   {getEndDates().map((date) => (
//                     <MenuItem key={date.value} value={date.value}>
//                       {date.label}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Grid>

//             <Grid item xs={12} sm={12} md={3}>
//               <Button
//                 variant="contained"
//                 startIcon={<SearchIcon />}
//                 onClick={handleSearch}
//                 disabled={!startDate || !endDate || loading}
//                 fullWidth
//                 sx={{ height: '40px' }}
//               >
//                 ค้นหา
//               </Button>
//             </Grid>
//           </Grid>
//         )}

//         {startDate && endDate && (
//           <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
//             <Typography variant="body2" color="primary.contrastText">
//               ช่วงเวลาที่เลือก: {new Date(startDate).toLocaleDateString('th-TH')} - {new Date(endDate).toLocaleDateString('th-TH')}
//             </Typography>
//           </Box>
//         )}
//       </CardContent>
//     </Card>
//   );
// };

// // Simple API Test Component
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
//       const result = {
//         success: response.ok,
//         status: response.status,
//         data: data,
//         timestamp: new Date().toLocaleString()
//       };
//       setTestResult(result);
      
//       if (result.success) {
//         showSuccessAlert('API Test สำเร็จ', `Status: ${result.status}\nResponse: ${JSON.stringify(result.data, null, 2)}`);
//       } else {
//         showErrorAlert('API Test ล้มเหลว', `Status: ${result.status}\nError: ${result.data.detail || 'Unknown error'}`);
//       }
//     } catch (error) {
//       const result = {
//         success: false,
//         error: error.message,
//         timestamp: new Date().toLocaleString()
//       };
//       setTestResult(result);
//       showErrorAlert('API Test ผิดพลาด', error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Box sx={{ p: 3 }}>
//       <Typography variant="h4" gutterBottom>API Testing</Typography>
      
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
//           • GET /api/v1/export/sales - Export sales (requires auth)<br />
//           • GET /reports/cn-date - Available dates for filtering
//         </Typography>
//       </Alert>
//     </Box>
//   );
// };

// // Dashboard Component
// const Dashboard = ({ onExportRequest, user }) => {
//   const [salesData, setSalesData] = useState(mockSalesData);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [exportLoading, setExportLoading] = useState(false);
//   const [dateFilter, setDateFilter] = useState(null);

//   const handleDateFilterChange = (filterData) => {
//     setDateFilter(filterData);
//     console.log('Date filter applied:', filterData);
//   };

//   const fetchSalesData = async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       const result = await apiService.getSalesData();
      
//       if (result.success) {
//         setSalesData(result.data);
//         setError(null);
//       } else {
//         if (config.isDevelopment) {
//           console.warn('API ไม่พร้อมใช้งาน, ใช้ mock data แทน');
//           setSalesData(mockSalesData);
//           setError(result.error);
          
//           // Show warning only once when data fails to load
//           showWarningAlert(
//             'ข้อมูลยังไม่พร้อม',
//             'ระบบกำลังเตรียมข้อมูลให้คุณ กรุณารอสักครู่และลองใหม่\nระบบใช้ข้อมูลตัวอย่างในขณะนี้'
//           );
//         } else {
//           throw new Error(result.error);
//         }
//       }
//     } catch (err) {
//       const errorMessage = err.message || 'ไม่สามารถโหลดข้อมูลได้';
//       setError(errorMessage);
      
//       if (config.isDevelopment) {
//         console.warn('ใช้ mock data เนื่องจาก:', errorMessage);
//         setSalesData(mockSalesData);
//       } else {
//         setSalesData([]);
//         showErrorAlert('เกิดข้อผิดพลาด', errorMessage);
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
//         showSuccessAlert(
//           'Export ข้อมูลสำเร็จ!',
//           'ไฟล์ได้ถูกสร้างและพร้อมดาวน์โหลดแล้ว'
//         );
//       } else {
//         showErrorAlert(
//           'Export ไม่สำเร็จ',
//           `${result.error}\n\nกรุณาลองใหม่อีกครั้ง`
//         );
//       }
//     } catch (error) {
//       console.error('Export error:', error);
//       if (config.isDevelopment) {
//         showSuccessAlert(
//           'Export ข้อมูลสำเร็จ!',
//           'ไฟล์ได้ถูกสร้างและพร้อมดาวน์โหลดแล้ว (โหมดทดสอบ)'
//         );
//       } else {
//         showErrorAlert('เกิดข้อผิดพลาด', 'ไม่สามารถ Export ข้อมูลได้');
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
//       <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
//         <CircularProgress size={40} />
//         <Typography variant="h6" sx={{ mt: 2, color: 'primary.main' }}>
//           กำลังโหลดข้อมูล...
//         </Typography>
//         <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
//           กรุณารอสักครู่
//         </Typography>
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ p: 3 }}>
//       <Typography variant="h4" gutterBottom>
//         แดชบอร์ดภาพรวม
//       </Typography>

//       <DateFilterCard onFilterChange={handleDateFilterChange} />
      
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
//                         {branch.location}
//                       </Typography>
//                     )}
//                   </Box>
//                   {branch.manager && (
//                     <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
//                       ผจก. {branch.manager}
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

//   React.useEffect(() => {
//     if (config.debugMode) {
//       testConnection();
//     }
    
//     const token = localStorage.getItem(config.tokenKey);
//     if (token && token !== 'mock-jwt-token') {
//       validateToken(token);
//     } else if (token === 'mock-jwt-token') {
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
//       if (user?.token && user.token !== 'mock-jwt-token') {
//         await apiService.logout();
//       }
//     } catch (error) {
//       console.error('Logout API error:', error);
//     } finally {
//       localStorage.removeItem(config.tokenKey);
//       setUser(null);
//       showInfoAlert('ออกจากระบบแล้ว', 'ขอบคุณที่ใช้บริการ CN Dashboard');
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
//             <Alert severity="info" sx={{ borderRadius: 2 }}>
//               <Typography variant="body2" fontWeight="medium" gutterBottom>
//                 หน้านี้กำลังพัฒนา
//               </Typography>
//               <Typography variant="body2" color="text.secondary">
//                 ฟีเจอร์นี้จะเปิดใช้งานในเร็วๆ นี้ กรุณารอติดตาม
//               </Typography>
//             </Alert>
//           </Box>
//         );
//       case 'sales':
//         return (
//           <Box sx={{ p: 3 }}>
//             <Typography variant="h4" gutterBottom>ยอดขาย</Typography>
//             <Alert severity="info" sx={{ borderRadius: 2 }}>
//               <Typography variant="body2" fontWeight="medium" gutterBottom>
//                 หน้านี้กำลังพัฒนา
//               </Typography>
//               <Typography variant="body2" color="text.secondary">
//                 ฟีเจอร์นี้จะเปิดใช้งานในเร็วๆ นี้ กรุณารอติดตาม
//               </Typography>
//             </Alert>
//           </Box>
//         );
//       case 'reports':
//         return (
//           <Box sx={{ p: 3 }}>
//             <Typography variant="h4" gutterBottom>รายงาน</Typography>
//             <Alert severity="info" sx={{ borderRadius: 2 }}>
//               <Typography variant="body2" fontWeight="medium" gutterBottom>
//                 หน้านี้กำลังพัฒนา
//               </Typography>
//               <Typography variant="body2" color="text.secondary">
//                 ฟีเจอร์นี้จะเปิดใช้งานในเร็วๆ นี้ กรุณารอติดตาม
//               </Typography>
//             </Alert>
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

