import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, Box, Typography, Paper, useTheme, Divider, ToggleButton, ToggleButtonGroup, Switch, FormControlLabel } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LabelList } from 'recharts';
import { StatItem } from './CnChartsCard';
import DataMessage from '../common/DataMessage';

// --- Component ย่อย ---

const CustomLegend = ({ payload }) => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 3, mt: 2 }}>
        {payload.map((entry, index) => (
            <Box key={`item-${index}`} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 14, height: 14, backgroundColor: entry.color, borderRadius: '2px' }} />
                <Typography variant="body2">{entry.value}</Typography>
            </Box>
        ))}
    </Box>
);

const CustomTooltip = ({ active, payload, unitText, chartType }) => {
    if (active && payload && payload.length) {
        const dataPoint = payload[0].payload;
        const items = chartType === 'line' ? payload : [...payload].reverse();
        return (
            <Paper elevation={3} sx={{ p: 1.5, backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>{`วันที่ ${dataPoint.date}`}</Typography>
                {items.map(item => (
                    <Typography key={item.dataKey} variant="body2" sx={{ color: item.color, display: 'flex', justifyContent: 'space-between' }}>
                        <span>{item.name}:</span>
                        <span style={{ fontWeight: 'bold', marginLeft: '16px' }}>{`${item.value.toLocaleString()} (${unitText})`}</span>
                    </Typography>
                ))}
            </Paper>
        );
    }
    return null;
};

const CustomPieTooltip = ({ active, payload, total }) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        const name = data.name;
        const value = data.value;
        const percent = total > 0 ? ((value / total) * 100).toFixed(2) : 0;
        return (
            <Paper elevation={3} sx={{ p: 1.5, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
                <Typography variant="body2" fontWeight="bold">{`${name}: ${value.toLocaleString()}`}</Typography>
                <Typography variant="caption" color="text.secondary">{`คิดเป็น ${percent}%`}</Typography>
            </Paper>
        );
    }
    return null;
};

const ChartDataLabel = (props) => {
    const { x, y, width, value, stroke } = props;
    if (value > 0) {
        const color = stroke || '#555';
        return (
            <text x={x + width / 2} y={y} dy={-6} fill={color} fontSize={11} textAnchor="middle">
                {value.toLocaleString()}
            </text>
        );
    }
    return null;
};

const CnDefectChartCard = ({ status, title, apiData, icon, color = 'error', defectType = '43' }) => {
    const [chartType, setChartType] = useState('line-count');
    const [showLabels, setShowLabels] = useState(false);

    const handleChartTypeChange = useCallback((event, newType) => {
        if (newType !== null) {
            setChartType(newType);
        }
    }, []);

    const handleShowLabelsChange = (event) => {
        setShowLabels(event.target.checked);
    };

    const theme = useTheme();
    
    const unitText = useMemo(() => {
        const unit = chartType.split('-')[1] || 'count';
        const unitTextMap = { count: 'ใบ', pack: 'แพ็ค', piece: 'ชิ้น', baht: 'บาท' };
        return unitTextMap[unit];
    }, [chartType]);

    const formatValue = (value) => (unitText === 'บาท' ? value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : (typeof value === 'number' ? value.toLocaleString() : '0'));

    const { chartData, summaryData, summaryStats } = useMemo(() => {
        const unit = chartType.split('-')[1] || 'count';
        
        const dataKeys = {
            '43': {
                count: { total: 'countCnNo43ALL', approved: 'countCnNo43App', rejected: 'countCnNo43Rej', waiting: 'countCnNo43Wait' },
                pack:  { total: 'sumQtyPack43AppRejALL', approved: 'sumQtyPack43App', rejected: 'sumQtyPack43Rej', waiting: 'sumQtyPack43Wait' },
                piece: { total: 'sumQtyPCS43AppRejALL', approved: 'sumQtyPCS43App', rejected: 'sumQtyPCS43Rej', waiting: 'sumQtyPCS43Wait' },
                baht:  { total: 'sumBaht43AppRejALL', approved: 'sumBaht43App', rejected: 'sumBaht43Rej', waiting: 'sumBaht43Wait' },
            },
            '42': {
                count: { total: 'countCnNo42ALL', approved: 'countCnNo42App', rejected: 'countCnNo42Rej', waiting: 'countCnNo42Wait' },
                pack:  { total: 'sumQtyPack42AppRejALL', approved: 'sumQtyPack42App', rejected: 'sumQtyPack42Rej', waiting: 'sumQtyPack42Wait' },
                piece: { total: 'sumQtyPCS42AppRejALL', approved: 'sumQtyPCS42App', rejected: 'sumQtyPCS42Rej', waiting: 'sumQtyPCS42Wait' },
                baht:  { total: 'sumBaht42AppRejALL', approved: 'sumBaht42App', rejected: 'sumBaht42Rej', waiting: 'sumBaht42Wait' },
            }
        };

        const currentKeys = dataKeys[defectType] ? dataKeys[defectType][unit] : dataKeys['43'][unit];

        const transformedData = apiData.map(item => ({
            date: new Date(item.DeliveryDate).toLocaleString('th-TH', { day: 'numeric', month: 'short' }),
            rawDate: item.DeliveryDate,
            total: item[currentKeys.total] || 0,
            approved: item[currentKeys.approved] || 0,
            rejected: item[currentKeys.rejected] || 0,
            waiting: item[currentKeys.waiting] || 0,
        }));
        
        const totalSummary = transformedData.reduce((acc, item) => {
            acc.total += item.total;
            acc.approved += item.approved;
            acc.rejected += item.rejected;
            acc.waiting += item.waiting;
            return acc;
        }, { total: 0, approved: 0, rejected: 0, waiting: 0 });
        
        let stats = { average: 0, maxDay: { value: 0, date: '-' }, minDay: { value: 0, date: '-' } };
        if (transformedData.length > 0) {
            const formatDate = (dateString) => new Date(dateString).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const maxDayObject = transformedData.reduce((max, day) => day.total > max.total ? day : max, transformedData[0]);
            const minDayObject = transformedData.reduce((min, day) => day.total < min.total ? day : min, transformedData[0]);
            stats = {
                average: Math.round(totalSummary.total / transformedData.length),
                maxDay: { value: maxDayObject.total, date: formatDate(maxDayObject.rawDate) },
                minDay: { value: minDayObject.total, date: formatDate(minDayObject.rawDate) }
            };
        }

        return { chartData: transformedData, summaryData: totalSummary, summaryStats: stats };
    }, [apiData, chartType, defectType]);
    
    const chartRenderConfig = {
        total:    { name: `ทั้งหมด`, color: theme.palette[color].main },
        approved: { name: `อนุมัติ`, color: theme.palette.success.main },
        rejected: { name: `ไม่อนุมัติ`, color: theme.palette.error.main },
        waiting:  { name: `ค้างพิจารณา`, color: theme.palette.info.main },
    };
    
    const pieTotal = summaryData.approved + summaryData.rejected + summaryData.waiting;
    const pieData = [
        { name: `${chartRenderConfig.approved.name} (${unitText})`, value: summaryData.approved, color: chartRenderConfig.approved.color },
        { name: `${chartRenderConfig.rejected.name} (${unitText})`, value: summaryData.rejected, color: chartRenderConfig.rejected.color },
        { name: `${chartRenderConfig.waiting.name} (${unitText})`, value: summaryData.waiting, color: chartRenderConfig.waiting.color },
    ].filter(item => item.value > 0);

    const renderContent = () => {
        if (status !== 'success') return <DataMessage status={status} />;
        
        const chartComponent = chartType.split('-')[0];
        const isDataEmpty = chartComponent === 'pie' ? pieTotal === 0 : chartData.every(d => d.total === 0 && d.approved === 0 && d.rejected === 0);
        if (isDataEmpty) return <DataMessage status="info" message={`ไม่มีข้อมูลสำหรับแสดงผล (${unitText})`} />;

        const ChartWrapper = ({ children }) => ( <Box sx={{ height: 400, width: '100%', mt: 2 }}><ResponsiveContainer>{children}</ResponsiveContainer></Box> );

        switch (chartComponent) {
            case 'line': return ( 
                <ChartWrapper>
                    <LineChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis tickFormatter={(val) => val.toLocaleString()} />
                        <Tooltip content={<CustomTooltip unitText={unitText} chartType="line" />} />
                        <Legend payload={Object.values(chartRenderConfig).map(c => ({ value: `${c.name} (${unitText})`, type: 'line', color: c.color }))} />
                        <Line type="monotone" dataKey="total" name={chartRenderConfig.total.name} stroke={chartRenderConfig.total.color} strokeWidth={2} activeDot={{ r: 8 }} >
                            {showLabels && <LabelList dataKey="total" content={<ChartDataLabel stroke={chartRenderConfig.total.color} />} />}
                        </Line>
                        <Line type="monotone" dataKey="approved" name={chartRenderConfig.approved.name} stroke={chartRenderConfig.approved.color} >
                            {showLabels && <LabelList dataKey="approved" content={<ChartDataLabel stroke={chartRenderConfig.approved.color} />} />}
                        </Line>
                        <Line type="monotone" dataKey="rejected" name={chartRenderConfig.rejected.name} stroke={chartRenderConfig.rejected.color} >
                            {showLabels && <LabelList dataKey="rejected" content={<ChartDataLabel stroke={chartRenderConfig.rejected.color} />} />}
                        </Line>
                        <Line type="monotone" dataKey="waiting" name={chartRenderConfig.waiting.name} stroke={chartRenderConfig.waiting.color} >
                            {showLabels && <LabelList dataKey="waiting" content={<ChartDataLabel stroke={chartRenderConfig.waiting.color} />} />}
                        </Line>
                    </LineChart>
                </ChartWrapper> 
            );
            case 'area': return ( 
                <ChartWrapper>
                    <AreaChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis tickFormatter={(val) => val.toLocaleString()} />
                        <Tooltip content={<CustomTooltip unitText={unitText} chartType="area" />} />
                        <Legend payload={Object.values(chartRenderConfig).slice(1).map(c => ({ value: `${c.name} (${unitText})`, type: 'line', color: c.color }))} />
                        <Area type="monotone" dataKey="approved" name={chartRenderConfig.approved.name} stackId="1" stroke={chartRenderConfig.approved.color} fill={chartRenderConfig.approved.color} >
                            {showLabels && <LabelList dataKey="approved" position="top" formatter={(val) => val > 0 ? val.toLocaleString() : ''} />}
                        </Area>
                        <Area type="monotone" dataKey="rejected" name={chartRenderConfig.rejected.name} stackId="1" stroke={chartRenderConfig.rejected.color} fill={chartRenderConfig.rejected.color} >
                            {showLabels && <LabelList dataKey="rejected" position="top" formatter={(val) => val > 0 ? val.toLocaleString() : ''} />}
                        </Area>
                        <Area type="monotone" dataKey="waiting" name={chartRenderConfig.waiting.name} stackId="1" stroke={chartRenderConfig.waiting.color} fill={chartRenderConfig.waiting.color} >
                            {showLabels && <LabelList dataKey="waiting" position="top" formatter={(val) => val > 0 ? val.toLocaleString() : ''} />}
                        </Area>
                    </AreaChart>
                </ChartWrapper> 
            );
            case 'bar': return ( 
                <ChartWrapper>
                    <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis tickFormatter={(val) => val.toLocaleString()} />
                        <Tooltip content={<CustomTooltip unitText={unitText} chartType="bar" />} />
                        <Legend payload={Object.values(chartRenderConfig).slice(1).map(c => ({ value: `${c.name} (${unitText})`, type: 'square', color: c.color }))} />
                        <Bar dataKey="approved" name={chartRenderConfig.approved.name} stackId="a" fill={chartRenderConfig.approved.color} >
                            {showLabels && <LabelList dataKey="approved" content={<ChartDataLabel />} />}
                        </Bar>
                        <Bar dataKey="rejected" name={chartRenderConfig.rejected.name} stackId="a" fill={chartRenderConfig.rejected.color} >
                            {showLabels && <LabelList dataKey="rejected" content={<ChartDataLabel />} />}
                        </Bar>
                        <Bar dataKey="waiting" name={chartRenderConfig.waiting.name} stackId="a" fill={chartRenderConfig.waiting.color} >
                            {showLabels && <LabelList dataKey="waiting" content={<ChartDataLabel />} />}
                        </Bar>
                    </BarChart>
                </ChartWrapper> 
            );
            case 'pie':
                return (
                    <Box sx={{ height: 250, width: '100%', mt: 2 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {pieData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={entry.color} /> ))}
                                </Pie>
                                <Tooltip content={<CustomPieTooltip total={pieTotal} />} />
                                <Legend content={<CustomLegend payload={pieData.map(p => ({ value: p.name, type: 'square', color: p.color }))} />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </Box>
                );
            default:
                return <DataMessage status="info" message={`กราฟประเภท '${chartComponent}' ยังไม่รองรับ`} />;
        }
    };

    return (
        <Card sx={{ mb: 3, boxShadow: 3, borderColor: `${color}.main`, borderWidth: 1, borderStyle: 'solid' }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {icon}
                        <Typography variant="h6" fontWeight="bold" component="div">{title}</Typography>
                    </Box>
                    <FormControlLabel
                        control={<Switch checked={showLabels} onChange={handleShowLabelsChange} disabled={status !== 'success'} />}
                        label="แสดงตัวเลข"
                        sx={{ mr: 1, color: 'text.secondary' }}
                    />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    <ToggleButtonGroup value={chartType} exclusive onChange={handleChartTypeChange} size="small" disabled={status !== 'success'}>
                        <ToggleButton value="line-count" aria-label="Line Chart by Count">เส้น-(ใบ)</ToggleButton>
                        <ToggleButton value="area-count" aria-label="Area Chart by Count">พื้นที่-(ใบ)</ToggleButton>
                        <ToggleButton value="bar-count" aria-label="Bar Chart by Count">แท่ง-(ใบ)</ToggleButton>
                        <ToggleButton value="pie-count" aria-label="Pie Chart by Count">วงกลม-(ใบ)</ToggleButton>
                    </ToggleButtonGroup>
                    <ToggleButtonGroup value={chartType} exclusive onChange={handleChartTypeChange} size="small" disabled={status !== 'success'}>
                        <ToggleButton value="line-pack" aria-label="Line Chart by Pack">เส้น-(แพ็ค)</ToggleButton>
                        <ToggleButton value="area-pack" aria-label="Area Chart by Pack">พื้นที่-(แพ็ค)</ToggleButton>
                        <ToggleButton value="bar-pack" aria-label="Bar Chart by Pack">แท่ง-(แพ็ค)</ToggleButton>
                        <ToggleButton value="pie-pack" aria-label="Pie Chart by Pack">วงกลม-(แพ็ค)</ToggleButton>
                    </ToggleButtonGroup>
                    <ToggleButtonGroup value={chartType} exclusive onChange={handleChartTypeChange} size="small" disabled={status !== 'success'}>
                        <ToggleButton value="line-piece" aria-label="Line Chart by Piece">เส้น-(ชิ้น)</ToggleButton>
                        <ToggleButton value="area-piece" aria-label="Area Chart by Piece">พื้นที่-(ชิ้น)</ToggleButton>
                        <ToggleButton value="bar-piece" aria-label="Bar Chart by Piece">แท่ง-(ชิ้น)</ToggleButton>
                        <ToggleButton value="pie-piece" aria-label="Pie Chart by Piece">วงกลม-(ชิ้น)</ToggleButton>
                    </ToggleButtonGroup>
                    <ToggleButtonGroup value={chartType} exclusive onChange={handleChartTypeChange} size="small" disabled={status !== 'success'}>
                        <ToggleButton value="line-baht" aria-label="Line Chart by Baht">เส้น-(บาท)</ToggleButton>
                        <ToggleButton value="area-baht" aria-label="Area Chart by Baht">พื้นที่-(บาท)</ToggleButton>
                        <ToggleButton value="bar-baht" aria-label="Bar Chart by Baht">แท่ง-(บาท)</ToggleButton>
                        <ToggleButton value="pie-baht" aria-label="Pie Chart by Baht">วงกลม-(บาท)</ToggleButton>
                    </ToggleButtonGroup>
                </Box>
                <Divider sx={{ my: 2 }}/>
                {renderContent()}
                {status === 'success' && (
                     <Box sx={{ mt: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">สรุปข้อมูล (ตามช่วงวันที่เลือก)</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
                            <StatItem label={`ทั้งหมด (${unitText})`} value={formatValue(summaryData.total)} valueColor={theme.palette[color].dark} />
                            <StatItem label={`อนุมัติ (${unitText})`} value={formatValue(summaryData.approved)} valueColor={theme.palette.success.dark} />
                            <StatItem label={`ไม่อนุมัติ (${unitText})`} value={formatValue(summaryData.rejected)} valueColor={theme.palette.error.dark} />
                            <StatItem label={`ค้างพิจารณา (${unitText})`} value={formatValue(summaryData.waiting)} valueColor={theme.palette.info.dark} />
                            <StatItem label={`เฉลี่ยต่อวัน (${unitText})`} value={formatValue(summaryStats.average)} valueColor={theme.palette.info.dark} />
                            <StatItem label={`สูงสุด (${unitText})`} value={formatValue(summaryStats.maxDay.value)} subLabel={`วันที่ ${summaryStats.maxDay.date}`} valueColor={theme.palette.warning.dark} />
                            <StatItem label={`ต่ำสุด (${unitText})`} value={formatValue(summaryStats.minDay.value)} subLabel={`วันที่ ${summaryStats.minDay.date}`} valueColor={theme.palette.success.dark} />
                            <StatItem label="จำนวนวัน" value={apiData.length.toLocaleString()} valueColor="text.secondary" />
                        </Box>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default CnDefectChartCard;

///////////////////////////////////////////////////////////
// import React, { useState, useCallback, useMemo } from 'react';
// import { Card, CardContent, Box, Typography, Paper, useTheme, Divider, ToggleButton, ToggleButtonGroup, Switch, FormControlLabel } from '@mui/material';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LabelList } from 'recharts';
// import { StatItem } from './CnChartsCard';
// import DataMessage from '../common/DataMessage';

// // --- Component ย่อย ---

// const CustomLegend = ({ payload }) => (
//     <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 3, mt: 2 }}>
//         {payload.map((entry, index) => (
//             <Box key={`item-${index}`} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                 <Box sx={{ width: 14, height: 14, backgroundColor: entry.color, borderRadius: '2px' }} />
//                 <Typography variant="body2">{entry.value}</Typography>
//             </Box>
//         ))}
//     </Box>
// );

// const CustomTooltip = ({ active, payload, unitText, chartType }) => {
//     if (active && payload && payload.length) {
//         const dataPoint = payload[0].payload;
//         const items = chartType === 'line' ? payload : [...payload].reverse(); // Reverse for stacked charts
//         return (
//             <Paper elevation={3} sx={{ p: 1.5, backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
//                 <Typography variant="subtitle2" sx={{ mb: 1 }}>{`วันที่ ${dataPoint.date}`}</Typography>
//                 {items.map(item => (
//                     <Typography key={item.dataKey} variant="body2" sx={{ color: item.color, display: 'flex', justifyContent: 'space-between' }}>
//                         <span>{item.name}:</span>
//                         <span style={{ fontWeight: 'bold', marginLeft: '16px' }}>{`${item.value.toLocaleString()} (${unitText})`}</span>
//                     </Typography>
//                 ))}
//             </Paper>
//         );
//     }
//     return null;
// };

// const CustomPieTooltip = ({ active, payload, total }) => {
//     if (active && payload && payload.length) {
//         const data = payload[0];
//         const name = data.name;
//         const value = data.value;
//         const percent = total > 0 ? ((value / total) * 100).toFixed(2) : 0;
//         return (
//             <Paper elevation={3} sx={{ p: 1.5, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
//                 <Typography variant="body2" fontWeight="bold">{`${name}: ${value.toLocaleString()}`}</Typography>
//                 <Typography variant="caption" color="text.secondary">{`คิดเป็น ${percent}%`}</Typography>
//             </Paper>
//         );
//     }
//     return null;
// };

// const ChartDataLabel = (props) => {
//     const { x, y, width, value, stroke } = props;
//     if (value > 0) {
//         const color = stroke || '#555';
//         return (
//             <text x={x + width / 2} y={y} dy={-6} fill={color} fontSize={11} textAnchor="middle">
//                 {value.toLocaleString()}
//             </text>
//         );
//     }
//     return null;
// };

// const CnDefectChartCard = ({ status, title, apiData, icon, color = 'error', defectType = '43' }) => {
//     const [chartType, setChartType] = useState('line-count');
//     const [showLabels, setShowLabels] = useState(false);

//     const handleChartTypeChange = useCallback((event, newType) => {
//         if (newType !== null) {
//             setChartType(newType);
//         }
//     }, []);

//     const handleShowLabelsChange = (event) => {
//         setShowLabels(event.target.checked);
//     };

//     const theme = useTheme();

//     const { chartData, summaryData, unitText } = useMemo(() => {
//         const unit = chartType.split('-')[1] || 'count';
//         const unitTextMap = { count: 'ใบ', pack: 'แพ็ค', piece: 'ชิ้น', baht: 'บาท' };
        
//         const dataKeys = {
//             '43': {
//                 count: { total: 'countCnNo43ALL', approved: 'countCnNo43App', rejected: 'countCnNo43Rej', waiting: 'countCnNo43Wait' },
//                 pack:  { total: 'sumQtyPack43AppRejALL', approved: 'sumQtyPack43App', rejected: 'sumQtyPack43Rej', waiting: 'sumQtyPack43Wait' },
//                 piece: { total: 'sumQtyPCS43AppRejALL', approved: 'sumQtyPCS43App', rejected: 'sumQtyPCS43Rej', waiting: 'sumQtyPCS43Wait' },
//                 baht:  { total: 'sumBaht43AppRejALL', approved: 'sumBaht43App', rejected: 'sumBaht43Rej', waiting: 'sumBaht43Wait' },
//             },
//             '42': {
//                 count: { total: 'countCnNo42ALL', approved: 'countCnNo42App', rejected: 'countCnNo42Rej', waiting: 'countCnNo42Wait' },
//                 pack:  { total: 'sumQtyPack42AppRejALL', approved: 'sumQtyPack42App', rejected: 'sumQtyPack42Rej', waiting: 'sumQtyPack42Wait' },
//                 piece: { total: 'sumQtyPCS42AppRejALL', approved: 'sumQtyPCS42App', rejected: 'sumQtyPCS42Rej', waiting: 'sumQtyPCS42Wait' },
//                 baht:  { total: 'sumBaht42AppRejALL', approved: 'sumBaht42App', rejected: 'sumBaht42Rej', waiting: 'sumBaht42Wait' },
//             }
//         };

//         const currentKeys = dataKeys[defectType] ? dataKeys[defectType][unit] : dataKeys['43'][unit];

//         const transformedData = apiData.map(item => ({
//             date: new Date(item.DeliveryDate).toLocaleString('th-TH', { day: 'numeric', month: 'short' }),
//             total: item[currentKeys.total] || 0,
//             approved: item[currentKeys.approved] || 0,
//             rejected: item[currentKeys.rejected] || 0,
//             waiting: item[currentKeys.waiting] || 0,
//         }));
        
//         const totalSummary = transformedData.reduce((acc, item) => {
//             acc.total += item.total;
//             acc.approved += item.approved;
//             acc.rejected += item.rejected;
//             acc.waiting += item.waiting;
//             return acc;
//         }, { total: 0, approved: 0, rejected: 0, waiting: 0 });
        
//         return { chartData: transformedData, summaryData: totalSummary, unitText: unitTextMap[unit] };
//     }, [apiData, chartType, defectType]);
    
//     const chartRenderConfig = {
//         total:    { name: `ทั้งหมด`, color: theme.palette[color].main },
//         approved: { name: `อนุมัติ`, color: theme.palette.success.main },
//         rejected: { name: `ไม่อนุมัติ`, color: theme.palette.error.main },
//         waiting:  { name: `ค้างพิจารณา`, color: theme.palette.info.main },
//     };
    
//     const pieTotal = summaryData.approved + summaryData.rejected + summaryData.waiting;
//     const pieData = [
//         { name: `${chartRenderConfig.approved.name} (${unitText})`, value: summaryData.approved, color: chartRenderConfig.approved.color },
//         { name: `${chartRenderConfig.rejected.name} (${unitText})`, value: summaryData.rejected, color: chartRenderConfig.rejected.color },
//         { name: `${chartRenderConfig.waiting.name} (${unitText})`, value: summaryData.waiting, color: chartRenderConfig.waiting.color },
//     ].filter(item => item.value > 0);

//     const renderContent = () => {
//         if (status !== 'success') return <DataMessage status={status} />;
        
//         const chartComponent = chartType.split('-')[0];
//         const isDataEmpty = chartComponent === 'pie' ? pieTotal === 0 : chartData.every(d => d.total === 0 && d.approved === 0 && d.rejected === 0);
//         if (isDataEmpty) return <DataMessage status="info" message={`ไม่มีข้อมูลสำหรับแสดงผล (${unitText})`} />;

//         const ChartWrapper = ({ children }) => ( <Box sx={{ height: 400, width: '100%', mt: 2 }}><ResponsiveContainer>{children}</ResponsiveContainer></Box> );

//         switch (chartComponent) {
//             case 'line': return ( 
//                 <ChartWrapper>
//                     <LineChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 25 }}>
//                         <CartesianGrid strokeDasharray="3 3" />
//                         <XAxis dataKey="date" />
//                         <YAxis tickFormatter={(val) => val.toLocaleString()} />
//                         <Tooltip content={<CustomTooltip unitText={unitText} chartType="line" />} />
//                         <Legend payload={Object.values(chartRenderConfig).map(c => ({ value: `${c.name} (${unitText})`, type: 'line', color: c.color }))} />
//                         <Line type="monotone" dataKey="total" name={chartRenderConfig.total.name} stroke={chartRenderConfig.total.color} strokeWidth={2} activeDot={{ r: 8 }} >
//                             {showLabels && <LabelList dataKey="total" content={<ChartDataLabel stroke={chartRenderConfig.total.color} />} />}
//                         </Line>
//                         <Line type="monotone" dataKey="approved" name={chartRenderConfig.approved.name} stroke={chartRenderConfig.approved.color} >
//                             {showLabels && <LabelList dataKey="approved" content={<ChartDataLabel stroke={chartRenderConfig.approved.color} />} />}
//                         </Line>
//                         <Line type="monotone" dataKey="rejected" name={chartRenderConfig.rejected.name} stroke={chartRenderConfig.rejected.color} >
//                             {showLabels && <LabelList dataKey="rejected" content={<ChartDataLabel stroke={chartRenderConfig.rejected.color} />} />}
//                         </Line>
//                         <Line type="monotone" dataKey="waiting" name={chartRenderConfig.waiting.name} stroke={chartRenderConfig.waiting.color} >
//                             {showLabels && <LabelList dataKey="waiting" content={<ChartDataLabel stroke={chartRenderConfig.waiting.color} />} />}
//                         </Line>
//                     </LineChart>
//                 </ChartWrapper> 
//             );
//             case 'area': return ( 
//                 <ChartWrapper>
//                     <AreaChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 25 }}>
//                         <CartesianGrid strokeDasharray="3 3" />
//                         <XAxis dataKey="date" />
//                         <YAxis tickFormatter={(val) => val.toLocaleString()} />
//                         <Tooltip content={<CustomTooltip unitText={unitText} chartType="area" />} />
//                         <Legend payload={Object.values(chartRenderConfig).slice(1).map(c => ({ value: `${c.name} (${unitText})`, type: 'line', color: c.color }))} />
//                         <Area type="monotone" dataKey="approved" name={chartRenderConfig.approved.name} stackId="1" stroke={chartRenderConfig.approved.color} fill={chartRenderConfig.approved.color} >
//                             {showLabels && <LabelList dataKey="approved" position="top" formatter={(val) => val > 0 ? val.toLocaleString() : ''} />}
//                         </Area>
//                         <Area type="monotone" dataKey="rejected" name={chartRenderConfig.rejected.name} stackId="1" stroke={chartRenderConfig.rejected.color} fill={chartRenderConfig.rejected.color} >
//                             {showLabels && <LabelList dataKey="rejected" position="top" formatter={(val) => val > 0 ? val.toLocaleString() : ''} />}
//                         </Area>
//                         <Area type="monotone" dataKey="waiting" name={chartRenderConfig.waiting.name} stackId="1" stroke={chartRenderConfig.waiting.color} fill={chartRenderConfig.waiting.color} >
//                             {showLabels && <LabelList dataKey="waiting" position="top" formatter={(val) => val > 0 ? val.toLocaleString() : ''} />}
//                         </Area>
//                     </AreaChart>
//                 </ChartWrapper> 
//             );
//             case 'bar': return ( 
//                 <ChartWrapper>
//                     <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 25 }}>
//                         <CartesianGrid strokeDasharray="3 3" />
//                         <XAxis dataKey="date" />
//                         <YAxis tickFormatter={(val) => val.toLocaleString()} />
//                         <Tooltip content={<CustomTooltip unitText={unitText} chartType="bar" />} />
//                         <Legend payload={Object.values(chartRenderConfig).slice(1).map(c => ({ value: `${c.name} (${unitText})`, type: 'square', color: c.color }))} />
//                         <Bar dataKey="approved" name={chartRenderConfig.approved.name} stackId="a" fill={chartRenderConfig.approved.color} >
//                             {showLabels && <LabelList dataKey="approved" content={<ChartDataLabel />} />}
//                         </Bar>
//                         <Bar dataKey="rejected" name={chartRenderConfig.rejected.name} stackId="a" fill={chartRenderConfig.rejected.color} >
//                             {showLabels && <LabelList dataKey="rejected" content={<ChartDataLabel />} />}
//                         </Bar>
//                         <Bar dataKey="waiting" name={chartRenderConfig.waiting.name} stackId="a" fill={chartRenderConfig.waiting.color} >
//                             {showLabels && <LabelList dataKey="waiting" content={<ChartDataLabel />} />}
//                         </Bar>
//                     </BarChart>
//                 </ChartWrapper> 
//             );
//             case 'pie':
//                 return (
//                     <Box sx={{ height: 250, width: '100%', mt: 2 }}>
//                         <ResponsiveContainer>
//                             <PieChart>
//                                 <Pie
//                                     data={pieData}
//                                     cx="50%"
//                                     cy="50%"
//                                     labelLine={false}
//                                     outerRadius={80}
//                                     dataKey="value"
//                                     label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
//                                 >
//                                     {pieData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={entry.color} /> ))}
//                                 </Pie>
//                                 <Tooltip content={<CustomPieTooltip total={pieTotal} />} />
//                                 <Legend content={<CustomLegend payload={pieData.map(p => ({ value: p.name, type: 'square', color: p.color }))} />} />
//                             </PieChart>
//                         </ResponsiveContainer>
//                     </Box>
//                 );
//             default:
//                 return <DataMessage status="info" message={`กราฟประเภท '${chartComponent}' ยังไม่รองรับ`} />;
//         }
//     };

//     const formatValue = (value) => (unitText === 'บาท' ? value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : (typeof value === 'number' ? value.toLocaleString() : '0'));

//     return (
//         <Card sx={{ mb: 3, boxShadow: 3, borderColor: `${color}.main`, borderWidth: 1, borderStyle: 'solid' }}>
//             <CardContent>
//                 <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', mb: 2 }}>
//                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                         {icon}
//                         <Typography variant="h6" fontWeight="bold" component="div">{title}</Typography>
//                     </Box>
//                     <FormControlLabel
//                         control={<Switch checked={showLabels} onChange={handleShowLabelsChange} disabled={status !== 'success'} />}
//                         label="แสดงตัวเลข"
//                         sx={{ mr: 1, color: 'text.secondary' }}
//                     />
//                 </Box>
//                 {/* **[FIX]** นำ ToggleButtonGroup ทั้งหมดกลับเข้ามา */}
//                 <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1, mb: 2 }}>
//                     <ToggleButtonGroup value={chartType} exclusive onChange={handleChartTypeChange} size="small" disabled={status !== 'success'}>
//                         <ToggleButton value="line-count" aria-label="Line Chart by Count">เส้น-(ใบ)</ToggleButton>
//                         <ToggleButton value="area-count" aria-label="Area Chart by Count">พื้นที่-(ใบ)</ToggleButton>
//                         <ToggleButton value="bar-count" aria-label="Bar Chart by Count">แท่ง-(ใบ)</ToggleButton>
//                         <ToggleButton value="pie-count" aria-label="Pie Chart by Count">วงกลม-(ใบ)</ToggleButton>
//                     </ToggleButtonGroup>
//                     <ToggleButtonGroup value={chartType} exclusive onChange={handleChartTypeChange} size="small" disabled={status !== 'success'}>
//                         <ToggleButton value="line-pack" aria-label="Line Chart by Pack">เส้น-(แพ็ค)</ToggleButton>
//                         <ToggleButton value="area-pack" aria-label="Area Chart by Pack">พื้นที่-(แพ็ค)</ToggleButton>
//                         <ToggleButton value="bar-pack" aria-label="Bar Chart by Pack">แท่ง-(แพ็ค)</ToggleButton>
//                         <ToggleButton value="pie-pack" aria-label="Pie Chart by Pack">วงกลม-(แพ็ค)</ToggleButton>
//                     </ToggleButtonGroup>
//                     <ToggleButtonGroup value={chartType} exclusive onChange={handleChartTypeChange} size="small" disabled={status !== 'success'}>
//                         <ToggleButton value="line-piece" aria-label="Line Chart by Piece">เส้น-(ชิ้น)</ToggleButton>
//                         <ToggleButton value="area-piece" aria-label="Area Chart by Piece">พื้นที่-(ชิ้น)</ToggleButton>
//                         <ToggleButton value="bar-piece" aria-label="Bar Chart by Piece">แท่ง-(ชิ้น)</ToggleButton>
//                         <ToggleButton value="pie-piece" aria-label="Pie Chart by Piece">วงกลม-(ชิ้น)</ToggleButton>
//                     </ToggleButtonGroup>
//                     <ToggleButtonGroup value={chartType} exclusive onChange={handleChartTypeChange} size="small" disabled={status !== 'success'}>
//                         <ToggleButton value="line-baht" aria-label="Line Chart by Baht">เส้น-(บาท)</ToggleButton>
//                         <ToggleButton value="area-baht" aria-label="Area Chart by Baht">พื้นที่-(บาท)</ToggleButton>
//                         <ToggleButton value="bar-baht" aria-label="Bar Chart by Baht">แท่ง-(บาท)</ToggleButton>
//                         <ToggleButton value="pie-baht" aria-label="Pie Chart by Baht">วงกลม-(บาท)</ToggleButton>
//                     </ToggleButtonGroup>
//                 </Box>
                
//                 <Divider sx={{ my: 2 }}/>
//                 {renderContent()}
                
//                 {status === 'success' && (
//                      <Box sx={{ mt: 3 }}>
//                         <Typography variant="h6" gutterBottom fontWeight="bold">สรุปข้อมูล</Typography>
//                         <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
//                             <StatItem label={`ทั้งหมด (${unitText})`} value={formatValue(summaryData.total)} valueColor={theme.palette[color].dark} />
//                             <StatItem label={`อนุมัติ (${unitText})`} value={formatValue(summaryData.approved)} valueColor={theme.palette.success.dark} />
//                             <StatItem label={`ไม่อนุมัติ (${unitText})`} value={formatValue(summaryData.rejected)} valueColor={theme.palette.error.dark} />
//                             <StatItem label={`ค้างพิจารณา (${unitText})`} value={formatValue(summaryData.waiting)} valueColor={theme.palette.info.dark} />
//                         </Box>
//                     </Box>
//                 )}
//             </CardContent>
//         </Card>
//     );
// };

// export default CnDefectChartCard;

////////////////////////////////////////////////////////////////////////
// import React, { useState, useCallback, useMemo } from 'react';
// import { Card, CardContent, Box, Typography, Paper, useTheme, Divider, ToggleButton, ToggleButtonGroup } from '@mui/material';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
// import { StatItem } from './CnChartsCard';
// import DataMessage from '../common/DataMessage';

// const CustomLegend = ({ legendItems }) => (
//     <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 3, mt: 2 }}>
//         {legendItems.map((item) => (
//             <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                 <Box sx={{ width: 14, height: 14, backgroundColor: item.color, borderRadius: '2px' }} />
//                 <Typography variant="body2">{item.name}</Typography>
//             </Box>
//         ))}
//     </Box>
// );

// const CustomTooltip = ({ active, payload, unitText }) => {
//     if (active && payload && payload.length) {
//         const dataPoint = payload[0].payload;
//         return (
//             <Paper elevation={3} sx={{ p: 1.5, backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
//                 <Typography variant="subtitle2" sx={{ mb: 1 }}>{`วันที่ ${dataPoint.tooltipDate}`}</Typography>
//                 {payload.map(item => (
//                     <Typography key={item.dataKey} variant="body2" sx={{ color: item.color, display: 'flex', justifyContent: 'space-between' }}>
//                         <span>{item.name}:</span>
//                         <span style={{ fontWeight: 'bold', marginLeft: '16px' }}>{`${item.value.toLocaleString()} (${unitText})`}</span>
//                     </Typography>
//                 ))}
//             </Paper>
//         );
//     }
//     return null;
// };

// const CustomPieTooltip = ({ active, payload, total }) => {
//     if (active && payload && payload.length) {
//         const data = payload[0];
//         const name = data.name;
//         const value = data.value;
//         const percent = total > 0 ? ((value / total) * 100).toFixed(2) : 0;
//         return (
//             <Paper elevation={3} sx={{ p: 1.5, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
//                 <Typography variant="body2" fontWeight="bold">{`${name}: ${value.toLocaleString()}`}</Typography>
//                 <Typography variant="caption" color="text.secondary">{`คิดเป็น ${percent}%`}</Typography>
//             </Paper>
//         );
//     }
//     return null;
// };


// const CnDefectChartCard = ({ status, title, apiData, icon, color = 'error', defectType = '43' }) => {
//     const [chartType, setChartType] = useState('line-count');
//     const handleChartTypeChange = useCallback((event, newType) => {
//         if (newType !== null) {
//             setChartType(newType);
//         }
//     }, []);

//     const theme = useTheme();

//     const { chartData, summaryData, unitText, summaryStats } = useMemo(() => {
//         const unit = chartType.split('-')[1] || 'count';
//         const unitTextMap = { count: 'ใบ', pack: 'แพ็ค', piece: 'ชิ้น', baht: 'บาท' };
        
//         const dataKeys = {
//             '43': {
//                 count: { total: 'countCnNo43ALL', approved: 'countCnNo43App', rejected: 'countCnNo43Rej', waiting: 'countCnNo43Wait' },
//                 pack:  { total: 'sumQtyPack43AppRejALL', approved: 'sumQtyPack43App', rejected: 'sumQtyPack43Rej', waiting: 'sumQtyPack43Wait' },
//                 piece: { total: 'sumQtyPCS43AppRejALL', approved: 'sumQtyPCS43App', rejected: 'sumQtyPCS43Rej', waiting: 'sumQtyPCS43Wait' },
//                 baht:  { total: 'sumBaht43AppRejALL', approved: 'sumBaht43App', rejected: 'sumBaht43Rej', waiting: 'sumBaht43Wait' },
//             },
//             '42': {
//                 count: { total: 'countCnNo42ALL', approved: 'countCnNo42App', rejected: 'countCnNo42Rej', waiting: 'countCnNo42Wait' },
//                 pack:  { total: 'sumQtyPack42AppRejALL', approved: 'sumQtyPack42App', rejected: 'sumQtyPack42Rej', waiting: 'sumQtyPack42Wait' },
//                 piece: { total: 'sumQtyPCS42AppRejALL', approved: 'sumQtyPCS42App', rejected: 'sumQtyPCS42Rej', waiting: 'sumQtyPCS42Wait' },
//                 baht:  { total: 'sumBaht42AppRejALL', approved: 'sumBaht42App', rejected: 'sumBaht42Rej', waiting: 'sumBaht42Wait' },
//             }
//         };
        
//         const currentKeys = dataKeys[defectType][unit];

//         const transformedData = apiData.map(item => ({
//             date: new Date(item.DeliveryDate).toLocaleString('th-TH', { day: 'numeric', month: 'short' }),
//             tooltipDate: new Date(item.DeliveryDate).toLocaleString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }),
//             rawDate: item.DeliveryDate,
//             total: item[currentKeys.total] || 0,
//             approved: item[currentKeys.approved] || 0,
//             rejected: item[currentKeys.rejected] || 0,
//             waiting: item[currentKeys.waiting] || 0,
//         }));

//         const totalSummary = transformedData.reduce((acc, item) => {
//             acc.total += item.total;
//             acc.approved += item.approved;
//             acc.rejected += item.rejected;
//             acc.waiting += item.waiting;
//             return acc;
//         }, { total: 0, approved: 0, rejected: 0, waiting: 0 });
        
//         let stats = { average: 0, maxDay: { value: 0, date: '-' }, minDay: { value: 0, date: '-' } };
//         if (transformedData.length > 0) {
//             const formatDate = (dateString) => new Date(dateString).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
//             const maxDayObject = transformedData.reduce((max, day) => day.total > max.total ? day : max, transformedData[0]);
//             const minDayObject = transformedData.reduce((min, day) => day.total < min.total ? day : min, transformedData[0]);
//             stats = {
//                 average: Math.round(totalSummary.total / transformedData.length),
//                 maxDay: { value: maxDayObject.total, date: formatDate(maxDayObject.rawDate) },
//                 minDay: { value: minDayObject.total, date: formatDate(minDayObject.rawDate) }
//             };
//         }

//         return { chartData: transformedData, summaryData: totalSummary, unitText: unitTextMap[unit], summaryStats: stats };
//     }, [apiData, chartType, defectType]);
    
//     const chartRenderConfig = {
//         total:    { name: `ทั้งหมด`,    color: theme.palette[color].main },
//         approved: { name: `อนุมัติ`,      color: theme.palette.success.main },
//         rejected: { name: `ไม่อนุมัติ`,    color: theme.palette.error.main },
//         waiting:  { name: `ค้างพิจารณา`,   color: theme.palette.info.main },
//     };
    
//     const pieTotal = summaryData.approved + summaryData.rejected + summaryData.waiting;
//     const pieData = [
//         { name: `${chartRenderConfig.approved.name} (${unitText})`, value: summaryData.approved, color: chartRenderConfig.approved.color },
//         { name: `${chartRenderConfig.rejected.name} (${unitText})`, value: summaryData.rejected, color: chartRenderConfig.rejected.color },
//         { name: `${chartRenderConfig.waiting.name} (${unitText})`, value: summaryData.waiting, color: chartRenderConfig.waiting.color },
//     ].filter(item => item.value > 0);

//     const renderContent = () => {
//         if (status !== 'success') return <DataMessage status="info" message="กรุณาเลือกช่วงวันที่เพื่อแสดงข้อมูล" />;
        
//         const ChartWrapper = ({ children }) => ( <Box sx={{ height: 400, width: '100%', mt: 2 }}><ResponsiveContainer>{children}</ResponsiveContainer></Box> );
//         const chartComponent = chartType.split('-')[0];

//         switch (chartComponent) {
//             case 'line': return ( <ChartWrapper><LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 25 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis tickFormatter={(val) => val.toLocaleString()} /><Tooltip content={<CustomTooltip unitText={unitText}/>} /><Legend content={<CustomLegend legendItems={Object.values(chartRenderConfig).map(c => ({name: `${c.name} (${unitText})`, color: c.color}))}/>} /><Line type="monotone" dataKey="total" name={chartRenderConfig.total.name} stroke={chartRenderConfig.total.color} strokeWidth={2} activeDot={{ r: 8 }} /><Line type="monotone" dataKey="approved" name={chartRenderConfig.approved.name} stroke={chartRenderConfig.approved.color} /><Line type="monotone" dataKey="rejected" name={chartRenderConfig.rejected.name} stroke={chartRenderConfig.rejected.color} /><Line type="monotone" dataKey="waiting" name={chartRenderConfig.waiting.name} stroke={chartRenderConfig.waiting.color} /></LineChart></ChartWrapper> );
//             case 'area': return ( <ChartWrapper><AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 25 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis tickFormatter={(val) => val.toLocaleString()} /><Tooltip content={<CustomTooltip unitText={unitText}/>} /><Legend content={<CustomLegend legendItems={Object.values(chartRenderConfig).slice(1).map(c => ({name: `${c.name} (${unitText})`, color: c.color}))}/>} /><Area type="monotone" dataKey="approved" name={chartRenderConfig.approved.name} stackId="1" stroke={chartRenderConfig.approved.color} fill={chartRenderConfig.approved.color} /><Area type="monotone" dataKey="rejected" name={chartRenderConfig.rejected.name} stackId="1" stroke={chartRenderConfig.rejected.color} fill={chartRenderConfig.rejected.color} /><Area type="monotone" dataKey="waiting" name={chartRenderConfig.waiting.name} stackId="1" stroke={chartRenderConfig.waiting.color} fill={chartRenderConfig.waiting.color} /></AreaChart></ChartWrapper> );
//             case 'bar': return ( <ChartWrapper><BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 25 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis tickFormatter={(val) => val.toLocaleString()} /><Tooltip content={<CustomTooltip unitText={unitText}/>} /><Legend content={<CustomLegend legendItems={Object.values(chartRenderConfig).slice(1).map(c => ({name: `${c.name} (${unitText})`, color: c.color}))}/>} /><Bar dataKey="approved" name={chartRenderConfig.approved.name} stackId="a" fill={chartRenderConfig.approved.color} /><Bar dataKey="rejected" name={chartRenderConfig.rejected.name} stackId="a" fill={chartRenderConfig.rejected.color} /><Bar dataKey="waiting" name={chartRenderConfig.waiting.name} stackId="a" fill={chartRenderConfig.waiting.color} /></BarChart></ChartWrapper> );
//             case 'pie':
//                 if (pieTotal === 0) { return <DataMessage status="info" message={`ไม่มีข้อมูลสำหรับแสดงผลกราฟวงกลม (${unitText})`} />; }
//                 return (
//                     <ChartWrapper>
//                         <PieChart>
//                             <Pie
//                                 data={pieData}
//                                 cx="50%"
//                                 cy="50%"
//                                 labelLine={false}
//                                 outerRadius={120}
//                                 dataKey="value"
//                                 label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
//                             >
//                                 {pieData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={entry.color} /> ))}
//                             </Pie>
//                             <Tooltip content={<CustomPieTooltip total={pieTotal} />} />
//                             <Legend content={<CustomLegend legendItems={pieData} />} />
//                         </PieChart>
//                     </ChartWrapper>
//                 );
//             default: return null;
//         }
//     };

//     const formatValue = (value) => (unitText === 'บาท' ? value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : (typeof value === 'number' ? value.toLocaleString() : '0'));

//     return (
//         <Card sx={{ mb: 3, boxShadow: 3, borderColor: `${color}.main`, borderWidth: 1, borderStyle: 'solid' }}>
//             <CardContent>
//                 <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
//                     {icon}
//                     <Typography variant="h6" fontWeight="bold" component="div">{title}</Typography>
//                 </Box>
                
//                 <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1, mb: 2 }}>
//                     <ToggleButtonGroup value={chartType} exclusive onChange={handleChartTypeChange} size="small" disabled={status !== 'success'}>
//                         <ToggleButton value="line-count" aria-label="Line Chart by Count">เส้น-(ใบ)</ToggleButton>
//                         <ToggleButton value="area-count" aria-label="Area Chart by Count">พื้นที่-(ใบ)</ToggleButton>
//                         <ToggleButton value="bar-count" aria-label="Bar Chart by Count">แท่ง-(ใบ)</ToggleButton>
//                         <ToggleButton value="pie-count" aria-label="Pie Chart by Count">วงกลม-(ใบ)</ToggleButton>
//                     </ToggleButtonGroup>
//                     <ToggleButtonGroup value={chartType} exclusive onChange={handleChartTypeChange} size="small" disabled={status !== 'success'}>
//                         <ToggleButton value="line-pack" aria-label="Line Chart by Pack">เส้น-(แพ็ค)</ToggleButton>
//                         <ToggleButton value="area-pack" aria-label="Area Chart by Pack">พื้นที่-(แพ็ค)</ToggleButton>
//                         <ToggleButton value="bar-pack" aria-label="Bar Chart by Pack">แท่ง-(แพ็ค)</ToggleButton>
//                         <ToggleButton value="pie-pack" aria-label="Pie Chart by Pack">วงกลม-(แพ็ค)</ToggleButton>
//                     </ToggleButtonGroup>
//                     <ToggleButtonGroup value={chartType} exclusive onChange={handleChartTypeChange} size="small" disabled={status !== 'success'}>
//                         <ToggleButton value="line-piece" aria-label="Line Chart by Piece">เส้น-(ชิ้น)</ToggleButton>
//                         <ToggleButton value="area-piece" aria-label="Area Chart by Piece">พื้นที่-(ชิ้น)</ToggleButton>
//                         <ToggleButton value="bar-piece" aria-label="Bar Chart by Piece">แท่ง-(ชิ้น)</ToggleButton>
//                         <ToggleButton value="pie-piece" aria-label="Pie Chart by Piece">วงกลม-(ชิ้น)</ToggleButton>
//                     </ToggleButtonGroup>
//                     <ToggleButtonGroup value={chartType} exclusive onChange={handleChartTypeChange} size="small" disabled={status !== 'success'}>
//                         <ToggleButton value="line-baht" aria-label="Line Chart by Baht">เส้น-(บาท)</ToggleButton>
//                         <ToggleButton value="area-baht" aria-label="Area Chart by Baht">พื้นที่-(บาท)</ToggleButton>
//                         <ToggleButton value="bar-baht" aria-label="Bar Chart by Baht">แท่ง-(บาท)</ToggleButton>
//                         <ToggleButton value="pie-baht" aria-label="Pie Chart by Baht">วงกลม-(บาท)</ToggleButton>
//                     </ToggleButtonGroup>
//                 </Box>
                
//                 <Divider />
//                 {renderContent()}
                
//                 {status === 'success' && (
//                      <Box sx={{ mt: 3 }}>
//                         <Typography variant="h6" gutterBottom fontWeight="bold">สรุปข้อมูล (ตามช่วงวันที่เลือก)</Typography>
//                         <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
//                             <StatItem label={`ทั้งหมด (${unitText})`} value={formatValue(summaryData.total)} valueColor={theme.palette[color].dark} />
//                             <StatItem label={`อนุมัติ (${unitText})`} value={formatValue(summaryData.approved)} valueColor={theme.palette.success.dark} />
//                             <StatItem label={`ไม่อนุมัติ (${unitText})`} value={formatValue(summaryData.rejected)} valueColor={theme.palette.error.dark} />
//                             <StatItem label={`ค้างพิจารณา (${unitText})`} value={formatValue(summaryData.waiting)} valueColor={theme.palette.info.dark} />
//                             <StatItem label={`เฉลี่ยต่อวัน (${unitText})`} value={formatValue(summaryStats.average)} valueColor={theme.palette.info.dark} />
//                             <StatItem label={`สูงสุด (${unitText})`} value={formatValue(summaryStats.maxDay.value)} subLabel={`วันที่ ${summaryStats.maxDay.date}`} valueColor={theme.palette.warning.dark} />
//                             <StatItem label={`ต่ำสุด (${unitText})`} value={formatValue(summaryStats.minDay.value)} subLabel={`วันที่ ${summaryStats.minDay.date}`} valueColor={theme.palette.success.dark} />
//                             <StatItem label="จำนวนวัน" value={apiData.length.toLocaleString()} valueColor="text.secondary" />
//                         </Box>
//                     </Box>
//                 )}
//             </CardContent>
//         </Card>
//     );
// };

// export default CnDefectChartCard;

