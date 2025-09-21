import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Chip,
  CircularProgress,
} from '@mui/material';
import { FileDownload as ExportIcon } from '@mui/icons-material';
// ตรวจสอบ Path ตรงนี้! Path นี้หมายถึง "ถอยออกจากโฟลเดอร์ pages กลับไปที่ src แล้วเข้าไปที่ components"
import DateFilterCard from '../components/dashboard/DateFilterCard'; 
import CnChartsCard from '../components/dashboard/CnChartsCard';
import apiService from '../api/apiService';
import config from '../config';
import { mockSalesData } from '../data/mockData';
import { showSuccessAlert, showErrorAlert, showWarningAlert } from '../utils/alertHelpers';

const DashboardPage = ({ user, onExportRequest }) => {
  const [salesData, setSalesData] = useState(mockSalesData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState(null);

  const handleDateFilterChange = (filterData) => {
    setDateFilter(filterData);
  };

  useEffect(() => {
    const fetchSalesData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiService.getSalesData();
        if (result.success) {
          setSalesData(result.data);
          setError(null);
        } else {
          if (config.isDevelopment) {
            setSalesData(mockSalesData);
            setError(result.error);
            showWarningAlert('ข้อมูลยังไม่พร้อม', 'ระบบใช้ข้อมูลตัวอย่างในขณะนี้');
          } else { throw new Error(result.error); }
        }
      } catch (err) {
        const errorMessage = err.message || 'ไม่สามารถโหลดข้อมูลได้';
        setError(errorMessage);
        if (config.isDevelopment) {
          setSalesData(mockSalesData);
        } else {
          setSalesData([]);
          showErrorAlert('เกิดข้อผิดพลาด', errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSalesData();
  }, []);

  const handleExportRequest = async () => {
    if (!user) {
      onExportRequest();
      return;
    }
    setExportLoading(true);
    try {
      const result = await apiService.exportSalesData();
      if (result.success || config.isDevelopment) {
        showSuccessAlert('Export ข้อมูลสำเร็จ!', 'ไฟล์พร้อมดาวน์โหลดแล้ว');
      } else { showErrorAlert('Export ไม่สำเร็จ', `${result.error}`); }
    } catch (error) {
      console.error('Export error:', error);
      if (config.isDevelopment) {
        showSuccessAlert('Export ข้อมูลสำเร็จ!', 'ไฟล์พร้อมดาวน์โหลดแล้ว (โหมดทดสอบ)');
      } else { showErrorAlert('เกิดข้อผิดพลาด', 'ไม่สามารถ Export ข้อมูลได้'); }
    } finally {
      setExportLoading(false);
    }
  };

  const totalSales = salesData.reduce((sum, item) => sum + (item.sales || 0), 0);
  const avgGrowth = salesData.length > 0 ? salesData.reduce((sum, item) => sum + (item.growth || 0), 0) / salesData.length : 0;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={40} />
        <Typography variant="h6" sx={{ mt: 2, color: 'primary.main' }}>กำลังโหลดข้อมูล...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>แดชบอร์ดภาพรวม</Typography>
      <DateFilterCard onFilterChange={handleDateFilterChange} />
      <CnChartsCard dateFilter={dateFilter} />
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}><Card sx={{ height: '100%' }}><CardContent><Typography variant="h6" color="primary" gutterBottom>ยอดขายรวม</Typography><Typography variant="h4">฿{totalSales.toLocaleString()}</Typography></CardContent></Card></Grid>
        <Grid item xs={12} md={6}><Card sx={{ height: '100%' }}><CardContent><Typography variant="h6" color="secondary" gutterBottom>อัตราการเติบโต</Typography><Typography variant="h4" color={avgGrowth > 0 ? 'success.main' : 'error.main'}>{avgGrowth > 0 ? '+' : ''}{avgGrowth.toFixed(1)}%</Typography></CardContent></Card></Grid>
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
            {salesData.map((branch, index) => (
              <Grid item xs={12} md={6} key={branch.id || index}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>{branch.branch}</Typography>
                  <Typography variant="h5" color="primary">฿{(branch.sales || 0).toLocaleString()}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Chip label={`${(branch.growth || 0)}%`} color={(branch.growth || 0) > 0 ? 'success' : 'error'} size="small" />
                    <Typography variant="caption" color="text.secondary">{branch.location}</Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DashboardPage;