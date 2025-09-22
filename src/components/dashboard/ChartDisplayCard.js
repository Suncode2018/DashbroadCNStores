import React, { useState, useMemo } from 'react';
// **[MODIFIED]** Cleaned up unused imports
import { Card, CardContent, Box, Typography, Paper, useTheme, Divider, ToggleButton, ToggleButtonGroup, CircularProgress } from '@mui/material';
import { ShowChart as LineChartIcon, BarChart as BarChartIcon, PieChart as PieChartIcon, Assessment as AssessmentIcon, AreaChart as AreaChartIcon } from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import DataMessage from '../common/DataMessage';

// --- The rest of the file remains exactly the same ---
const StatItem = ({ label, value, valueColor = 'text.primary', subLabel }) => ( <Paper elevation={2} sx={{ p: 2, textAlign: 'center', flexGrow: 1, flexBasis: '150px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '110px' }}><Typography variant="h4" fontWeight="bold" sx={{ color: valueColor, lineHeight: 1.2 }}>{value}</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{label}</Typography>{subLabel && ( <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>{subLabel}</Typography> )}</Paper> );
const CustomLegend = ({ legendItems, theme }) => ( <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 3, mt: 2 }}> {legendItems.map((item) => ( <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}> <Box sx={{ width: 14, height: 14, backgroundColor: item.color, borderRadius: '2px' }} /> <Typography variant="body2">{item.name}</Typography> </Box> ))} </Box> );
const CustomChartTooltip = ({ active, payload, unit }) => { if (active && payload && payload.length) { const dataPoint = payload[0].payload; const displayOrder = payload.map(p => p.dataKey); return ( <Paper elevation={3} sx={{ p: 1.5, backgroundColor: 'rgba(255, 255, 255, 0.95)' }}><Typography variant="subtitle2" sx={{ mb: 1 }}>{`วันที่ ${dataPoint.tooltipDate}`}</Typography><Box> {displayOrder.map(key => { const item = payload.find(p => p.dataKey === key); if (!item) return null; const name = item.name.replace(` (${unit})`, ''); const value = item.value.toLocaleString(); const color = item.color; return ( <Typography key={key} variant="body2" sx={{ color: color, display: 'flex', justifyContent: 'space-between' }}><span>{name}:</span><span style={{ fontWeight: 'bold', marginLeft: '16px' }}>{`${value} (${unit})`}</span></Typography> ); })} </Box></Paper> ); } return null; };

const CnChartsCard = ({ status, apiData, errorMessage, onRetry, dateFilter }) => {
    const [chartType, setChartType] = useState('line-count');
    const theme = useTheme();

    const byCountConfig = useMemo(() => {
        const chartData = apiData.map(item => ({ date: new Date(item.DeliveryDate).toLocaleString('th-TH', { day: 'numeric', month: 'short' }), tooltipDate: new Date(item.DeliveryDate).toLocaleString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }), 'CN ทั้งหมด (ใบ)': item.countCnNoALL, 'CN ขาดส่ง (ใบ)': item.countCnNo43ALL, 'CN เสื่อมคุณภาพ (ใบ)': item.countCnNo42ALL, }));
        const total43 = apiData.reduce((sum, item) => sum + item.countCnNo43ALL, 0);
        const total42 = apiData.reduce((sum, item) => sum + item.countCnNo42ALL, 0);
        return { chartData, summaryData: { total43, total42, totalAll: total43 + total42 }, config: { unit: 'ใบ', dataKeys: { total: 'CN ทั้งหมด (ใบ)', type43: 'CN ขาดส่ง (ใบ)', type42: 'CN เสื่อมคุณภาพ (ใบ)' }, colors: { type43: '#f44336', type42: '#ff9800' }, } };
    }, [apiData]);

    const byPackConfig = useMemo(() => {
        const chartData = apiData.map(item => ({ date: new Date(item.DeliveryDate).toLocaleString('th-TH', { day: 'numeric', month: 'short' }), tooltipDate: new Date(item.DeliveryDate).toLocaleString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }), 'ทั้งหมด (แพ็ค)': item.sumQtyPackALL, 'ขาดส่ง (แพ็ค)': item.sumQtyPack43ALL, 'เสื่อมคุณภาพ (แพ็ค)': item.sumQtyPack42ALL, }));
        const total43 = apiData.reduce((sum, item) => sum + item.sumQtyPack43ALL, 0);
        const total42 = apiData.reduce((sum, item) => sum + item.sumQtyPack42ALL, 0);
        return { chartData, summaryData: { total43, total42, totalAll: total43 + total42 }, config: { unit: 'แพ็ค', dataKeys: { total: 'ทั้งหมด (แพ็ค)', type43: 'ขาดส่ง (แพ็ค)', type42: 'เสื่อมคุณภาพ (แพ็ค)' }, colors: { type43: '#f44336', type42: '#ff9800' }, } };
    }, [apiData]);

    const currentView = chartType.endsWith('-pack') ? 'pack' : 'count';
    const currentConfig = currentView === 'pack' ? byPackConfig : byCountConfig;
    
    const { chartData, summaryData, config } = currentConfig;
    const { unit, dataKeys, colors } = config;

    // **[RESTORED & IMPROVED]** The missing summaryStats calculation is back
    const summaryStats = useMemo(() => {
        if (!apiData || apiData.length === 0) {
          return { average: 0, maxDay: { value: 0, date: '-' }, minDay: { value: 0, date: '-' } };
        }
        const formatDate = (dateString) => new Date(dateString).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
        
        // Dynamically select the correct key based on the current view
        const keyForTotal = currentView === 'pack' ? 'sumQtyPackALL' : 'countCnNoALL';
        
        const maxDayObject = apiData.reduce((max, day) => day[keyForTotal] > max[keyForTotal] ? day : max, apiData[0]);
        const minDayObject = apiData.reduce((min, day) => day[keyForTotal] < min[keyForTotal] ? day : min, apiData[0]);

        return {
          average: Math.round(summaryData.totalAll / apiData.length),
          maxDay: { value: maxDayObject[keyForTotal], date: formatDate(maxDayObject.DeliveryDate) },
          minDay: { value: minDayObject[keyForTotal], date: formatDate(minDayObject.DeliveryDate) }
        };
    }, [apiData, summaryData.totalAll, currentView]);

    const legendItems = [ { name: dataKeys.total, color: theme.palette.primary.main }, { name: dataKeys.type43, color: colors.type43 }, { name: dataKeys.type42, color: colors.type42 }, ];
    const pieData = [ { name: dataKeys.type43, value: summaryData.total43 }, { name: dataKeys.type42, value: summaryData.total42 }, ];
    const PIE_COLORS = [colors.type43, colors.type42];
    const yAxisFormatter = (value) => value.toLocaleString();
    const CustomPieTooltip = ({ active, payload }) => { if (active && payload && payload.length) { const name = payload[0].name.replace(` (${unit})`, ''); const value = payload[0].value; const percent = summaryData.totalAll > 0 ? ((value / summaryData.totalAll) * 100).toFixed(2) : 0; return ( <Paper elevation={3} sx={{ p: 1.5, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}><Typography variant="body2" fontWeight="bold">{`${name}: ${value.toLocaleString()} (${unit})`}</Typography><Typography variant="caption" color="text.secondary">{`คิดเป็น ${percent}%`}</Typography></Paper> ); } return null; };
    const dateRangeString = useMemo(() => { if (dateFilter && dateFilter.startDate && dateFilter.endDate) { const options = { day: '2-digit', month: '2-digit', year: 'numeric' }; const startDate = new Date(dateFilter.startDate).toLocaleDateString('th-TH', options); const endDate = new Date(dateFilter.endDate).toLocaleDateString('th-TH', options); return `วันที่ ${startDate} ถึง ${endDate}`; } return 'กรุณาเลือกช่วงวันที่'; }, [dateFilter]);
    
    const handleChartTypeChange = (event, newType) => { if (newType !== null) { setChartType(newType); } };
    
    const renderContent = () => {
        if (status === 'error') { return <DataMessage status="error" message={errorMessage} onRetry={onRetry} />; }
        if (status === 'empty' || status === 'initial') { return <DataMessage status="info" message="กรุณาเลือกช่วงวันที่เพื่อแสดงข้อมูล" />; }
        if (status === 'success') {
            const ChartWrapper = ({ children }) => ( <Box sx={{ height: 400, width: '100%', mt: 2 }}><ResponsiveContainer>{children}</ResponsiveContainer></Box> );
            const chartComponent = chartType.split('-')[0];
            switch (chartComponent) {
                case 'line': return ( <ChartWrapper><LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 25 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis tickFormatter={yAxisFormatter} /><Tooltip content={<CustomChartTooltip unit={unit} />} /><Legend content={<CustomLegend theme={theme} colors={colors} legendItems={legendItems}/>} /><Line type="monotone" dataKey={dataKeys.total} stroke={theme.palette.primary.main} strokeWidth={2} activeDot={{ r: 8 }} /><Line type="monotone" dataKey={dataKeys.type43} stroke={colors.type43} /><Line type="monotone" dataKey={dataKeys.type42} stroke={colors.type42} /></LineChart></ChartWrapper> );
                case 'area': return ( <ChartWrapper><AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 25 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis tickFormatter={yAxisFormatter} /><Tooltip content={<CustomChartTooltip unit={unit} />} /><Legend content={<CustomLegend chartType="area" theme={theme} colors={colors} legendItems={legendItems}/>} /><Area type="monotone" dataKey={dataKeys.total} stroke={theme.palette.primary.dark} fill={theme.palette.primary.light} fillOpacity={0.3} /><Area type="monotone" dataKey={dataKeys.type43} stackId="1" stroke={colors.type43} fill={colors.type43} fillOpacity={0.6} /><Area type="monotone" dataKey={dataKeys.type42} stackId="1" stroke={colors.type42} fill={colors.type42} fillOpacity={0.6} /></AreaChart></ChartWrapper> );
                case 'bar': return ( <ChartWrapper><BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 25 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis tickFormatter={yAxisFormatter} /><Tooltip content={<CustomChartTooltip unit={unit} />} /><Legend content={<CustomLegend chartType="bar" theme={theme} colors={colors} legendItems={legendItems}/>} /><Bar dataKey={dataKeys.total} fill={theme.palette.primary.main} /><Bar dataKey={dataKeys.type43} fill={colors.type43} /><Bar dataKey={dataKeys.type42} fill={colors.type42} /></BarChart></ChartWrapper> );
                case 'pie': return ( <ChartWrapper><PieChart margin={{ top: 5, right: 20, left: -10, bottom: 25 }}><Pie data={pieData} cx="50%" cy="50%" labelLine={false} outerRadius={120} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name.replace(` (${unit})`, '')} ${(percent * 100).toFixed(0)}%`} >{pieData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} /> ))}</Pie><Tooltip content={<CustomPieTooltip />} /><Legend content={<CustomLegend chartType="pie" theme={theme} colors={colors} legendItems={legendItems}/>} /></PieChart></ChartWrapper> );
                default: return null;
            }
        }
        return null;
    };
    
    return (
        <Card sx={{ mb: 4, boxShadow: 3 }}>
            <CardContent sx={{ pb: '32px !important' }}>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <AssessmentIcon color="primary" sx={{ fontSize: '2rem' }}/>
                        <Typography component="div" variant="h5" fontWeight="bold" color="primary">ภาพรวมข้อมูล CN</Typography>
                    </Box>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 0.5 }}>{dateRangeString}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <ToggleButtonGroup value={chartType} exclusive onChange={handleChartTypeChange} size="small" disabled={status !== 'success'}>
                        <ToggleButton value="line-count" aria-label="Line Chart by Count">เส้น-(ใบ)</ToggleButton>
                        <ToggleButton value="area-count" aria-label="Area Chart by Count">พื้นที่-(ใบ)</ToggleButton>
                        <ToggleButton value="bar-count" aria-label="Bar Chart by Count">แท่ง-(ใบ)</ToggleButton>
                        <ToggleButton value="pie-count" aria-label="Pie Chart by Count">วงกลม-(ใบ)</ToggleButton>
                        <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1, borderRightWidth: 2 }} />
                        <ToggleButton value="line-pack" aria-label="Line Chart by Pack">เส้น-(แพ็ค)</ToggleButton>
                        <ToggleButton value="area-pack" aria-label="Area Chart by Pack">พื้นที่-(แพ็ค)</ToggleButton>
                        <ToggleButton value="bar-pack" aria-label="Bar Chart by Pack">แท่ง-(แพ็ค)</ToggleButton>
                        <ToggleButton value="pie-pack" aria-label="Pie Chart by Pack">วงกลม-(แพ็ค)</ToggleButton>
                    </ToggleButtonGroup>
                </Box>
                <Divider sx={{ mb: 1 }}/>
                {renderContent()}
                
                {status === 'success' && (
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">สรุปข้อมูล (ตามช่วงวันที่เลือก)</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
                            <StatItem label={`ทั้งหมด (${unit})`} value={summaryData.totalAll.toLocaleString()} valueColor={theme.palette.primary.main} />
                            <StatItem label={`ขาดส่ง (${unit})`} value={summaryData.total43.toLocaleString()} valueColor={colors.type43} />
                            <StatItem label={`เสื่อมคุณภาพ (${unit})`} value={summaryData.total42.toLocaleString()} valueColor={colors.type42} />
                            <StatItem label={`เฉลี่ยต่อวัน (${unit})`} value={summaryStats.average.toLocaleString()} valueColor={theme.palette.info.dark} />
                            <StatItem label={`สูงสุด (${unit})`} value={summaryStats.maxDay.value.toLocaleString()} subLabel={`วันที่ ${summaryStats.maxDay.date}`} valueColor={theme.palette.warning.dark} />
                            <StatItem label={`ต่ำสุด (${unit})`} value={summaryStats.minDay.value.toLocaleString()} subLabel={`วันที่ ${summaryStats.minDay.date}`} valueColor={theme.palette.success.dark} />
                            <StatItem label="จำนวนวัน" value={apiData.length.toLocaleString()} valueColor="text.secondary" />
                        </Box>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};
export default CnChartsCard;