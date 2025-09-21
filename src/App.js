import React, { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, Box, Typography, Alert } from '@mui/material';

import { theme } from './styles/theme';
import config from './config';
import apiService from './api/apiService';
import { showInfoAlert } from './utils/alertHelpers';

import Navbar from './components/layout/Navbar';
import SideDrawer from './components/layout/SideDrawer';
import LoginDialog from './components/auth/LoginDialog';
import ProfileDialog from './components/auth/ProfileDialog';
import ConnectionStatus from './components/common/ConnectionStatus';
import EnvironmentBadge from './components/common/EnvironmentBadge';
import DashboardPage from './pages/DashboardPage';
import ApiTestPage from './pages/ApiTestPage';

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);

  useEffect(() => {
    if (config.debugMode) { testConnection(); }
    const token = localStorage.getItem(config.tokenKey);
    if (token) { validateToken(token); }
  }, []);

  const validateToken = async (token) => {
    if (token === 'mock-jwt-token') { setUser({ name: 'Mock User', email: 'mock@company.com', role: 'Manager (Mock)' }); return; }
    try {
      const result = await apiService.getProfile();
      if (result.success) { setUser(result.data); } 
      else { localStorage.removeItem(config.tokenKey); }
    } catch (error) {
      console.error('Token validation failed:', error);
      localStorage.removeItem(config.tokenKey);
    }
  };

  const testConnection = async () => {
    const result = await apiService.testConnection();
    setConnectionStatus(result);
  };

  const handleLogin = (userData) => { setUser(userData); };

  const handleLogout = async () => {
    try {
      if (user?.token && user.token !== 'mock-jwt-token') { await apiService.logout(); }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      localStorage.removeItem(config.tokenKey);
      setUser(null);
      showInfoAlert('ออกจากระบบแล้ว', 'ขอบคุณที่ใช้บริการ CN Dashboard');
    }
  };

  // **[NEW]** Function to handle navigation to the home/dashboard page
  const handleGoHome = () => {
    setCurrentPage('dashboard');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage user={user} onExportRequest={() => setLoginDialogOpen(true)} />;
      case 'api-test':
        return config.debugMode ? <ApiTestPage /> : null;
      case 'branches':
      case 'sales':
      case 'reports':
        return ( <Box sx={{ p: 3 }}><Typography variant="h4" gutterBottom>หน้านี้กำลังพัฒนา</Typography><Alert severity="info">ฟีเจอร์นี้จะเปิดใช้งานในเร็วๆ นี้</Alert></Box> );
      default:
        return <DashboardPage user={user} onExportRequest={() => setLoginDialogOpen(true)} />;
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
          // **[MODIFIED]** Pass the new function as a prop
          onGoHome={handleGoHome}
        />
        
        <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} currentPage={currentPage} onPageChange={setCurrentPage} />

        <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh', mt: '64px' }}>
          <ConnectionStatus connectionStatus={connectionStatus} />
          {renderCurrentPage()}
        </Box>

        <LoginDialog open={loginDialogOpen} onClose={() => setLoginDialogOpen(false)} onLogin={handleLogin} />
        <ProfileDialog open={profileDialogOpen} onClose={() => setProfileDialogOpen(false)} user={user} />
      </Box>
      <EnvironmentBadge />
    </ThemeProvider>
  );
}

export default App;

