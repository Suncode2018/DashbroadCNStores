import React from 'react';
// **[MODIFIED]** Removed 'Box' as it's not being used
import { Typography, Button, Alert } from '@mui/material';
import { ErrorOutline as ErrorIcon, InfoOutlined as InfoIcon } from '@mui/icons-material';

const DataMessage = ({ status, message, onRetry }) => {
  const isError = status === 'error';
  const isInfo = status === 'info';

  return (
    <Alert 
      severity={isError ? 'error' : 'info'}
      iconMapping={{
        error: <ErrorIcon fontSize="inherit" />,
        info: <InfoIcon fontSize="inherit" />,
      }}
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        flexDirection: 'column', 
        textAlign: 'center',
        p: 4,
        m: 2,
        // Using mt directly on Alert instead of wrapping with Box
        mt: 4 
      }}
    >
      <Typography variant="h6" gutterBottom>
        {isError ? 'เกิดข้อผิดพลาด' : (isInfo ? 'คำแนะนำ' : 'ไม่พบข้อมูล')}
      </Typography>
      <Typography variant="body2" sx={{ mb: isError ? 2 : 0 }}>
        {message}
      </Typography>
      {isError && onRetry && (
        <Button variant="outlined" color="error" onClick={onRetry} sx={{ mt: 1 }}>
          ลองใหม่
        </Button>
      )}
    </Alert>
  );
};

export default DataMessage;