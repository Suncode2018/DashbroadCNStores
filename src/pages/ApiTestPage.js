import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Button, Alert } from '@mui/material';
import config from '../config';
import { showSuccessAlert, showErrorAlert } from '../utils/alertHelpers';

const ApiTestPage = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testLoginAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'rungsun', password: '1234' })
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
        showSuccessAlert('API Test สำเร็จ', `Status: ${result.status}`);
      } else {
        showErrorAlert('API Test ล้มเหลว', `Status: ${result.status}\nError: ${data.detail || 'Unknown error'}`);
      }
    } catch (error) {
      const result = { success: false, error: error.message, timestamp: new Date().toLocaleString() };
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
          
          <Button variant="contained" onClick={testLoginAPI} disabled={loading} sx={{ mb: 2 }}>
            {loading ? 'Testing...' : 'Test Login API'}
          </Button>

          {testResult && (
            <Alert severity={testResult.success ? 'success' : 'error'} sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Status:</strong> {testResult.status || 'Error'}<br />
                <strong>Time:</strong> {testResult.timestamp}<br />
                <strong>Response:</strong>
              </Typography>
              <Box component="pre" sx={{ mt: 1, p: 1, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 1, fontSize: '0.8rem', overflow: 'auto' }}>
                {testResult.error || JSON.stringify(testResult.data, null, 2)}
              </Box>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Alert severity="info">
        <Typography variant="body2">
          <strong>Available Endpoints:</strong><br />
          • GET /reports/cn-date<br />
          • GET /reports/cn-by-date
        </Typography>
      </Alert>
    </Box>
  );
};

export default ApiTestPage;