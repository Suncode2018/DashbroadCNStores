import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import config from '../../config';

const Navbar = ({ onMenuClick, user, onProfileClick, onLogout }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleProfileMenuOpen = (event) => {
    if (user) {
      setAnchorEl(event.currentTarget);
    } else {
      onProfileClick(); // If no user, clicking profile icon might open login
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

export default Navbar;