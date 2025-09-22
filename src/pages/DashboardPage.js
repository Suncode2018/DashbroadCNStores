import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import DateFilterCard from '../components/dashboard/DateFilterCard';
import CnChartsCard from '../components/dashboard/CnChartsCard'; // The one and only chart card
import apiService from '../api/apiService';

const DashboardPage = () => {
  const [dateFilter, setDateFilter] = useState(null);
  const [apiData, setApiData] = useState([]);
  const [status, setStatus] = useState('initial');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchCnData = useCallback(async (startDate, endDate) => {
    if (!startDate || !endDate) {
      setStatus('initial');
      setApiData([]);
      return;
    }
    setStatus('loading');
    try {
      const result = await apiService.getCnReportByDate(startDate, endDate);
      if (result.success) {
        if (Array.isArray(result.data?.data) && result.data.data.length > 0) {
          setApiData(result.data.data);
          setStatus('success');
        } else {
          setApiData([]);
          setStatus('empty');
        }
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setApiData([]);
      setStatus('error');
      setErrorMessage(err.message || 'ไม่สามารถดึงข้อมูลได้');
    }
  }, []);

  useEffect(() => {
    fetchCnData(dateFilter?.startDate, dateFilter?.endDate);
  }, [dateFilter, fetchCnData]);

  const handleRetry = useCallback(() => {
    fetchCnData(dateFilter?.startDate, dateFilter?.endDate);
  }, [dateFilter, fetchCnData]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        แดชบอร์ดภาพรวม CDC-บางบัวทอง
      </Typography>
      
      <DateFilterCard onFilterChange={setDateFilter} />

      {status === 'loading' && <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>}

      {status !== 'loading' && (
        <CnChartsCard
          status={status}
          apiData={apiData}
          errorMessage={errorMessage}
          onRetry={handleRetry}
          dateFilter={dateFilter}
        />
      )}
    </Box>
  );
};

export default DashboardPage;

