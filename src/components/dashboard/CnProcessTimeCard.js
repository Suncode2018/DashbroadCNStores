
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, Box, Typography, Tabs, Tab, useTheme, CircularProgress, Alert, Paper, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ReferenceLine, Label, LabelList } from 'recharts';
import CommentIcon from '@mui/icons-material/Comment';
import apiService from '../../api/apiService';

// Component ย่อยสำหรับ Tooltip ของกราฟ
const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <Paper elevation={3} sx={{ p: 1.5, backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>{payload[0].payload.name}</Typography>
                <Typography variant="body2">{`จำนวน: ${payload[0].value.toLocaleString()} (ใบ)`}</Typography>
            </Paper>
        );
    }
    return null;
};

// Component ย่อยสำหรับ Render ป้ายกำกับข้อมูล (Data Label)
const renderCustomizedLabel = (props) => {
    const { x, y, width, height, value } = props;
    if (value === 0) return null;
    const labelX = x + width + 5;
    const labelY = y + height / 2;
    return (
        <text x={labelX} y={labelY} fill="#555" textAnchor="start" dominantBaseline="middle" fontSize={12} fontWeight="bold">
            {value.toLocaleString()}
        </text>
    );
};

const CnProcessTimeCard = ({ dateFilter }) => {
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState('43');
    const [apiData, setApiData] = useState([]);
    const [status, setStatus] = useState('initial');
    const [errorMessage, setErrorMessage] = useState('');

    const cardConfig = useMemo(() => ({
        '43': {
            title: "ระยะเวลา ดำเนินการ CN ขาดส่ง",
            targetDays: parseInt(process.env.REACT_APP_CN_PROCESS_43_TARGET, 10) || 3,
            apiCall: apiService.getCnProcess43App,
        },
        '42': {
            title: "ระยะเวลา ดำเนินการ CN เสื่อมคุณภาพ",
            targetDays: parseInt(process.env.REACT_APP_CN_PROCESS_42_TARGET, 10) || 5,
            apiCall: apiService.getCnProcess42App,
        }
    }), []);

    const fetchData = useCallback(async (startDate, endDate) => {
        if (!startDate || !endDate) { setStatus('initial'); setApiData([]); return; }
        setStatus('loading');
        try {
            const result = await cardConfig[activeTab].apiCall(startDate, endDate);
            if (result.success && Array.isArray(result.data?.data)) {
                setApiData(result.data.data);
                setStatus(result.data.data.length > 0 ? 'success' : 'empty');
            } else { throw new Error(result.error || 'Invalid data format'); }
        } catch (err) {
            setApiData([]); setStatus('error'); setErrorMessage(err.message || 'ไม่สามารถดึงข้อมูลได้');
        }
    }, [activeTab, cardConfig]);

    useEffect(() => {
        if (dateFilter && dateFilter.startDate && dateFilter.endDate) {
            fetchData(dateFilter.startDate, dateFilter.endDate);
        } else {
            setStatus('initial');
            setApiData([]);
        }
    }, [dateFilter, fetchData]);

    const { chartData, suggestions } = useMemo(() => {
        if (!apiData || apiData.length === 0) return { chartData: [], suggestions: [] };

        const aggregated = {};
        const suggestionSet = new Set();

        apiData.forEach(dailyData => {
            if (dailyData.msgSuggestion) suggestionSet.add(dailyData.msgSuggestion);
            Object.entries(dailyData).forEach(([key, value]) => {
                if (!isNaN(key) && typeof value === 'number' && value > 0) {
                    const day = parseInt(key, 10);
                    aggregated[day] = (aggregated[day] || 0) + value;
                }
            });
        });

        const sortedChartData = Object.entries(aggregated)
            .map(([day, count]) => ({ day: parseInt(day, 10), name: `วันที่ ${day}`, count }))
            .sort((a, b) => a.day - b.day);
        
        return { chartData: sortedChartData, suggestions: [...suggestionSet] };
    }, [apiData]);

    const handleTabChange = (event, newValue) => { setActiveTab(newValue); };
    
    const renderContent = () => {
        if (status === 'initial') return <Alert severity="info" sx={{m:2}}>กรุณาเลือกช่วงวันที่จากตัวกรองหลักด้านบน</Alert>;
        if (status === 'loading') return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
        if (status === 'error') return <Alert severity="error" sx={{m:2}}>{errorMessage}</Alert>;
        if (status === 'empty') return <Alert severity="warning" sx={{m:2}}>ไม่พบข้อมูลในข่วงวันที่ที่เลือก</Alert>;

        const target = cardConfig[activeTab].targetDays;
        
        return (
            <>
                <Box sx={{ height: 400, width: '100%', p: 2, pl: { xs: 1, sm: 2 } }}>
                    <ResponsiveContainer>
                        <BarChart layout="vertical" data={chartData} margin={{ top: 5, right: 50, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" domain={[0, dataMax => Math.ceil((dataMax * 1.15) / 10) * 10]} />
                            <YAxis type="category" dataKey="name" width={80} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '10px' }}/>
                            <ReferenceLine x={target} stroke={theme.palette.primary.main} strokeDasharray="3 3">
                                <Label value={`เป้าหมาย: ${target} วัน`} position="insideTopRight" fill={theme.palette.primary.main} />
                            </ReferenceLine>
                            <Bar dataKey="count" name="จำนวน (ใบ)">
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.day <= target ? theme.palette.success.main : theme.palette.error.main} />
                                ))}
                                <LabelList dataKey="count" content={renderCustomizedLabel} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
                {suggestions.length > 0 && (
                    <Box sx={{ p: 2, pt: 0 }}>
                        <Typography variant="subtitle2" fontWeight="bold">ข้อเสนอแนะที่พบ:</Typography>
                        <List dense>
                            {suggestions.map((msg, index) => (
                                <ListItem key={index}>
                                    <ListItemIcon sx={{minWidth: 32}}><CommentIcon fontSize="small" color="action"/></ListItemIcon>
                                    <ListItemText primary={msg} />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                )}
            </>
        );
    };
    
    const title = useMemo(() => {
        const baseTitle = cardConfig[activeTab].title;
        if (dateFilter && dateFilter.startDate && dateFilter.endDate) {
            const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
            const start = new Date(dateFilter.startDate).toLocaleDateString('th-TH', options);
            const end = new Date(dateFilter.endDate).toLocaleDateString('th-TH', options);
            return `${baseTitle} วันที่: ${start} ถึง ${end}`;
        }
        return baseTitle;
    }, [activeTab, dateFilter, cardConfig]);

    return (
        <Card sx={{ mt: 3, boxShadow: 3 }}>
            <CardContent sx={{ pb: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="h6" fontWeight="bold" align="center" gutterBottom>{title}</Typography>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={activeTab} onChange={handleTabChange} centered>
                        <Tab label="CN ขาดส่ง" value="43" />
                        <Tab label="CN เสื่อมคุณภาพ" value="42" />
                    </Tabs>
                </Box>
                {renderContent()}
            </CardContent>
        </Card>
    );
};

export default CnProcessTimeCard;

///////////////////////////////////////
// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import { Card, CardContent, Box, Typography, Tabs, Tab, useTheme, CircularProgress, Alert, Paper, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ReferenceLine, Label } from 'recharts';
// import CommentIcon from '@mui/icons-material/Comment';
// import apiService from '../../api/apiService';

// // Component ย่อยสำหรับ Tooltip ของกราฟ
// const CustomTooltip = ({ active, payload }) => {
//     if (active && payload && payload.length) {
//         return (
//             <Paper elevation={3} sx={{ p: 1.5, backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
//                 <Typography variant="subtitle2" sx={{ mb: 1 }}>{payload[0].payload.name}</Typography>
//                 <Typography variant="body2">{`จำนวน: ${payload[0].value.toLocaleString()} (ใบ)`}</Typography>
//             </Paper>
//         );
//     }
//     return null;
// };

// const CnProcessTimeCard = ({ dateFilter }) => {
//     const theme = useTheme();
//     const [activeTab, setActiveTab] = useState('43');
//     const [apiData, setApiData] = useState([]);
//     const [status, setStatus] = useState('initial');
//     const [errorMessage, setErrorMessage] = useState('');

//     const cardConfig = useMemo(() => ({
//         '43': {
//             title: "ระยะเวลา ดำเนินการ CN ขาดส่ง",
//             targetDays: parseInt(process.env.REACT_APP_CN_PROCESS_43_TARGET, 10) || 3,
//             apiCall: apiService.getCnProcess43App,
//         },
//         '42': {
//             title: "ระยะเวลา ดำเนินการ CN เสื่อมคุณภาพ",
//             targetDays: parseInt(process.env.REACT_APP_CN_PROCESS_42_TARGET, 10) || 5,
//             apiCall: apiService.getCnProcess42App,
//         }
//     }), []);

//     const fetchData = useCallback(async (startDate, endDate) => {
//         if (!startDate || !endDate) { setStatus('initial'); setApiData([]); return; }
//         setStatus('loading');
//         try {
//             const result = await cardConfig[activeTab].apiCall(startDate, endDate);
//             if (result.success && Array.isArray(result.data?.data)) {
//                 setApiData(result.data.data);
//                 setStatus(result.data.data.length > 0 ? 'success' : 'empty');
//             } else { throw new Error(result.error || 'Invalid data format'); }
//         } catch (err) {
//             setApiData([]); setStatus('error'); setErrorMessage(err.message || 'ไม่สามารถดึงข้อมูลได้');
//         }
//     }, [activeTab, cardConfig]);

//     useEffect(() => {
//         if (dateFilter && dateFilter.startDate && dateFilter.endDate) {
//             fetchData(dateFilter.startDate, dateFilter.endDate);
//         } else {
//             setStatus('initial');
//             setApiData([]);
//         }
//     }, [dateFilter, fetchData]);

//     const { chartData, suggestions } = useMemo(() => {
//         if (!apiData || apiData.length === 0) return { chartData: [], suggestions: [] };

//         const aggregated = {};
//         const suggestionSet = new Set();

//         apiData.forEach(dailyData => {
//             if (dailyData.msgSuggestion) suggestionSet.add(dailyData.msgSuggestion);
//             Object.entries(dailyData).forEach(([key, value]) => {
//                 if (!isNaN(key) && typeof value === 'number' && value > 0) {
//                     const day = parseInt(key, 10);
//                     aggregated[day] = (aggregated[day] || 0) + value;
//                 }
//             });
//         });

//         const sortedChartData = Object.entries(aggregated)
//             .map(([day, count]) => ({ day: parseInt(day, 10), name: `วันที่ ${day}`, count }))
//             .sort((a, b) => a.day - b.day);
        
//         return { chartData: sortedChartData, suggestions: [...suggestionSet] };
//     }, [apiData]);

//     const handleTabChange = (event, newValue) => { setActiveTab(newValue); };
    
//     const renderContent = () => {
//         if (status === 'initial') return <Alert severity="info" sx={{m:2}}>กรุณาเลือกช่วงวันที่จากตัวกรองหลักด้านบน</Alert>;
//         if (status === 'loading') return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
//         if (status === 'error') return <Alert severity="error" sx={{m:2}}>{errorMessage}</Alert>;
//         if (status === 'empty') return <Alert severity="warning" sx={{m:2}}>ไม่พบข้อมูลในข่วงวันที่ที่เลือก</Alert>;

//         const target = cardConfig[activeTab].targetDays;
        
//         return (
//             <>
//                 <Box sx={{ height: 400, width: '100%', p: 2 }}>
//                     <ResponsiveContainer>
//                         <BarChart layout="vertical" data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
//                             <CartesianGrid strokeDasharray="3 3" />
//                             <XAxis type="number" domain={[0, dataMax => Math.ceil((dataMax * 1.1) / 10) * 10]} />
//                             <YAxis type="category" dataKey="name" width={80} />
//                             <Tooltip content={<CustomTooltip />} />
//                             <Legend />
//                             <ReferenceLine x={target} stroke={theme.palette.primary.main} strokeDasharray="3 3">
//                                 <Label value={`เป้าหมาย: ${target} วัน`} position="insideTopRight" fill={theme.palette.primary.main} />
//                             </ReferenceLine>
//                             <Bar dataKey="count" name="จำนวน (ใบ)">
//                                 {chartData.map((entry, index) => (
//                                     <Cell key={`cell-${index}`} fill={entry.day <= target ? theme.palette.success.main : theme.palette.error.main} />
//                                 ))}
//                             </Bar>
//                         </BarChart>
//                     </ResponsiveContainer>
//                 </Box>
//                 {suggestions.length > 0 && (
//                     <Box sx={{ p: 2, pt: 0 }}>
//                         <Typography variant="subtitle2" fontWeight="bold">ข้อเสนอแนะที่พบ:</Typography>
//                         <List dense>
//                             {suggestions.map((msg, index) => (
//                                 <ListItem key={index}>
//                                     <ListItemIcon sx={{minWidth: 32}}><CommentIcon fontSize="small" color="action"/></ListItemIcon>
//                                     <ListItemText primary={msg} />
//                                 </ListItem>
//                             ))}
//                         </List>
//                     </Box>
//                 )}
//             </>
//         );
//     };
    
//     const title = useMemo(() => {
//         const baseTitle = cardConfig[activeTab].title;
//         if (dateFilter && dateFilter.startDate && dateFilter.endDate) {
//             const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
//             const start = new Date(dateFilter.startDate).toLocaleDateString('th-TH', options);
//             const end = new Date(dateFilter.endDate).toLocaleDateString('th-TH', options);
//             return `${baseTitle} วันที่: ${start} ถึง ${end}`;
//         }
//         return baseTitle;
//     }, [activeTab, dateFilter, cardConfig]);

//     return (
//         <Card sx={{ mt: 3, boxShadow: 3 }}>
//             <CardContent sx={{ pb: 2, '&:last-child': { pb: 2 } }}>
//                 <Typography variant="h6" fontWeight="bold" align="center" gutterBottom>{title}</Typography>
//                 <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
//                     <Tabs value={activeTab} onChange={handleTabChange} centered>
//                         <Tab label="CN ขาดส่ง" value="43" />
//                         <Tab label="CN เสื่อมคุณภาพ" value="42" />
//                     </Tabs>
//                 </Box>
//                 {renderContent()}
//             </CardContent>
//         </Card>
//     );
// };

// export default CnProcessTimeCard;

///////////////////////////////////////////////////////////////////
// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import { Card, CardContent, Box, Typography, Tabs, Tab, useTheme, CircularProgress, Alert, Paper, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ReferenceLine, Label } from 'recharts';
// import CommentIcon from '@mui/icons-material/Comment';
// import apiService from '../../api/apiService';

// // Component ย่อยสำหรับ Tooltip ของกราฟ
// const CustomTooltip = ({ active, payload }) => {
//     if (active && payload && payload.length) {
//         return (
//             <Paper elevation={3} sx={{ p: 1.5, backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
//                 <Typography variant="subtitle2" sx={{ mb: 1 }}>{payload[0].payload.name}</Typography>
//                 <Typography variant="body2">{`จำนวน: ${payload[0].value.toLocaleString()} (ใบ)`}</Typography>
//             </Paper>
//         );
//     }
//     return null;
// };

// const CnProcessTimeCard = ({ dateFilter }) => {
//     const theme = useTheme();
//     const [activeTab, setActiveTab] = useState('43');
//     const [apiData, setApiData] = useState([]);
//     const [status, setStatus] = useState('initial');
//     const [errorMessage, setErrorMessage] = useState('');

//     const cardConfig = useMemo(() => ({
//         '43': {
//             title: "ระยะเวลา ดำเนินการ CN ขาดส่ง",
//             targetDays: parseInt(process.env.REACT_APP_CN_PROCESS_43_TARGET, 10) || 3,
//             apiCall: apiService.getCnProcess43App,
//         },
//         '42': {
//             title: "ระยะเวลา ดำเนินการ CN เสื่อมคุณภาพ",
//             targetDays: parseInt(process.env.REACT_APP_CN_PROCESS_42_TARGET, 10) || 5,
//             apiCall: apiService.getCnProcess42App,
//         }
//     }), []);

//     const fetchData = useCallback(async (startDate, endDate) => {
//         if (!startDate || !endDate) { setStatus('initial'); setApiData([]); return; }
//         setStatus('loading');
//         try {
//             const result = await cardConfig[activeTab].apiCall(startDate, endDate);
//             if (result.success && Array.isArray(result.data?.data)) {
//                 setApiData(result.data.data);
//                 setStatus(result.data.data.length > 0 ? 'success' : 'empty');
//             } else { throw new Error(result.error || 'Invalid data format'); }
//         } catch (err) {
//             setApiData([]); setStatus('error'); setErrorMessage(err.message || 'ไม่สามารถดึงข้อมูลได้');
//         }
//     }, [activeTab, cardConfig]);

//     useEffect(() => {
//         if (dateFilter && dateFilter.startDate && dateFilter.endDate) {
//             fetchData(dateFilter.startDate, dateFilter.endDate);
//         } else {
//             setStatus('initial');
//             setApiData([]);
//         }
//     }, [dateFilter, fetchData]);

//     const { chartData, suggestions } = useMemo(() => {
//         if (!apiData || apiData.length === 0) return { chartData: [], suggestions: [] };

//         const aggregated = {};
//         const suggestionSet = new Set();

//         apiData.forEach(dailyData => {
//             if (dailyData.msgSuggestion) suggestionSet.add(dailyData.msgSuggestion);
//             Object.entries(dailyData).forEach(([key, value]) => {
//                 if (!isNaN(key) && typeof value === 'number' && value > 0) {
//                     const day = parseInt(key, 10);
//                     aggregated[day] = (aggregated[day] || 0) + value;
//                 }
//             });
//         });

//         const sortedChartData = Object.entries(aggregated)
//             .map(([day, count]) => ({ day: parseInt(day, 10), name: `วันที่ ${day}`, count }))
//             .sort((a, b) => a.day - b.day);
        
//         return { chartData: sortedChartData, suggestions: [...suggestionSet] };
//     }, [apiData]);

//     const handleTabChange = (event, newValue) => { setActiveTab(newValue); };
    
//     const renderContent = () => {
//         if (status === 'initial') return <Alert severity="info" sx={{m:2}}>กรุณาเลือกช่วงวันที่จากตัวกรองหลักด้านบน</Alert>;
//         if (status === 'loading') return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
//         if (status === 'error') return <Alert severity="error" sx={{m:2}}>{errorMessage}</Alert>;
//         if (status === 'empty') return <Alert severity="warning" sx={{m:2}}>ไม่พบข้อมูลในข่วงวันที่ที่เลือก</Alert>;

//         const target = cardConfig[activeTab].targetDays;
        
//         return (
//             <>
//                 <Box sx={{ height: 400, width: '100%', p: 2 }}>
//                     <ResponsiveContainer>
//                         <BarChart layout="vertical" data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
//                             <CartesianGrid strokeDasharray="3 3" />
//                             <XAxis type="number" domain={[0, dataMax => Math.ceil((dataMax * 1.1) / 10) * 10]} />
//                             <YAxis type="category" dataKey="name" width={80} />
//                             <Tooltip content={<CustomTooltip />} />
//                             <Legend />
//                             <ReferenceLine x={target} stroke={theme.palette.primary.main} strokeDasharray="3 3">
//                                 <Label value={`เป้าหมาย: ${target} วัน`} position="insideTopRight" fill={theme.palette.primary.main} />
//                             </ReferenceLine>
//                             <Bar dataKey="count" name="จำนวน (ใบ)">
//                                 {chartData.map((entry, index) => (
//                                     <Cell key={`cell-${index}`} fill={entry.day <= target ? theme.palette.success.main : theme.palette.error.main} />
//                                 ))}
//                             </Bar>
//                         </BarChart>
//                     </ResponsiveContainer>
//                 </Box>
//                 {suggestions.length > 0 && (
//                     <Box sx={{ p: 2, pt: 0 }}>
//                         <Typography variant="subtitle2" fontWeight="bold">ข้อเสนอแนะที่พบ:</Typography>
//                         <List dense>
//                             {suggestions.map((msg, index) => (
//                                 <ListItem key={index}>
//                                     <ListItemIcon sx={{minWidth: 32}}><CommentIcon fontSize="small" color="action"/></ListItemIcon>
//                                     <ListItemText primary={msg} />
//                                 </ListItem>
//                             ))}
//                         </List>
//                     </Box>
//                 )}
//             </>
//         );
//     };
    
//     const title = useMemo(() => {
//         const baseTitle = cardConfig[activeTab].title;
//         if (dateFilter && dateFilter.startDate && dateFilter.endDate) {
//             const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
//             const start = new Date(dateFilter.startDate).toLocaleDateString('th-TH', options);
//             const end = new Date(dateFilter.endDate).toLocaleDateString('th-TH', options);
//             return `${baseTitle} วันที่: ${start} ถึง ${end}`;
//         }
//         return baseTitle;
//     }, [activeTab, dateFilter, cardConfig]);

//     return (
//         <Card sx={{ mt: 3, boxShadow: 3 }}>
//             <CardContent sx={{ pb: 2, '&:last-child': { pb: 2 } }}>
//                 <Typography variant="h6" fontWeight="bold" align="center" gutterBottom>{title}</Typography>
//                 <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
//                     <Tabs value={activeTab} onChange={handleTabChange} centered>
//                         <Tab label="CN ขาดส่ง" value="43" />
//                         <Tab label="CN เสื่อมคุณภาพ" value="42" />
//                     </Tabs>
//                 </Box>
//                 {renderContent()}
//             </CardContent>
//         </Card>
//     );
// };

// export default CnProcessTimeCard;

// ```

// ### **สรุปการเปลี่ยนแปลง:**

// *   **แก้ไข `import` statement:** ผมได้ตรวจสอบและนำ `import` ทั้งหมดที่จำเป็นกลับเข้ามาในบรรทัดแรก:
//     ```javascript
//     import React, { useState, useEffect, useCallback, useMemo } from 'react';
//     ```
// *   **ลบ `DateFilterCard`:** ผมได้ลบ `import DateFilterCard` ที่ไม่จำเป็นออกจากไฟล์นี้ด้วย

// ขออภัยอย่างสูงอีกครั้งสำหรับความผิดพลาดนี้ครับ ผมได้ตรวจสอบโค้ดชุดนี้อย่างละเอียดแล้ว และมั่นใจว่าจะสามารถ Build ได้สำเร็จและทำงานได้อย่างถูกต้องครับ

///////////////////////
// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import { Card, CardContent, Box, Typography, Tabs, Tab, useTheme, CircularProgress, Alert, Paper, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ReferenceLine, Label } from 'recharts';
// import CommentIcon from '@mui/icons-material/Comment';
// // ลบ DateFilterCard ออกจาก import
// import apiService from '../../api/apiService';

// // Component ย่อยสำหรับ Tooltip ของกราฟ
// const CustomTooltip = ({ active, payload }) => {
//     if (active && payload && payload.length) {
//         return (
//             <Paper elevation={3} sx={{ p: 1.5, backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
//                 <Typography variant="subtitle2" sx={{ mb: 1 }}>{payload[0].payload.name}</Typography>
//                 <Typography variant="body2">{`จำนวน: ${payload[0].value.toLocaleString()} (ใบ)`}</Typography>
//             </Paper>
//         );
//     }
//     return null;
// };

// const CnProcessTimeCard = ({ dateFilter }) => {
//     const theme = useTheme();
//     const [activeTab, setActiveTab] = useState('43');
//     const [apiData, setApiData] = useState([]);
//     const [status, setStatus] = useState('initial');
//     const [errorMessage, setErrorMessage] = useState('');

//     const cardConfig = useMemo(() => ({
//         '43': {
//             title: "ระยะเวลา ดำเนินการ CN ขาดส่ง",
//             targetDays: parseInt(process.env.REACT_APP_CN_PROCESS_43_TARGET, 10) || 3,
//             apiCall: apiService.getCnProcess43App,
//         },
//         '42': {
//             title: "ระยะเวลา ดำเนินการ CN เสื่อมคุณภาพ",
//             targetDays: parseInt(process.env.REACT_APP_CN_PROCESS_42_TARGET, 10) || 5,
//             apiCall: apiService.getCnProcess42App,
//         }
//     }), []);

//     const fetchData = useCallback(async (startDate, endDate) => {
//         if (!startDate || !endDate) { setStatus('initial'); setApiData([]); return; }
//         setStatus('loading');
//         try {
//             const result = await cardConfig[activeTab].apiCall(startDate, endDate);
//             if (result.success && Array.isArray(result.data?.data)) {
//                 setApiData(result.data.data);
//                 setStatus(result.data.data.length > 0 ? 'success' : 'empty');
//             } else { throw new Error(result.error || 'Invalid data format'); }
//         } catch (err) {
//             setApiData([]); setStatus('error'); setErrorMessage(err.message || 'ไม่สามารถดึงข้อมูลได้');
//         }
//     }, [activeTab, cardConfig]);

//     useEffect(() => {
//         if (dateFilter && dateFilter.startDate && dateFilter.endDate) {
//             fetchData(dateFilter.startDate, dateFilter.endDate);
//         } else {
//             setStatus('initial');
//             setApiData([]);
//         }
//     }, [dateFilter, fetchData]);

//     const { chartData, suggestions } = useMemo(() => {
//         if (!apiData || apiData.length === 0) return { chartData: [], suggestions: [] };

//         const aggregated = {};
//         const suggestionSet = new Set();

//         apiData.forEach(dailyData => {
//             if (dailyData.msgSuggestion) suggestionSet.add(dailyData.msgSuggestion);
//             Object.entries(dailyData).forEach(([key, value]) => {
//                 if (!isNaN(key) && typeof value === 'number' && value > 0) {
//                     const day = parseInt(key, 10);
//                     aggregated[day] = (aggregated[day] || 0) + value;
//                 }
//             });
//         });

//         const sortedChartData = Object.entries(aggregated)
//             .map(([day, count]) => ({ day: parseInt(day, 10), name: `วันที่ ${day}`, count }))
//             .sort((a, b) => a.day - b.day);
        
//         return { chartData: sortedChartData, suggestions: [...suggestionSet] };
//     }, [apiData]);

//     const handleTabChange = (event, newValue) => { setActiveTab(newValue); };
    
//     const renderContent = () => {
//         if (status === 'initial') return <Alert severity="info" sx={{m:2}}>กรุณาเลือกช่วงวันที่จากตัวกรองหลักด้านบน</Alert>;
//         if (status === 'loading') return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
//         if (status === 'error') return <Alert severity="error" sx={{m:2}}>{errorMessage}</Alert>;
//         if (status === 'empty') return <Alert severity="warning" sx={{m:2}}>ไม่พบข้อมูลในข่วงวันที่ที่เลือก</Alert>;

//         const target = cardConfig[activeTab].targetDays;
        
//         return (
//             <>
//                 <Box sx={{ height: 400, width: '100%', p: 2 }}>
//                     <ResponsiveContainer>
//                         <BarChart layout="vertical" data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
//                             <CartesianGrid strokeDasharray="3 3" />
//                             <XAxis type="number" domain={[0, dataMax => Math.ceil((dataMax * 1.1) / 10) * 10]} />
//                             <YAxis type="category" dataKey="name" width={80} />
//                             <Tooltip content={<CustomTooltip />} />
//                             <Legend />
//                             <ReferenceLine x={target} stroke={theme.palette.primary.main} strokeDasharray="3 3">
//                                 <Label value={`เป้าหมาย: ${target} วัน`} position="insideTopRight" fill={theme.palette.primary.main} />
//                             </ReferenceLine>
//                             <Bar dataKey="count" name="จำนวน (ใบ)">
//                                 {chartData.map((entry, index) => (
//                                     <Cell key={`cell-${index}`} fill={entry.day <= target ? theme.palette.success.main : theme.palette.error.main} />
//                                 ))}
//                             </Bar>
//                         </BarChart>
//                     </ResponsiveContainer>
//                 </Box>
//                 {suggestions.length > 0 && (
//                     <Box sx={{ p: 2, pt: 0 }}>
//                         <Typography variant="subtitle2" fontWeight="bold">ข้อเสนอแนะที่พบ:</Typography>
//                         <List dense>
//                             {suggestions.map((msg, index) => (
//                                 <ListItem key={index}>
//                                     <ListItemIcon sx={{minWidth: 32}}><CommentIcon fontSize="small" color="action"/></ListItemIcon>
//                                     <ListItemText primary={msg} />
//                                 </ListItem>
//                             ))}
//                         </List>
//                     </Box>
//                 )}
//             </>
//         );
//     };
    
//     const title = useMemo(() => {
//         const baseTitle = cardConfig[activeTab].title;
//         if (dateFilter && dateFilter.startDate && dateFilter.endDate) {
//             const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
//             const start = new Date(dateFilter.startDate).toLocaleDateString('th-TH', options);
//             const end = new Date(dateFilter.endDate).toLocaleDateString('th-TH', options);
//             return `${baseTitle} วันที่: ${start} ถึง ${end}`;
//         }
//         return baseTitle;
//     }, [activeTab, dateFilter, cardConfig]);

//     return (
//         <Card sx={{ mt: 3, boxShadow: 3 }}>
//             <CardContent sx={{ pb: 2, '&:last-child': { pb: 2 } }}>
//                 <Typography variant="h6" fontWeight="bold" align="center" gutterBottom>{title}</Typography>
//                 <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
//                     <Tabs value={activeTab} onChange={handleTabChange} centered>
//                         <Tab label="CN ขาดส่ง" value="43" />
//                         <Tab label="CN เสื่อมคุณภาพ" value="42" />
//                     </Tabs>
//                 </Box>
//                 {renderContent()}
//             </CardContent>
//         </Card>
//     );
// };

// export default CnProcessTimeCard;