import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
  LinearProgress,
} from '@mui/material';
import { Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';
import apiService from '../../api/apiService';
import config from '../../config';
import { showSuccessAlert, showErrorAlert } from '../../utils/alertHelpers';

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

export default LoginDialog;