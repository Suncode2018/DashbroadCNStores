import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { WarningAmber as WarningIcon, BrokenImage as BrokenImageIcon } from '@mui/icons-material';
import DateFilterCard from '../components/dashboard/DateFilterCard';
import CnChartsCard from '../components/dashboard/CnChartsCard';
import CnDefectSummaryCard from '../components/dashboard/CnDefectSummaryCard';
import apiService from '../api/apiService';

const DashboardPage = () => {
  const [dateFilter, setDateFilter] = useState(null);
  const [apiData, setApiData] = useState([]);
  const [status, setStatus] = useState('initial');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchCnData = useCallback(async (startDate, endDate) => {
    if (!startDate || !endDate) { setStatus('initial'); setApiData([]); return; }
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
      } else { throw new Error(result.error); }
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

  const dateRangeString = useMemo(() => {
    const baseTitle = 'ภาพรวมข้อมูล CN CDC-บางบัวทอง';
    if (dateFilter && dateFilter.startDate && dateFilter.endDate) {
      const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
      const startDate = new Date(dateFilter.startDate).toLocaleDateString('th-TH', options);
      const endDate = new Date(dateFilter.endDate).toLocaleDateString('th-TH', options);
      return `${baseTitle} วันที่: ${startDate} ถึง ${endDate}`;
    }
    return baseTitle;
  }, [dateFilter]);

  const defectCardTitle = useMemo(() => {
    const baseTitle = 'CN ขาดส่ง CDC-บางบัวทอง';
    if (dateFilter && dateFilter.startDate && dateFilter.endDate) {
      const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
      const startDate = new Date(dateFilter.startDate).toLocaleDateString('th-TH', options);
      const endDate = new Date(dateFilter.endDate).toLocaleDateString('th-TH', options);
      return `${baseTitle} วันที่: ${startDate} ถึง ${endDate}`;
    }
    return null;
  }, [dateFilter]);

  const qualityCardTitle = useMemo(() => {
    const baseTitle = 'CN เสื่อมคุณภาพ CDC-บางบัวทอง';
    if (dateFilter && dateFilter.startDate && dateFilter.endDate) {
      const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
      const startDate = new Date(dateFilter.startDate).toLocaleDateString('th-TH', options);
      const endDate = new Date(dateFilter.endDate).toLocaleDateString('th-TH', options);
      return `${baseTitle} วันที่: ${startDate} ถึง ${endDate}`;
    }
    return null;
  }, [dateFilter]);

  const createChartConfig = useCallback((unit, totalKey, key43, key42) => {
    const chartData = apiData.map(item => ({
      date: new Date(item.DeliveryDate).toLocaleString('th-TH', { day: 'numeric', month: 'short' }),
      tooltipDate: new Date(item.DeliveryDate).toLocaleString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }),
      [`ทั้งหมด (${unit})`]: item[totalKey],
      [`ขาดส่ง (${unit})`]: item[key43],
      [`เสื่อมคุณภาพ (${unit})`]: item[key42],
      msgSuggestion: item.msgSuggestion || '',
    }));
    const total43 = apiData.reduce((sum, item) => sum + item[key43], 0);
    const total42 = apiData.reduce((sum, item) => sum + item[key42], 0);
    const totalAll = total43 + total42;
    
    let summaryStats = { average: 0, maxDay: { value: 0, date: '-' }, minDay: { value: 0, date: '-' } };
    if (apiData.length > 0) {
        const formatDate = (dateString) => new Date(dateString).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const maxDayObject = apiData.reduce((max, day) => day[totalKey] > max[totalKey] ? day : max, apiData[0]);
        const minDayObject = apiData.reduce((min, day) => day[totalKey] < min[totalKey] ? day : min, apiData[0]);
        summaryStats = {
            average: Math.round(totalAll / apiData.length),
            maxDay: { value: maxDayObject[totalKey], date: formatDate(maxDayObject.DeliveryDate) },
            minDay: { value: minDayObject[totalKey], date: formatDate(minDayObject.DeliveryDate) }
        };
    }

    return {
      chartData,
      summaryData: { total43, total42, totalAll },
      summaryStats,
      config: {
        unit: unit,
        dataKeys: { total: `ทั้งหมด (${unit})`, type43: `ขาดส่ง (${unit})`, type42: `เสื่อมคุณภาพ (${unit})` },
        colors: { type43: '#f44336', type42: '#ff9800' },
      }
    };
  }, [apiData]);
  
  const byCountConfig = useMemo(() => createChartConfig('ใบ', 'countCnNoALL', 'countCnNo43ALL', 'countCnNo42ALL'), [createChartConfig]);
  const byPackConfig = useMemo(() => createChartConfig('แพ็ค', 'sumQtyPackALL', 'sumQtyPack43ALL', 'sumQtyPack42ALL'), [createChartConfig]);
  const byPieceConfig = useMemo(() => createChartConfig('ชิ้น', 'sumQtyPCSALL', 'sumQtyPCS43ALL', 'sumQtyPCS42ALL'), [createChartConfig]);
  const byBahtConfig = useMemo(() => createChartConfig('บาท', 'sumBahtCNALL', 'sumBahtCN43', 'sumBahtCN42'), [createChartConfig]);

  return (
    <Box sx={{ p: 3 }}>
      <DateFilterCard onFilterChange={setDateFilter} />

      {status === 'loading' && <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>}

      {/* **[MODIFIED]** จัดลำดับการแสดงผล Card ใหม่ตามนี้ */}

      {/* ลำดับที่ 1: Card ภาพรวม (กราฟ) */}
      {status !== 'loading' && (
        <CnChartsCard
          status={status}
          errorMessage={errorMessage}
          onRetry={handleRetry}
          dateRangeString={dateRangeString} 
          apiData={apiData}
          byCountConfig={byCountConfig}
          byPackConfig={byPackConfig}
          byPieceConfig={byPieceConfig}
          byBahtConfig={byBahtConfig}
        />
      )}

      {/* ลำดับที่ 2: Card CN ขาดส่ง */}
      {status === 'success' && defectCardTitle && (
        <CnDefectSummaryCard
          title={defectCardTitle}
          count={byCountConfig.summaryData.total43}
          pack={byPackConfig.summaryData.total43}
          piece={byPieceConfig.summaryData.total43}
          baht={byBahtConfig.summaryData.total43}
          icon={<WarningIcon sx={{ color: 'error.main' }} />}
          color="error"
        />
      )}

      {/* ลำดับที่ 3: Card CN เสื่อมคุณภาพ */}
      {status === 'success' && qualityCardTitle && (
        <CnDefectSummaryCard
          title={qualityCardTitle}
          count={byCountConfig.summaryData.total42}
          pack={byPackConfig.summaryData.total42}
          piece={byPieceConfig.summaryData.total42}
          baht={byBahtConfig.summaryData.total42}
          icon={<BrokenImageIcon sx={{ color: 'warning.main' }} />}
          color="warning"
        />
      )}

    </Box>
  );
};

export default DashboardPage;


////////////////////////////////////////////////////////////////////
// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import { Box, CircularProgress } from '@mui/material';
// // **[MODIFIED]** 1. Import Icons ที่จะใช้สำหรับ Card ใหม่
// import { WarningAmber as WarningIcon, BrokenImage as BrokenImageIcon } from '@mui/icons-material';
// import DateFilterCard from '../components/dashboard/DateFilterCard';
// import CnChartsCard from '../components/dashboard/CnChartsCard';
// import CnDefectSummaryCard from '../components/dashboard/CnDefectSummaryCard';
// import apiService from '../api/apiService';

// const DashboardPage = () => {
//   const [dateFilter, setDateFilter] = useState(null);
//   const [apiData, setApiData] = useState([]);
//   const [status, setStatus] = useState('initial');
//   const [errorMessage, setErrorMessage] = useState('');

//   const fetchCnData = useCallback(async (startDate, endDate) => {
//     if (!startDate || !endDate) { setStatus('initial'); setApiData([]); return; }
//     setStatus('loading');
//     try {
//       const result = await apiService.getCnReportByDate(startDate, endDate);
//       if (result.success) {
//         if (Array.isArray(result.data?.data) && result.data.data.length > 0) {
//           setApiData(result.data.data);
//           setStatus('success');
//         } else {
//           setApiData([]);
//           setStatus('empty');
//         }
//       } else { throw new Error(result.error); }
//     } catch (err) {
//       setApiData([]);
//       setStatus('error');
//       setErrorMessage(err.message || 'ไม่สามารถดึงข้อมูลได้');
//     }
//   }, []);

//   useEffect(() => {
//     fetchCnData(dateFilter?.startDate, dateFilter?.endDate);
//   }, [dateFilter, fetchCnData]);

//   const handleRetry = useCallback(() => {
//     fetchCnData(dateFilter?.startDate, dateFilter?.endDate);
//   }, [dateFilter, fetchCnData]);

//   const dateRangeString = useMemo(() => {
//     const baseTitle = 'ภาพรวมข้อมูล CN CDC-บางบัวทอง';
//     if (dateFilter && dateFilter.startDate && dateFilter.endDate) {
//       const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
//       const startDate = new Date(dateFilter.startDate).toLocaleDateString('th-TH', options);
//       const endDate = new Date(dateFilter.endDate).toLocaleDateString('th-TH', options);
//       return `${baseTitle} วันที่: ${startDate} ถึง ${endDate}`;
//     }
//     return baseTitle;
//   }, [dateFilter]);

//   const defectCardTitle = useMemo(() => {
//     const baseTitle = 'CN ขาดส่ง CDC-บางบัวทอง';
//     if (dateFilter && dateFilter.startDate && dateFilter.endDate) {
//       const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
//       const startDate = new Date(dateFilter.startDate).toLocaleDateString('th-TH', options);
//       const endDate = new Date(dateFilter.endDate).toLocaleDateString('th-TH', options);
//       return `${baseTitle} วันที่: ${startDate} ถึง ${endDate}`;
//     }
//     return null;
//   }, [dateFilter]);

//   // **[NEW]** 2. สร้าง Title แบบไดนามิกสำหรับ Card "เสื่อมคุณภาพ"
//   const qualityCardTitle = useMemo(() => {
//     const baseTitle = 'CN เสื่อมคุณภาพ CDC-บางบัวทอง';
//     if (dateFilter && dateFilter.startDate && dateFilter.endDate) {
//       const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
//       const startDate = new Date(dateFilter.startDate).toLocaleDateString('th-TH', options);
//       const endDate = new Date(dateFilter.endDate).toLocaleDateString('th-TH', options);
//       return `${baseTitle} วันที่: ${startDate} ถึง ${endDate}`;
//     }
//     return null;
//   }, [dateFilter]);

//   const createChartConfig = useCallback((unit, totalKey, key43, key42) => {
//     const chartData = apiData.map(item => ({
//       date: new Date(item.DeliveryDate).toLocaleString('th-TH', { day: 'numeric', month: 'short' }),
//       tooltipDate: new Date(item.DeliveryDate).toLocaleString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }),
//       [`ทั้งหมด (${unit})`]: item[totalKey],
//       [`ขาดส่ง (${unit})`]: item[key43],
//       [`เสื่อมคุณภาพ (${unit})`]: item[key42],
//       msgSuggestion: item.msgSuggestion || '',
//     }));
//     const total43 = apiData.reduce((sum, item) => sum + item[key43], 0);
//     const total42 = apiData.reduce((sum, item) => sum + item[key42], 0);
//     const totalAll = total43 + total42;
    
//     let summaryStats = { average: 0, maxDay: { value: 0, date: '-' }, minDay: { value: 0, date: '-' } };
//     if (apiData.length > 0) {
//         const formatDate = (dateString) => new Date(dateString).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
//         const maxDayObject = apiData.reduce((max, day) => day[totalKey] > max[totalKey] ? day : max, apiData[0]);
//         const minDayObject = apiData.reduce((min, day) => day[totalKey] < min[totalKey] ? day : min, apiData[0]);
//         summaryStats = {
//             average: Math.round(totalAll / apiData.length),
//             maxDay: { value: maxDayObject[totalKey], date: formatDate(maxDayObject.DeliveryDate) },
//             minDay: { value: minDayObject[totalKey], date: formatDate(minDayObject.DeliveryDate) }
//         };
//     }

//     return {
//       chartData,
//       summaryData: { total43, total42, totalAll },
//       summaryStats,
//       config: {
//         unit: unit,
//         dataKeys: { total: `ทั้งหมด (${unit})`, type43: `ขาดส่ง (${unit})`, type42: `เสื่อมคุณภาพ (${unit})` },
//         colors: { type43: '#f44336', type42: '#ff9800' },
//       }
//     };
//   }, [apiData]);
  
//   const byCountConfig = useMemo(() => createChartConfig('ใบ', 'countCnNoALL', 'countCnNo43ALL', 'countCnNo42ALL'), [createChartConfig]);
//   const byPackConfig = useMemo(() => createChartConfig('แพ็ค', 'sumQtyPackALL', 'sumQtyPack43ALL', 'sumQtyPack42ALL'), [createChartConfig]);
//   const byPieceConfig = useMemo(() => createChartConfig('ชิ้น', 'sumQtyPCSALL', 'sumQtyPCS43ALL', 'sumQtyPCS42ALL'), [createChartConfig]);
//   const byBahtConfig = useMemo(() => createChartConfig('บาท', 'sumBahtCNALL', 'sumBahtCN43', 'sumBahtCN42'), [createChartConfig]);

//   return (
//     <Box sx={{ p: 3 }}>
//       <DateFilterCard onFilterChange={setDateFilter} />

//       {status === 'loading' && <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>}

//       {status === 'success' && defectCardTitle && (
//         <CnDefectSummaryCard
//           title={defectCardTitle}
//           count={byCountConfig.summaryData.total43}
//           pack={byPackConfig.summaryData.total43}
//           piece={byPieceConfig.summaryData.total43}
//           baht={byBahtConfig.summaryData.total43}
//           icon={<WarningIcon sx={{ color: 'error.main' }} />}
//           color="error"
//         />
//       )}

//       {/* **[NEW]** 3. เพิ่ม Card "เสื่อมคุณภาพ" ต่อท้าย Card "ขาดส่ง" */}
//       {status === 'success' && qualityCardTitle && (
//         <CnDefectSummaryCard
//           title={qualityCardTitle}
//           count={byCountConfig.summaryData.total42}
//           pack={byPackConfig.summaryData.total42}
//           piece={byPieceConfig.summaryData.total42}
//           baht={byBahtConfig.summaryData.total42}
//           icon={<BrokenImageIcon sx={{ color: 'warning.main' }} />}
//           color="warning"
//         />
//       )}

//       {status !== 'loading' && (
//         <CnChartsCard
//           status={status}
//           errorMessage={errorMessage}
//           onRetry={handleRetry}
//           dateRangeString={dateRangeString} 
//           apiData={apiData}
//           byCountConfig={byCountConfig}
//           byPackConfig={byPackConfig}
//           byPieceConfig={byPieceConfig}
//           byBahtConfig={byBahtConfig}
//         />
//       )}
//     </Box>
//   );
// };

// export default DashboardPage;


///////////////////////////////////////////////////////////////////////
// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import { Box, CircularProgress } from '@mui/material';
// import DateFilterCard from '../components/dashboard/DateFilterCard';
// import CnChartsCard from '../components/dashboard/CnChartsCard';
// import CnDefectSummaryCard from '../components/dashboard/CnDefectSummaryCard'; // 1. Import Card ใหม่
// import apiService from '../api/apiService';

// const DashboardPage = () => {
//   const [dateFilter, setDateFilter] = useState(null);
//   const [apiData, setApiData] = useState([]);
//   const [status, setStatus] = useState('initial');
//   const [errorMessage, setErrorMessage] = useState('');

//   const fetchCnData = useCallback(async (startDate, endDate) => {
//     if (!startDate || !endDate) { setStatus('initial'); setApiData([]); return; }
//     setStatus('loading');
//     try {
//       const result = await apiService.getCnReportByDate(startDate, endDate);
//       if (result.success) {
//         if (Array.isArray(result.data?.data) && result.data.data.length > 0) {
//           setApiData(result.data.data);
//           setStatus('success');
//         } else {
//           setApiData([]);
//           setStatus('empty');
//         }
//       } else { throw new Error(result.error); }
//     } catch (err) {
//       setApiData([]);
//       setStatus('error');
//       setErrorMessage(err.message || 'ไม่สามารถดึงข้อมูลได้');
//     }
//   }, []);

//   useEffect(() => {
//     fetchCnData(dateFilter?.startDate, dateFilter?.endDate);
//   }, [dateFilter, fetchCnData]);

//   const handleRetry = useCallback(() => {
//     fetchCnData(dateFilter?.startDate, dateFilter?.endDate);
//   }, [dateFilter, fetchCnData]);

//   const dateRangeString = useMemo(() => {
//     const baseTitle = 'ภาพรวมข้อมูล CN CDC-บางบัวทอง';
//     if (dateFilter && dateFilter.startDate && dateFilter.endDate) {
//       const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
//       const startDate = new Date(dateFilter.startDate).toLocaleDateString('th-TH', options);
//       const endDate = new Date(dateFilter.endDate).toLocaleDateString('th-TH', options);
//       return `${baseTitle} วันที่: ${startDate} ถึง ${endDate}`;
//     }
//     return baseTitle;
//   }, [dateFilter]);

//   // 2. สร้าง Title แบบไดนามิกสำหรับ Card "ขาดส่ง"
//   const defectCardTitle = useMemo(() => {
//     const baseTitle = 'CN ขาดส่ง CDC-บางบัวทอง';
//     if (dateFilter && dateFilter.startDate && dateFilter.endDate) {
//       const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
//       const startDate = new Date(dateFilter.startDate).toLocaleDateString('th-TH', options);
//       const endDate = new Date(dateFilter.endDate).toLocaleDateString('th-TH', options);
//       return `${baseTitle} วันที่: ${startDate} ถึง ${endDate}`;
//     }
//     return null; // ถ้ายังไม่เลือกวัน จะไม่แสดง Card นี้
//   }, [dateFilter]);

//   const createChartConfig = useCallback((unit, totalKey, key43, key42) => {
//     const chartData = apiData.map(item => ({
//       date: new Date(item.DeliveryDate).toLocaleString('th-TH', { day: 'numeric', month: 'short' }),
//       tooltipDate: new Date(item.DeliveryDate).toLocaleString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }),
//       [`ทั้งหมด (${unit})`]: item[totalKey],
//       [`ขาดส่ง (${unit})`]: item[key43],
//       [`เสื่อมคุณภาพ (${unit})`]: item[key42],
//       msgSuggestion: item.msgSuggestion || '',
//     }));
//     const total43 = apiData.reduce((sum, item) => sum + item[key43], 0);
//     const total42 = apiData.reduce((sum, item) => sum + item[key42], 0);
//     const totalAll = total43 + total42;
    
//     let summaryStats = { average: 0, maxDay: { value: 0, date: '-' }, minDay: { value: 0, date: '-' } };
//     if (apiData.length > 0) {
//         const formatDate = (dateString) => new Date(dateString).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
//         const maxDayObject = apiData.reduce((max, day) => day[totalKey] > max[totalKey] ? day : max, apiData[0]);
//         const minDayObject = apiData.reduce((min, day) => day[totalKey] < min[totalKey] ? day : min, apiData[0]);
//         summaryStats = {
//             average: Math.round(totalAll / apiData.length),
//             maxDay: { value: maxDayObject[totalKey], date: formatDate(maxDayObject.DeliveryDate) },
//             minDay: { value: minDayObject[totalKey], date: formatDate(minDayObject.DeliveryDate) }
//         };
//     }

//     return {
//       chartData,
//       summaryData: { total43, total42, totalAll },
//       summaryStats,
//       config: {
//         unit: unit,
//         dataKeys: { total: `ทั้งหมด (${unit})`, type43: `ขาดส่ง (${unit})`, type42: `เสื่อมคุณภาพ (${unit})` },
//         colors: { type43: '#f44336', type42: '#ff9800' },
//       }
//     };
//   }, [apiData]);
  
//   const byCountConfig = useMemo(() => createChartConfig('ใบ', 'countCnNoALL', 'countCnNo43ALL', 'countCnNo42ALL'), [createChartConfig]);
//   const byPackConfig = useMemo(() => createChartConfig('แพ็ค', 'sumQtyPackALL', 'sumQtyPack43ALL', 'sumQtyPack42ALL'), [createChartConfig]);
//   const byPieceConfig = useMemo(() => createChartConfig('ชิ้น', 'sumQtyPCSALL', 'sumQtyPCS43ALL', 'sumQtyPCS42ALL'), [createChartConfig]);
//   const byBahtConfig = useMemo(() => createChartConfig('บาท', 'sumBahtCNALL', 'sumBahtCN43', 'sumBahtCN42'), [createChartConfig]);

//   return (
//     <Box sx={{ p: 3 }}>
//       <DateFilterCard onFilterChange={setDateFilter} />

//       {status === 'loading' && <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>}

//       {/* 3. เพิ่มเงื่อนไขการแสดง Card ใหม่ที่นี่ */}
//       {status === 'success' && defectCardTitle && (
//         <CnDefectSummaryCard
//           title={defectCardTitle}
//           count={byCountConfig.summaryData.total43}
//           pack={byPackConfig.summaryData.total43}
//           piece={byPieceConfig.summaryData.total43}
//           baht={byBahtConfig.summaryData.total43}
//         />
//       )}

//       {status !== 'loading' && (
//         <CnChartsCard
//           status={status}
//           errorMessage={errorMessage}
//           onRetry={handleRetry}
//           dateRangeString={dateRangeString} 
//           apiData={apiData}
//           byCountConfig={byCountConfig}
//           byPackConfig={byPackConfig}
//           byPieceConfig={byPieceConfig}
//           byBahtConfig={byBahtConfig}
//         />
//       )}
//     </Box>
//   );
// };

// export default DashboardPage;


/////////////////////////////////////////////////////////////////////
// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import { Box, CircularProgress } from '@mui/material';
// import DateFilterCard from '../components/dashboard/DateFilterCard';
// import CnChartsCard from '../components/dashboard/CnChartsCard';
// import apiService from '../api/apiService';

// const DashboardPage = () => {
//   const [dateFilter, setDateFilter] = useState(null);
//   const [apiData, setApiData] = useState([]);
//   const [status, setStatus] = useState('initial');
//   const [errorMessage, setErrorMessage] = useState('');

//   const fetchCnData = useCallback(async (startDate, endDate) => {
//     if (!startDate || !endDate) {
//       setStatus('initial');
//       setApiData([]);
//       return;
//     }
//     setStatus('loading');
//     try {
//       const result = await apiService.getCnReportByDate(startDate, endDate);
//       if (result.success) {
//         if (Array.isArray(result.data?.data) && result.data.data.length > 0) {
//           setApiData(result.data.data);
//           setStatus('success');
//         } else {
//           setApiData([]);
//           setStatus('empty');
//         }
//       } else {
//         throw new Error(result.error);
//       }
//     } catch (err) {
//       setApiData([]);
//       setStatus('error');
//       setErrorMessage(err.message || 'ไม่สามารถดึงข้อมูลได้');
//     }
//   }, []);

//   useEffect(() => {
//     fetchCnData(dateFilter?.startDate, dateFilter?.endDate);
//   }, [dateFilter, fetchCnData]);

//   const handleRetry = useCallback(() => {
//     fetchCnData(dateFilter?.startDate, dateFilter?.endDate);
//   }, [dateFilter, fetchCnData]);

//   const dateRangeString = useMemo(() => {
//     const baseTitle = 'ภาพรวมข้อมูล CN CDC-บางบัวทอง';
//     if (dateFilter && dateFilter.startDate && dateFilter.endDate) {
//       const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
//       const startDate = new Date(dateFilter.startDate).toLocaleDateString('th-TH', options);
//       const endDate = new Date(dateFilter.endDate).toLocaleDateString('th-TH', options);
//       return `${baseTitle} วันที่: ${startDate} ถึง ${endDate}`;
//     }
//     return baseTitle;
//   }, [dateFilter]);

//   // **[MODIFIED]** 1. ห่อหุ้ม createChartConfig ด้วย useCallback
//   // และระบุว่าฟังก์ชันนี้จะเปลี่ยนเมื่อ apiData เปลี่ยนเท่านั้น
//   const createChartConfig = useCallback((unit, totalKey, key43, key42) => {
//     const chartData = apiData.map(item => ({
//       date: new Date(item.DeliveryDate).toLocaleString('th-TH', { day: 'numeric', month: 'short' }),
//       tooltipDate: new Date(item.DeliveryDate).toLocaleString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }),
//       [`ทั้งหมด (${unit})`]: item[totalKey],
//       [`ขาดส่ง (${unit})`]: item[key43],
//       [`เสื่อมคุณภาพ (${unit})`]: item[key42],
//       msgSuggestion: item.msgSuggestion || '',
//     }));
//     const total43 = apiData.reduce((sum, item) => sum + item[key43], 0);
//     const total42 = apiData.reduce((sum, item) => sum + item[key42], 0);
//     const totalAll = total43 + total42;
    
//     let summaryStats = { average: 0, maxDay: { value: 0, date: '-' }, minDay: { value: 0, date: '-' } };
//     if (apiData.length > 0) {
//         const formatDate = (dateString) => new Date(dateString).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
//         const maxDayObject = apiData.reduce((max, day) => day[totalKey] > max[totalKey] ? day : max, apiData[0]);
//         const minDayObject = apiData.reduce((min, day) => day[totalKey] < min[totalKey] ? day : min, apiData[0]);
//         summaryStats = {
//             average: Math.round(totalAll / apiData.length),
//             maxDay: { value: maxDayObject[totalKey], date: formatDate(maxDayObject.DeliveryDate) },
//             minDay: { value: minDayObject[totalKey], date: formatDate(minDayObject.DeliveryDate) }
//         };
//     }

//     return {
//       chartData,
//       summaryData: { total43, total42, totalAll },
//       summaryStats,
//       config: {
//         unit: unit,
//         dataKeys: { total: `ทั้งหมด (${unit})`, type43: `ขาดส่ง (${unit})`, type42: `เสื่อมคุณภาพ (${unit})` },
//         colors: { type43: '#f44336', type42: '#ff9800' },
//       }
//     };
//   }, [apiData]); // ระบุ dependency คือ apiData
  
//   // **[MODIFIED]** 2. เพิ่ม createChartConfig เข้าไปใน dependency array ของ useMemo
//   const byCountConfig = useMemo(() => createChartConfig('ใบ', 'countCnNoALL', 'countCnNo43ALL', 'countCnNo42ALL'), [createChartConfig]);
//   const byPackConfig = useMemo(() => createChartConfig('แพ็ค', 'sumQtyPackALL', 'sumQtyPack43ALL', 'sumQtyPack42ALL'), [createChartConfig]);
//   const byPieceConfig = useMemo(() => createChartConfig('ชิ้น', 'sumQtyPCSALL', 'sumQtyPCS43ALL', 'sumQtyPCS42ALL'), [createChartConfig]);
//   const byBahtConfig = useMemo(() => createChartConfig('บาท', 'sumBahtCNALL', 'sumBahtCN43', 'sumBahtCN42'), [createChartConfig]);

//   return (
//     <Box sx={{ p: 3 }}>
//       <DateFilterCard onFilterChange={setDateFilter} />

//       {status === 'loading' && <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>}

//       {status !== 'loading' && (
//         <CnChartsCard
//           status={status}
//           errorMessage={errorMessage}
//           onRetry={handleRetry}
//           dateRangeString={dateRangeString} 
//           apiData={apiData}
//           byCountConfig={byCountConfig}
//           byPackConfig={byPackConfig}
//           byPieceConfig={byPieceConfig}
//           byBahtConfig={byBahtConfig}
//         />
//       )}
//     </Box>
//   );
// };

// export default DashboardPage;


