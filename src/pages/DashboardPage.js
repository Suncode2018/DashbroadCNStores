import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, CircularProgress, Alert, AlertTitle } from '@mui/material';
import { WarningAmber as WarningIcon, BrokenImage as BrokenImageIcon } from '@mui/icons-material';
import Swal from 'sweetalert2';
import DateFilterCard from '../components/dashboard/DateFilterCard';
import CnChartsCard from '../components/dashboard/CnChartsCard';
import CnDefectChartCard from '../components/dashboard/CnDefectChartCard';
import CnProcessTimeCard from '../components/dashboard/CnProcessTimeCard';
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
    
    const result = await apiService.getCnReportByDate(startDate, endDate);
    
    if (result.success) {
      const actualData = result.data?.data; 
      if (Array.isArray(actualData) && actualData.length > 0) {
        setApiData(actualData);
        setStatus('success');
      } else {
        setApiData([]);
        setStatus('empty');
      }
    } else {
      setErrorMessage(result.error);
      Swal.fire({
        icon: 'error',
        title: 'ไม่สามารถโหลดข้อมูลได้',
        text: result.error,
        confirmButtonText: 'ตกลง'
      }).then(() => {
        setStatus('initial');
        setApiData([]);
      });
    }
  }, []);

  useEffect(() => {
    if (dateFilter) {
      fetchCnData(dateFilter.startDate, dateFilter.endDate);
    }
  }, [dateFilter, fetchCnData]);

  const handleRetry = useCallback(() => {
    if (dateFilter) {
        fetchCnData(dateFilter.startDate, dateFilter.endDate);
    }
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

    return { chartData, summaryData: { total43, total42, totalAll }, summaryStats, config: { unit, dataKeys: { total: `ทั้งหมด (${unit})`, type43: `ขาดส่ง (${unit})`, type42: `เสื่อมคุณภาพ (${unit})` }, colors: { type43: '#f44336', type42: '#ff9800' } } };
  }, [apiData]);
  
  const byCountConfig = useMemo(() => createChartConfig('ใบ', 'countCnNoALL', 'countCnNo43ALL', 'countCnNo42ALL'), [createChartConfig]);
  const byPackConfig = useMemo(() => createChartConfig('แพ็ค', 'sumQtyPackALL', 'sumQtyPack43ALL', 'sumQtyPack42ALL'), [createChartConfig]);
  const byPieceConfig = useMemo(() => createChartConfig('ชิ้น', 'sumQtyPCSALL', 'sumQtyPCS43ALL', 'sumQtyPCS42ALL'), [createChartConfig]);
  const byBahtConfig = useMemo(() => createChartConfig('บาท', 'sumBahtCNALL', 'sumBahtCN43', 'sumBahtCN42'), [createChartConfig]);

  return (
    <Box sx={{ p: 3 }}>
      <DateFilterCard onFilterChange={setDateFilter} />
      
      {status === 'initial' && (
          <Alert severity="info" sx={{ mt: 2 }}>
              <AlertTitle>เริ่มต้นใช้งาน</AlertTitle>
              กรุณาเลือกช่วงวันที่ที่ต้องการและกด "ค้นหา" เพื่อแสดงข้อมูล
          </Alert>
      )}
      {status === 'loading' && <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>}

      {status !== 'loading' && status !== 'initial' && (
        <>
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

          {status === 'success' && defectCardTitle && (
            <CnDefectChartCard
              status={status}
              title={defectCardTitle}
              apiData={apiData}
              icon={<WarningIcon sx={{ color: 'error.main' }} />}
              color="error"
              defectType="43"
            />
          )}
          
          {status === 'success' && qualityCardTitle && (
            <CnDefectChartCard
              status={status}
              title={qualityCardTitle}
              apiData={apiData}
              icon={<BrokenImageIcon sx={{ color: 'warning.main' }} />}
              color="warning"
              defectType="42"
            />
          )}

          <CnProcessTimeCard dateFilter={dateFilter} />
        </>
      )}
    </Box>
  );
};

export default DashboardPage;

