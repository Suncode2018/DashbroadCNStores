import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Box,
  Toolbar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Store as StoreIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
// **[MODIFIED]** Removed unused 'config' import
// import config from '../../config';

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

export default SideDrawer;