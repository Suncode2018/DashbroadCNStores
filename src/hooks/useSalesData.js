import { useState, useEffect } from 'react';
import apiService from '../services/api';
import { salesData as mockData } from '../data/mockData';
import config from '../config/config';

export const useSalesData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSalesData = async () => {
    setLoading(true);
    setError(null);

    try {
      if (config.isDevelopment) {
        // ลองดึงจาก API ก่อน ถ้าไม่ได้ใช้ mock data
        const result = await apiService.getSalesData();
        
        if (result.success) {
          setData(result.data);
        } else {
          console.warn('API ไม่พร้อมใช้งาน, ใช้ mock data แทน');
          setData(mockData);
        }
      } else {
        // Production ต้องใช้ API เท่านั้น
        const result = await apiService.getSalesData();
        
        if (result.success) {
          setData(result.data);
        } else {
          throw new Error(result.error);
        }
      }
    } catch (err) {
      setError(err.message);
      // ใช้ mock data เป็น fallback ใน development
      if (config.isDevelopment) {
        console.warn('ใช้ mock data เนื่องจาก:', err.message);
        setData(mockData);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchSalesData,
  };
};