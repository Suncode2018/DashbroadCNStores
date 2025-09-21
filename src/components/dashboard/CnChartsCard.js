import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, Box, Typography, ButtonGroup, Button, CircularProgress, Paper, useTheme, Divider } from '@mui/material';
import { ShowChart as LineChartIcon, AreaChart as AreaChartIcon, BarChart as BarChartIcon, PieChart as PieChartIcon, Assessment as AssessmentIcon } from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ReferenceLine, Label } from 'recharts';
import apiService from '../../api/apiService';
import DataMessage from '../common/DataMessage';

const StatItem = ({ label, value, valueColor = 'text.primary', subLabel }) => ( <Paper elevation={2} sx={{ p: 2, textAlign: 'center', flexGrow: 1, flexBasis: '150px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '110px' }}><Typography variant="h4" fontWeight="bold" sx={{ color: valueColor, lineHeight: 1.2 }}>{value}</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{label}</Typography>{subLabel && ( <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>{subLabel}</Typography> )}</Paper> );

const CustomLegend = ({ chartType, theme, colors }) => {
  const { COLOR_MISSING, COLOR_DEGRADED, COLOR_TARGET } = colors;
  const masterLegendItems = [ { name: 'CN ทั้งหมด (ใบ)', color: theme.palette.primary.main }, { name: 'CN ขาดส่ง (ใบ)', color: COLOR_MISSING }, { name: 'CN เสื่อมคุณภาพ (ใบ)', color: COLOR_DEGRADED }, { name: 'เป้าหมาย (ใบ)', color: COLOR_TARGET }, ];
  let itemsToRender;
  if (chartType === 'pie') { itemsToRender = masterLegendItems.slice(1, 3); } 
  else if (chartType === 'line') { itemsToRender = masterLegendItems; } 
  else { itemsToRender = masterLegendItems.slice(0, 3); }
  return ( <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 3, mt: 2 }}> {itemsToRender.map((item) => ( <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}> <Box sx={{ width: 14, height: 14, backgroundColor: item.color, borderRadius: '2px' }} /> <Typography variant="body2">{item.name}</Typography> </Box> ))} </Box> );
};

const CustomChartTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    const displayOrder = ['CN ทั้งหมด (ใบ)', 'CN ขาดส่ง (ใบ)', 'CN เสื่อมคุณภาพ (ใบ)'];
    return (
      <Paper elevation={3} sx={{ p: 1.5, backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>{`วันที่ ${dataPoint.tooltipDate}`}</Typography>
        <Box>
          {displayOrder.map(key => {
            const item = payload.find(p => p.dataKey === key);
            if (!item) return null;
            const name = item.name.replace(' (ใบ)', '');
            const value = item.value.toLocaleString();
            const color = item.color;
            return (
              <Typography key={key} variant="body2" sx={{ color: color, display: 'flex', justifyContent: 'space-between' }}>
                <span>{name}:</span>
                <span style={{ fontWeight: 'bold', marginLeft: '16px' }}>{value} (ใบ)</span>
              </Typography>
            );
          })}
        </Box>
      </Paper>
    );
  }
  return null;
};

const CnChartsCard = ({ dateFilter }) => {
  const [cnData, setCnData] = useState([]);
  const [chartType, setChartType] = useState('line');
  const [status, setStatus] = useState('initial');
  const [errorMessage, setErrorMessage] = useState('');
  const theme = useTheme();

  const TARGET_LINE_VALUE = parseInt(process.env.REACT_APP_CN_TARGET, 10) || 650;
  const COLOR_MISSING = '#f44336';
  const COLOR_DEGRADED = '#ff9800';
  // **[MODIFIED]** Changed the target color to a distinct purple
  const COLOR_TARGET = '#6a1b9a'; // A deep, standout purple
  
  const fetchCnData = useCallback(async (startDate, endDate) => {
    if (!startDate || !endDate) { setStatus('initial'); setCnData([]); return; }
    setStatus('loading');
    try {
      const result = await apiService.getCnReportByDate(startDate, endDate);
      if (result.success) {
        if (Array.isArray(result.data?.data) && result.data.data.length > 0) {
          setCnData(result.data.data); setStatus('success');
        } else {
          setCnData([]); setStatus('empty');
        }
      } else { throw new Error(result.error); }
    } catch (err) {
      setCnData([]); setStatus('error'); setErrorMessage(err.message || 'ไม่สามารถดึงข้อมูลได้');
    }
  }, []);

  useEffect(() => {
    fetchCnData(dateFilter?.startDate, dateFilter?.endDate);
  }, [dateFilter, fetchCnData]);

  const handleRetry = () => {
    fetchCnData(dateFilter?.startDate, dateFilter?.endDate);
  };
  
  const formattedData = cnData.map(item => ({ date: new Date(item.DeliveryDate).toLocaleString('th-TH', { day: 'numeric', month: 'short' }), tooltipDate: new Date(item.DeliveryDate).toLocaleString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }), 'CN ทั้งหมด (ใบ)': item.countCnNoALL, 'CN ขาดส่ง (ใบ)': item.countCnNo43ALL, 'CN เสื่อมคุณภาพ (ใบ)': item.countCnNo42ALL, }));
  const totalMissing = cnData.reduce((sum, item) => sum + item.countCnNo43ALL, 0);
  const totalDegraded = cnData.reduce((sum, item) => sum + item.countCnNo42ALL, 0);
  const totalAll = totalMissing + totalDegraded;
  
  const summaryStats = useMemo(() => {
    if (!cnData || cnData.length === 0) {
      return { average: 0, maxDay: { value: 0, date: '-' }, minDay: { value: 0, date: '-' } };
    }
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const maxDayObject = cnData.reduce((max, day) => day.countCnNoALL > max.countCnNoALL ? day : max, cnData[0]);
    const minDayObject = cnData.reduce((min, day) => day.countCnNoALL < min.countCnNoALL ? day : min, cnData[0]);
    return { average: Math.round(totalAll / cnData.length), maxDay: { value: maxDayObject.countCnNoALL, date: formatDate(maxDayObject.DeliveryDate) }, minDay: { value: minDayObject.countCnNoALL, date: formatDate(minDayObject.DeliveryDate) } };
  }, [cnData, totalAll]);

  const pieData = [ { name: 'CN ขาดส่ง (ใบ)', value: totalMissing }, { name: 'CN เสื่อมคุณภาพ (ใบ)', value: totalDegraded }, ];
  const PIE_COLORS = [COLOR_MISSING, COLOR_DEGRADED];
  
  const yAxisFormatter = (value) => value.toLocaleString();
  const CustomPieTooltip = ({ active, payload }) => { if (active && payload && payload.length) { const name = payload[0].name.replace(' (ใบ)', ''); const value = payload[0].value; const percent = totalAll > 0 ? ((value / totalAll) * 100).toFixed(2) : 0; return ( <Paper elevation={3} sx={{ p: 1.5, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}><Typography variant="body2" fontWeight="bold">{`${name}: ${value.toLocaleString()} (ใบ)`}</Typography><Typography variant="caption" color="text.secondary">{`คิดเป็น ${percent}%`}</Typography></Paper> ); } return null; };
  const generateDateRangeString = () => { if (dateFilter && dateFilter.startDate && dateFilter.endDate) { const options = { day: '2-digit', month: '2-digit', year: 'numeric' }; const startDate = new Date(dateFilter.startDate).toLocaleDateString('th-TH', options); const endDate = new Date(dateFilter.endDate).toLocaleDateString('th-TH', options); return `วันที่ ${startDate} ถึง ${endDate}`; } return 'กรุณาเลือกช่วงวันที่'; };
  
  const renderContent = () => {
    if (status === 'loading') { return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}><CircularProgress sx={{ mr: 2 }} /><Typography>กำลังโหลดข้อมูลกราฟ...</Typography></Box>; }
    if (status === 'error') { return <DataMessage status="error" message={errorMessage} onRetry={handleRetry} />; }
    if (status === 'empty' || status === 'initial') { return <DataMessage status="info" message="กรุณาเลือกช่วงวันที่เพื่อแสดงข้อมูล" />; }
    if (status === 'success') {
      const ChartWrapper = ({ children }) => ( <Box sx={{ height: 400, width: '100%', mt: 2 }}><ResponsiveContainer>{children}</ResponsiveContainer></Box> );
      switch (chartType) {
        case 'line': return ( <ChartWrapper><LineChart data={formattedData} margin={{ top: 15, right: 20, left: -10, bottom: 25 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis tickFormatter={yAxisFormatter} /><Tooltip content={<CustomChartTooltip />} /><Legend content={<CustomLegend chartType="line" theme={theme} colors={{COLOR_MISSING, COLOR_DEGRADED, COLOR_TARGET}} />} />
            {/* **[MODIFIED]** Added strokeWidth to make the line thicker */}
            <ReferenceLine y={TARGET_LINE_VALUE} stroke={COLOR_TARGET} strokeWidth={2} strokeDasharray="3 3">
              <Label 
                value={`เป้าหมาย: ${TARGET_LINE_VALUE}`} 
                position="insideTopRight" 
                fill={COLOR_TARGET} 
                fontSize={12}
                fontWeight="bold"
              />
            </ReferenceLine>
            <Line type="monotone" dataKey="CN ทั้งหมด (ใบ)" stroke={theme.palette.primary.main} strokeWidth={2} activeDot={{ r: 8 }} /><Line type="monotone" dataKey="CN ขาดส่ง (ใบ)" stroke={COLOR_MISSING} /><Line type="monotone" dataKey="CN เสื่อมคุณภาพ (ใบ)" stroke={COLOR_DEGRADED} /></LineChart></ChartWrapper> );
        case 'area': return ( <ChartWrapper><AreaChart data={formattedData} margin={{ top: 5, right: 20, left: -10, bottom: 25 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis tickFormatter={yAxisFormatter} /><Tooltip content={<CustomChartTooltip />} /><Legend content={<CustomLegend chartType="area" theme={theme} colors={{COLOR_MISSING, COLOR_DEGRADED, COLOR_TARGET}} />} /><Area type="monotone" dataKey="CN ทั้งหมด (ใบ)" stroke={theme.palette.primary.dark} fill={theme.palette.primary.light} fillOpacity={0.3} /><Area type="monotone" dataKey="CN ขาดส่ง (ใบ)" stackId="1" stroke={COLOR_MISSING} fill={COLOR_MISSING} fillOpacity={0.6} /><Area type="monotone" dataKey="CN เสื่อมคุณภาพ (ใบ)" stackId="1" stroke={COLOR_DEGRADED} fill={COLOR_DEGRADED} fillOpacity={0.6} /></AreaChart></ChartWrapper> );
        case 'bar': return ( <ChartWrapper><BarChart data={formattedData} margin={{ top: 5, right: 20, left: -10, bottom: 25 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis tickFormatter={yAxisFormatter} /><Tooltip content={<CustomChartTooltip />} /><Legend content={<CustomLegend chartType="bar" theme={theme} colors={{COLOR_MISSING, COLOR_DEGRADED, COLOR_TARGET}} />} /><Bar dataKey="CN ทั้งหมด (ใบ)" fill={theme.palette.primary.main} /><Bar dataKey="CN ขาดส่ง (ใบ)" fill={COLOR_MISSING} /><Bar dataKey="CN เสื่อมคุณภาพ (ใบ)" fill={COLOR_DEGRADED} /></BarChart></ChartWrapper> );
        case 'pie': return ( <ChartWrapper><PieChart margin={{ top: 5, right: 20, left: -10, bottom: 25 }}><Pie data={pieData} cx="50%" cy="50%" labelLine={false} outerRadius={120} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name.replace(' (ใบ)', '')} ${(percent * 100).toFixed(0)}%`} >{pieData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} /> ))}</Pie><Tooltip content={<CustomPieTooltip />} /><Legend content={<CustomLegend chartType="pie" theme={theme} colors={{COLOR_MISSING, COLOR_DEGRADED, COLOR_TARGET}} />} /></PieChart></ChartWrapper> );
        default: return null;
      }
    }
    return null;
  };

  return (
    <Card sx={{ mb: 4, boxShadow: 3 }}>
      <CardContent sx={{ pb: '32px !important' }}>
        <Box sx={{ textAlign: 'center', mb: 2 }}><Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}><AssessmentIcon color="primary" sx={{ fontSize: '2rem' }}/><Typography component="div" variant="h5" fontWeight="bold" color="primary">ภาพรวมข้อมูล CN CDC-บางบัวทอง</Typography></Box><Typography variant="subtitle1" color="text.secondary" sx={{ mt: 0.5 }}>{generateDateRangeString()}</Typography></Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <ButtonGroup variant="outlined" size="small" disabled={status !== 'success'}>
                <Button variant={chartType === 'line' ? 'contained' : 'outlined'} startIcon={<LineChartIcon />} onClick={() => setChartType('line')}>เส้น-(ใบ)</Button>
                <Button variant={chartType === 'area' ? 'contained' : 'outlined'} startIcon={<AreaChartIcon />} onClick={() => setChartType('area')}>พื้นที่-(ใบ)</Button>
                <Button variant={chartType === 'bar' ? 'contained' : 'outlined'} startIcon={<BarChartIcon />} onClick={() => setChartType('bar')}>แท่ง-(ใบ)</Button>
                <Button variant={chartType === 'pie' ? 'contained' : 'outlined'} startIcon={<PieChartIcon />} onClick={() => setChartType('pie')}>วงกลม-(ใบ)</Button>
            </ButtonGroup>
        </Box>
        <Divider sx={{ mb: 1 }}/>
        {renderContent()}
        {status === 'success' && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">สรุปข้อมูล (ตามช่วงวันที่เลือก)</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
              <StatItem label="CN ทั้งหมด (ใบ)" value={totalAll.toLocaleString()} valueColor={theme.palette.primary.main} />
              <StatItem label="CN ขาดส่ง (ใบ)" value={totalMissing.toLocaleString()} valueColor={COLOR_MISSING} />
              <StatItem label="CN เสื่อมคุณภาพ (ใบ)" value={totalDegraded.toLocaleString()} valueColor={COLOR_DEGRADED} />
              <StatItem label="CN เฉลี่ยต่อวัน (ใบ)" value={summaryStats.average.toLocaleString()} valueColor={theme.palette.info.dark} />
              <StatItem label="CN สูงสุด (ใบ)" value={summaryStats.maxDay.value.toLocaleString()} subLabel={`วันที่ ${summaryStats.maxDay.date}`} valueColor={theme.palette.warning.dark} />
              <StatItem label="CN ต่ำสุด (ใบ)" value={summaryStats.minDay.value.toLocaleString()} subLabel={`วันที่ ${summaryStats.minDay.date}`} valueColor={theme.palette.success.dark} />
              <StatItem label="จำนวนวัน" value={cnData.length.toLocaleString()} valueColor="text.secondary" />
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default CnChartsCard;