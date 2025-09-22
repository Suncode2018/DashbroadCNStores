import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import DateFilterCard from '../components/dashboard/DateFilterCard';
import CnChartsCard from '../components/dashboard/CnChartsCard';
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
      } else {
        throw new Error(result.error);
      }
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
    if (dateFilter && dateFilter.startDate && dateFilter.endDate) {
      const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
      const startDate = new Date(dateFilter.startDate).toLocaleDateString('th-TH', options);
      const endDate = new Date(dateFilter.endDate).toLocaleDateString('th-TH', options);
      return `วันที่ ${startDate} ถึง ${endDate}`;
    }
    return 'กรุณาเลือกช่วงวันที่';
  }, [dateFilter]);

  const createChartConfig = (unit, totalKey, key43, key42) => {
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
  };
  
  const byCountConfig = useMemo(() => createChartConfig('ใบ', 'countCnNoALL', 'countCnNo43ALL', 'countCnNo42ALL'), [apiData]);
  const byPackConfig = useMemo(() => createChartConfig('แพ็ค', 'sumQtyPackALL', 'sumQtyPack43ALL', 'sumQtyPack42ALL'), [apiData]);
  const byPieceConfig = useMemo(() => createChartConfig('ชิ้น', 'sumQtyPCSALL', 'sumQtyPCS43ALL', 'sumQtyPCS42ALL'), [apiData]);
  const byBahtConfig = useMemo(() => createChartConfig('บาท', 'sumBahtCNALL', 'sumBahtCN43', 'sumBahtCN42'), [apiData]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        แดชบอร์ดภาพรวม CDC-บางบัวทอง
      </Typography>
      
      <DateFilterCard onFilterChange={setDateFilter} />

      {status === 'loading' && <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>}

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
    </Box>
  );
};

export default DashboardPage;

