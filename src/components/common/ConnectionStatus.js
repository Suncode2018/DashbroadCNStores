import React, { useState, useEffect } from 'react';
import { Alert, IconButton, Collapse, Box, Typography } from '@mui/material';
import { Close as CloseIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import apiService from '../../services/api';
import config from '../../config/config';

const ConnectionStatus = () => {
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [showAlert, setShowAlert] = useState(true);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      const result = await apiService.testConnection();
      setConnectionStatus(result);
      
      if (result.success) {
        console.log('🟢 API Connection: OK', result.data);
      } else {
        console.log('🔴 API Connection: Failed', result.error);
      }
    } catch (error) {
      setConnectionStatus({
        success: false,
        error: 'ไม่สามารถทดสอบการเชื่อมต่อได้',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (config.debugMode) {
      testConnection();
    }
  }, []);

  // ไม่แสดงใน production หรือเมื่อไม่ได้เปิด debug mode
  if (!config.debugMode || config.isProduction) {
    return null;
  }

  return (
    <Collapse in={showAlert && connectionStatus !== null}>
      <Alert
        severity={connectionStatus?.success ? 'success' : 'error'}
        sx={{ m: 2 }}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              size="small"
              onClick={testConnection}
              disabled={loading}
              sx={{ mr: 1 }}
            >
              <RefreshIcon />
            </IconButton>
            <IconButton
              color="inherit"
              size="small"
              onClick={() => setShowAlert(false)}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        }
      >
        <Typography variant="body2">
          <strong>API Connection:</strong>{' '}
          {connectionStatus?.success ? (
            <>
              เชื่อมต่อสำเร็จ - {config.apiBaseUrl}
              {connectionStatus.data?.message && (
                <><br />📡 {connectionStatus.data.message}</>
              )}
            </>
          ) : (
            <>
              เชื่อมต่อไม่สำเร็จ - {connectionStatus?.error}
              <br />🔗 ตรวจสอบ: {config.apiBaseUrl}
            </>
          )}
        </Typography>
      </Alert>
    </Collapse>
  );
};

export default ConnectionStatus;