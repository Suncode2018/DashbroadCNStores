import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, Paper, Chip, CircularProgress } from '@mui/material';
import { FileDownload as ExportIcon } from '@mui/icons-material';
import DateFilterCard from '../components/dashboard/DateFilterCard';
import CnChartsCard from '../components/dashboard/CnChartsCard';
import DataMessage from '../components/common/DataMessage';
import apiService from '../api/apiService';
import { showSuccessAlert, showErrorAlert } from '../utils/alertHelpers';

const DashboardPage = ({ user, onExportRequest }) => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'empty', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const handleDateFilterChange = (filterData) => {
    setDateFilter(filterData);
  };

  const fetchSalesData = useCallback(async () => {
    setLoading(true);
    setStatus('loading');
    try {
      const result = await apiService.getSalesData();
      if (result.success) {
        // This covers both cases: successful response with data, and successful response with no data (e.g. 404)
        if (Array.isArray(result.data?.data) && result.data.data.length > 0) {
          setSalesData(result.data.data);
          setStatus('success');
        } else {
          setSalesData([]); // Set data to empty array
          setStatus('empty'); // Set status to empty
        }
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setSalesData([]);
      setStatus('error');
      setErrorMessage(err.message || 'ไม่สามารถโหลดข้อมูลยอดขายได้');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSalesData();
  }, [fetchSalesData]);

  const handleExportRequest = async () => { if (!user) { onExportRequest(); return; } setExportLoading(true); try { const result = await apiService.exportSalesData(); if (result.success) { showSuccessAlert('Export ข้อมูลสำเร็จ!', 'ไฟล์พร้อมดาวน์โหลดแล้ว'); } else { showErrorAlert('Export ไม่สำเร็จ', `${result.error}`); } } catch (error) { showErrorAlert('เกิดข้อผิดพลาด', 'ไม่สามารถ Export ข้อมูลได้'); } finally { setExportLoading(false); } };

  const totalSales = salesData.reduce((sum, item) => sum + (item.sales || 0), 0);
  const avgGrowth = salesData.length > 0 ? salesData.reduce((sum, item) => sum + (item.growth || 0), 0) / salesData.length : 0;

  const renderSalesContent = () => {
    if (status === 'error') {
      return <DataMessage status="error" message={errorMessage} onRetry={fetchSalesData} />;
    }

    // **[MODIFIED LOGIC]**
    // We will now render the components for both 'success' and 'empty' states.
    // The components will naturally display 0 or an empty list if salesData is an empty array.
    if (status === 'success' || status === 'empty') {
      return (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>ยอดขายรวม</Typography>
                  <Typography variant="h4">฿{totalSales.toLocaleString()}</Typography>
                  <Typography variant="body2" color="text.secondary">เดือนนี้ • {salesData.length} สาขา</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" color="secondary" gutterBottom>อัตราการเติบโต</Typography>
                  <Typography variant="h4" color={avgGrowth >= 0 ? 'success.main' : 'error.main'}>
                    {avgGrowth >= 0 ? '+' : ''}{avgGrowth.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">เฉลี่ยทุกสาขา</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">ข้อมูลยอดขายตามสาขา</Typography>
                <Button variant="contained" startIcon={<ExportIcon />} onClick={handleExportRequest} disabled={exportLoading}>
                  {exportLoading ? 'กำลัง Export...' : 'Export ข้อมูล'}
                </Button>
              </Box>
              <Grid container spacing={2}>
                {/* If salesData is empty, this map will simply render nothing, which is the desired behavior */}
                {salesData.map((branch, index) => (
                  <Grid item xs={12} md={6} key={branch.id || index}>
                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                      <Typography variant="h6" gutterBottom>{branch.branch}</Typography>
                      <Typography variant="h5" color="primary">฿{(branch.sales || 0).toLocaleString()}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Chip label={`${branch.growth >= 0 ? '+' : ''}${(branch.growth || 0)}%`} color={(branch.growth || 0) >= 0 ? 'success' : 'error'} size="small" />
                        <Typography variant="caption" color="text.secondary">{branch.location}</Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </>
      );
    }
    return null;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* <Typography variant="h4" gutterBottom>แดชบอร์ดภาพรวม CN CDC-บางบัวทอง</Typography> */}
      <DateFilterCard onFilterChange={handleDateFilterChange} />
      <CnChartsCard dateFilter={dateFilter} />
      
      {loading 
        ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box> 
        : renderSalesContent()
      }
    </Box>
  );
};

export default DashboardPage;

