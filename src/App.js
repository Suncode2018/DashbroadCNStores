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
  Alert
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
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';

// สร้าง Theme สวยงาม
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
});

// Component สำหรับ Navbar
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
          CN Dashboard - ระบบติดตามยอดขาย
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

// Component สำหรับ Drawer
const SideDrawer = ({ open, onClose, currentPage, onPageChange }) => {
  const menuItems = [
    { text: 'แดชบอร์ด', icon: <DashboardIcon />, page: 'dashboard' },
    { text: 'ข้อมูลสาขา', icon: <StoreIcon />, page: 'branches' },
    { text: 'ยอดขาย', icon: <TrendingUpIcon />, page: 'sales' },
    { text: 'รายงาน', icon: <AssessmentIcon />, page: 'reports' },
  ];

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true,
      }}
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

// Component สำหรับ Login Dialog
const LoginDialog = ({ open, onClose, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // จำลองการ Login
    setTimeout(() => {
      if (username && password) {
        onLogin({
          name: username,
          email: `${username}@company.com`,
          role: 'Manager'
        });
        onClose();
        setUsername('');
        setPassword('');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Typography variant="h5" component="div" gutterBottom>
          เข้าสู่ระบบ
        </Typography>
        <Typography variant="body2" color="text.secondary">
          กรุณาเข้าสู่ระบบเพื่อใช้งานฟีเจอร์ Export
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

// Component สำหรับ Profile Dialog
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

// Component สำหรับ Dashboard
const Dashboard = ({ onExportRequest }) => {
  // ข้อมูลจำลองสำหรับ Dashboard
  const salesData = [
    { branch: 'สาขาเซ็นทรัล', sales: 1250000, growth: 12.5 },
    { branch: 'สาขาสยาม', sales: 980000, growth: 8.3 },
    { branch: 'สาขาอโศก', sales: 1100000, growth: 15.2 },
    { branch: 'สาขาสีลม', sales: 850000, growth: -2.1 },
  ];

  const totalSales = salesData.reduce((sum, item) => sum + item.sales, 0);
  const avgGrowth = salesData.reduce((sum, item) => sum + item.growth, 0) / salesData.length;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        แดชบอร์ดภาพรวม
      </Typography>
      
      {/* Cards สรุปยอดขาย */}
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
                เดือนนี้
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

      {/* ตารางข้อมูลสาขา */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              ข้อมูลยอดขายตามสาขา
            </Typography>
            <Button
              variant="contained"
              startIcon={<ExportIcon />}
              onClick={onExportRequest}
              sx={{ borderRadius: 2 }}
            >
              Export ข้อมูล
            </Button>
          </Box>
          
          <Grid container spacing={2}>
            {salesData.map((branch, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    {branch.branch}
                  </Typography>
                  <Typography variant="h5" color="primary" gutterBottom>
                    ฿{branch.sales.toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      การเติบโต: 
                    </Typography>
                    <Chip
                      label={`${branch.growth > 0 ? '+' : ''}${branch.growth}%`}
                      color={branch.growth > 0 ? 'success' : 'error'}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

// Component หลัก App
function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExportRequest = () => {
    if (user) {
      // จำลองการ Export
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } else {
      setLoginDialogOpen(true);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
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
          {exportSuccess && (
            <Alert severity="success" sx={{ m: 2 }}>
              Export ข้อมูลเรียบร้อยแล้ว!
            </Alert>
          )}
          
          <Dashboard onExportRequest={handleExportRequest} />
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
    </ThemeProvider>
  );
}

export default App;

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
