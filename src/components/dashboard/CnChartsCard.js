import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  ButtonGroup,
  Button,
  CircularProgress,
  Grid,
  Chip,
  Alert,
} from '@mui/material';
import {
  ShowChart as LineChartIcon,
  AreaChart as AreaChartIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
} from '@mui/icons-material';
import apiService from '../../api/apiService';
import config from '../../config';
import { showWarningAlert } from '../../utils/alertHelpers';


const CnChartsCard = ({ dateFilter }) => {
  const [cnData, setCnData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState('line');
  const [error, setError] = useState(null);

  const mockCnData = [
    { DeliveryDate: "2025-09-01", countCnNoALL: 837, countCnNo43ALL: 486, countCnNo42ALL: 351 },
    { DeliveryDate: "2025-09-02", countCnNoALL: 918, countCnNo43ALL: 516, countCnNo42ALL: 402 },
    { DeliveryDate: "2025-09-03", countCnNoALL: 895, countCnNo43ALL: 539, countCnNo42ALL: 356 },
    { DeliveryDate: "2025-09-04", countCnNoALL: 919, countCnNo43ALL: 532, countCnNo42ALL: 387 },
    { DeliveryDate: "2025-09-05", countCnNoALL: 902, countCnNo43ALL: 522, countCnNo42ALL: 380 },
  ];

  const fetchCnData = async (startDate, endDate) => {
    if (!startDate || !endDate) {
      setCnData(mockCnData);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await apiService.getCnReportByDate(startDate, endDate);
      
      if (result.success && result.data?.data) {
        setCnData(result.data.data);
      } else {
        setCnData(mockCnData);
        if (config.isDevelopment) {
          showWarningAlert(
            'ข้อมูล CN ยังไม่พร้อม',
            'ระบบจะแสดงข้อมูลตัวอย่างในขณะนี้'
          );
        }
      }
    } catch (err) {
      console.error('Error fetching CN data:', err);
      setCnData(mockCnData);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dateFilter && dateFilter.startDate && dateFilter.endDate) {
      fetchCnData(dateFilter.startDate, dateFilter.endDate);
    } else {
      setCnData(mockCnData);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFilter]);

  const chartData = cnData.map(item => ({
    date: new Date(item.DeliveryDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
    fullDate: item.DeliveryDate,
    total: item.countCnNoALL,
    cn43: item.countCnNo43ALL,
    cn42: item.countCnNo42ALL,
  }));

  const totalCn43 = cnData.reduce((sum, item) => sum + item.countCnNo43ALL, 0);
  const totalCn42 = cnData.reduce((sum, item) => sum + item.countCnNo42ALL, 0);
  const totalAll = totalCn43 + totalCn42;

  const avgPerDay = chartData.length > 0 ? Math.round(totalAll / chartData.length) : 0;
  const maxDay = chartData.length > 0 ? Math.max(...chartData.map(d => d.total)) : 0;
  const minDay = chartData.length > 0 ? Math.min(...chartData.map(d => d.total)) : 0;

  // Chart rendering functions from the original App.js
  const renderLineChart = () => (
    <Box sx={{ width: '100%', height: 400 }}>
      <Typography variant="h6" color="primary" gutterBottom align="center">
        แนวโน้ม CN ตามช่วงเวลา
      </Typography>
      
      <Box sx={{ 
        width: '100%', 
        height: 320, 
        position: 'relative',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        p: 2
      }}>
        <Box sx={{ 
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          opacity: 0.1,
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 35px, #ccc 35px, #ccc 36px), repeating-linear-gradient(90deg, transparent, transparent 35px, #ccc 35px, #ccc 36px)`
        }} />
        <Box sx={{ display: 'flex', alignItems: 'end', justifyContent: 'space-around', height: '100%', pt: 2, pb: 4 }}>
          {chartData.slice(0, 7).map((item, index) => {
            const heightTotal = (item.total / maxDay) * 250;
            return (
              <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                <Box sx={{ width: 8, height: 8, bgcolor: 'primary.main', borderRadius: '50%', position: 'absolute', bottom: heightTotal + 30, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                <Box sx={{ width: 12, height: (item.cn43 / maxDay) * 200, bgcolor: 'secondary.main', borderRadius: '2px 2px 0 0', mb: 0.5, opacity: 0.8 }} />
                <Box sx={{ width: 12, height: (item.cn42 / maxDay) * 200, bgcolor: 'success.main', borderRadius: '2px 2px 0 0', mb: 1, opacity: 0.8 }} />
                <Typography variant="caption" sx={{ fontSize: '0.7rem', textAlign: 'center', color: 'text.secondary', transform: 'rotate(-45deg)', whiteSpace: 'nowrap' }}>{item.date}</Typography>
                <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'primary.main', fontWeight: 'bold', mt: 0.5 }}>{item.total}</Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );

  const renderAreaChart = () => ( <Box sx={{ p: 4, border: '1px dashed grey', textAlign: 'center' }}>Area Chart Simulation</Box> );
  const renderBarChart = () => ( <Box sx={{ p: 4, border: '1px dashed grey', textAlign: 'center' }}>Bar Chart Simulation</Box> );
  const renderPieChart = () => ( <Box sx={{ p: 4, border: '1px dashed grey', textAlign: 'center' }}>Pie Chart Simulation</Box> );

  const renderChart = () => {
    switch (chartType) {
      case 'line': return renderLineChart();
      case 'area': return renderAreaChart();
      case 'bar': return renderBarChart();
      case 'pie': return renderPieChart();
      default: return renderLineChart();
    }
  };

  return (
    <Card sx={{ mb: 4, boxShadow: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold" color="primary">
            CN ทั้งหมด
          </Typography>
          
          <ButtonGroup variant="outlined" size="small" sx={{ borderRadius: 2 }}>
            <Button variant={chartType === 'line' ? 'contained' : 'outlined'} startIcon={<LineChartIcon />} onClick={() => setChartType('line')} sx={{ borderRadius: '8px 0 0 8px' }}>เส้น</Button>
            <Button variant={chartType === 'area' ? 'contained' : 'outlined'} startIcon={<AreaChartIcon />} onClick={() => setChartType('area')}>พื้นที่</Button>
            <Button variant={chartType === 'bar' ? 'contained' : 'outlined'} startIcon={<BarChartIcon />} onClick={() => setChartType('bar')}>แท่ง</Button>
            <Button variant={chartType === 'pie' ? 'contained' : 'outlined'} startIcon={<PieChartIcon />} onClick={() => setChartType('pie')} sx={{ borderRadius: '0 8px 8px 0' }}>วงกลม</Button>
          </ButtonGroup>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
            <CircularProgress sx={{ mr: 2 }} />
            <Typography>กำลังโหลดข้อมูล CN...</Typography>
          </Box>
        ) : (
          <>
            {renderChart()}
            
            <Box sx={{ mt: 3, p: 3, bgcolor: 'grey.50', borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
              <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">สรุปข้อมูล CN (ช่วงเวลาที่เลือก)</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={3}><Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', borderRadius: 2 }}><Typography variant="body2" color="primary.contrastText">CN ทั้งหมด</Typography><Typography variant="h5" color="primary.contrastText" fontWeight="bold">{totalAll.toLocaleString()}</Typography></Box></Grid>
                <Grid item xs={12} sm={3}><Box sx={{ textAlign: 'center', p: 2, bgcolor: 'secondary.light', borderRadius: 2 }}><Typography variant="body2" color="secondary.contrastText">CN43</Typography><Typography variant="h5" color="secondary.contrastText" fontWeight="bold">{totalCn43.toLocaleString()}</Typography><Typography variant="caption" color="secondary.contrastText">{((totalCn43 / totalAll) * 100 || 0).toFixed(1)}%</Typography></Box></Grid>
                <Grid item xs={12} sm={3}><Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 2 }}><Typography variant="body2" color="success.contrastText">CN42</Typography><Typography variant="h5" color="success.contrastText" fontWeight="bold">{totalCn42.toLocaleString()}</Typography><Typography variant="caption" color="success.contrastText">{((totalCn42 / totalAll) * 100 || 0).toFixed(1)}%</Typography></Box></Grid>
                <Grid item xs={12} sm={3}><Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.light', borderRadius: 2 }}><Typography variant="body2" color="info.contrastText">เฉลี่ย/วัน</Typography><Typography variant="h5" color="info.contrastText" fontWeight="bold">{avgPerDay.toLocaleString()}</Typography><Typography variant="caption" color="info.contrastText">{chartData.length} วัน</Typography></Box></Grid>
              </Grid>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 2 }}>
                <Chip label={`สูงสุด: ${maxDay.toLocaleString()} CN`} color="error" variant="outlined" sx={{ fontWeight: 'bold' }}/>
                <Chip label={`ต่ำสุด: ${minDay.toLocaleString()} CN`} color="warning" variant="outlined" sx={{ fontWeight: 'bold' }}/>
                <Chip label={`ช่วงข้อมูล: ${chartData.length} วัน`} color="info" variant="outlined" sx={{ fontWeight: 'bold' }}/>
              </Box>
            </Box>

            {dateFilter && (
              <Alert severity="info" sx={{ mt: 2, borderRadius: 2, '& .MuiAlert-icon': { fontSize: '1.5rem' } }}>
                <Typography variant="body2" fontWeight="medium">ข้อมูล CN ตั้งแต่ {new Date(dateFilter.startDate).toLocaleDateString('th-TH')} ถึง {new Date(dateFilter.endDate).toLocaleDateString('th-TH')}{config.isDevelopment && ' (ข้อมูลตัวอย่างสำหรับการทดสอบ)'}</Typography>
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CnChartsCard;