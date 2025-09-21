import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Avatar,
  Typography,
  Chip,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

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

export default ProfileDialog;