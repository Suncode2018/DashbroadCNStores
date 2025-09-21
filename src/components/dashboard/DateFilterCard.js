import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  CircularProgress,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import apiService from '../../api/apiService';
import config from '../../config';
import { showSuccessAlert, showWarningAlert } from '../../utils/alertHelpers';

const DateFilterCard = ({ onFilterChange }) => {
  const [availableDates, setAvailableDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startMonth, setStartMonth] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endMonth, setEndMonth] = useState('');
  const [endDate, setEndDate] = useState('');

  const getMonthsAndDates = () => {
    const months = new Set();
    const datesByMonth = {};

    availableDates.forEach(item => {
      const date = new Date(item.DeliveryDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long' });
      
      months.add(JSON.stringify({ key: monthKey, label: monthLabel }));
      
      if (!datesByMonth[monthKey]) {
        datesByMonth[monthKey] = [];
      }
      datesByMonth[monthKey].push({
        value: item.DeliveryDate,
        label: date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
      });
    });

    return {
      months: Array.from(months).map(m => JSON.parse(m)).sort((a, b) => a.key.localeCompare(b.key)),
      datesByMonth
    };
  };

  const { months, datesByMonth } = getMonthsAndDates();

  useEffect(() => {
    const fetchAvailableDates = async () => {
      setLoading(true);
      try {
        const result = await apiService.getAvailableDates();
        if (result.success && result.data?.data) {
          setAvailableDates(result.data.data);
        } else {
          const mockDates = [];
          for (let i = 1; i <= 30; i++) {
            const date = new Date(2025, 8, i); // September 2025
            mockDates.push({ DeliveryDate: date.toISOString().split('T')[0] });
          }
          setAvailableDates(mockDates);
          
          if (config.isDevelopment) {
            showWarningAlert(
              'ข้อมูลยังไม่พร้อม',
              'ระบบกำลังเตรียมข้อมูลให้คุณ กรุณารอสักครู่และลองใหม่\nระบบใช้ข้อมูลตัวอย่างในขณะนี้'
            );
          }
        }
      } catch (error) {
        console.error('Error fetching dates:', error);
        const mockDates = [];
        for (let i = 1; i <= 30; i++) {
          const date = new Date(2025, 8, i); // September 2025
          mockDates.push({ DeliveryDate: date.toISOString().split('T')[0] });
        }
        setAvailableDates(mockDates);
        
        showWarningAlert(
          'ไม่สามารถโหลดข้อมูลได้',
          'เกิดปัญหาในการเชื่อมต่อ ระบบจะใช้ข้อมูลตัวอย่างในขณะนี้'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableDates();
  }, []);

  const handleSearch = () => {
    if (startDate && endDate) {
      onFilterChange({
        startDate,
        endDate,
        startMonth,
        endMonth
      });
      
      showSuccessAlert(
        'กรองข้อมูลสำเร็จ',
        `ช่วงเวลา: ${new Date(startDate).toLocaleDateString('th-TH')} - ${new Date(endDate).toLocaleDateString('th-TH')}`
      );
    } else {
      showWarningAlert(
        'กรุณาเลือกข้อมูลให้ครบ',
        'โปรดเลือกเดือนและวันที่เริ่มต้นและสิ้นสุด'
      );
    }
  };

  const getStartDates = () => {
    return startMonth ? (datesByMonth[startMonth] || []) : [];
  };

  const getEndDates = () => {
    return endMonth ? (datesByMonth[endMonth] || []) : [];
  };

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          ตัวกรองข้อมูล
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
            <CircularProgress size={20} sx={{ mr: 2 }} />
            <Typography variant="body2" color="text.secondary">
              กำลังโหลดข้อมูลวันที่...
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>เดือนเริ่มต้น</InputLabel>
                <Select
                  value={startMonth}
                  label="เดือนเริ่มต้น"
                  onChange={(e) => {
                    setStartMonth(e.target.value);
                    setStartDate('');
                  }}
                >
                  {months.map((month) => (
                    <MenuItem key={month.key} value={month.key}>
                      {month.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>วันที่เริ่มต้น</InputLabel>
                <Select
                  value={startDate}
                  label="วันที่เริ่มต้น"
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={!startMonth}
                >
                  {getStartDates().map((date) => (
                    <MenuItem key={date.value} value={date.value}>
                      {date.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={12} md={1} sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                ถึง
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>เดือนสิ้นสุด</InputLabel>
                <Select
                  value={endMonth}
                  label="เดือนสิ้นสุด"
                  onChange={(e) => {
                    setEndMonth(e.target.value);
                    setEndDate('');
                  }}
                >
                  {months.map((month) => (
                    <MenuItem key={month.key} value={month.key}>
                      {month.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>วันที่สิ้นสุด</InputLabel>
                <Select
                  value={endDate}
                  label="วันที่สิ้นสุด"
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={!endMonth}
                >
                  {getEndDates().map((date) => (
                    <MenuItem key={date.value} value={date.value}>
                      {date.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={12} md={3}>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleSearch}
                disabled={!startDate || !endDate || loading}
                fullWidth
                sx={{ height: '40px' }}
              >
                ค้นหา
              </Button>
            </Grid>
          </Grid>
        )}

        {startDate && endDate && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
            <Typography variant="body2" color="primary.contrastText">
              ช่วงเวลาที่เลือก: {new Date(startDate).toLocaleDateString('th-TH')} - {new Date(endDate).toLocaleDateString('th-TH')}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default DateFilterCard;