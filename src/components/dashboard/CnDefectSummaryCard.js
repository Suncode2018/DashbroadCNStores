import React from 'react';
import { Card, CardContent, Box, Typography, useTheme } from '@mui/material';
// ลบการ import Icon แบบเจาะจงออกไป เพราะจะรับมาจาก props แทน
import { StatItem } from './CnChartsCard';

// **[MODIFIED]** เพิ่ม props: 'icon' และ 'color' (พร้อมกำหนดค่า default)
const CnDefectSummaryCard = ({ title, count, pack, piece, baht, icon, color = 'error' }) => {
  const theme = useTheme();
  // **[MODIFIED]** ทำให้ valueColor เปลี่ยนตาม prop 'color' ที่ส่งเข้ามา
  const valueColor = theme.palette[color].dark;

  return (
    // **[MODIFIED]** ทำให้ borderColor เปลี่ยนตาม prop 'color'
    <Card sx={{ mb: 3, boxShadow: 3, borderColor: `${color}.main`, borderWidth: 1, borderStyle: 'solid' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
          {/* **[MODIFIED]** แสดง icon ที่ได้รับมาจาก props */}
          {icon}
          <Typography variant="h6" fontWeight="bold" component="div">
            {title}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
          <StatItem label="ทั้งหมด (ใบ)" value={count.toLocaleString()} valueColor={valueColor} />
          <StatItem label="ทั้งหมด (แพ็ค)" value={pack.toLocaleString()} valueColor={valueColor} />
          <StatItem label="ทั้งหมด (ชิ้น)" value={piece.toLocaleString()} valueColor={valueColor} />
          <StatItem label="ทั้งหมด (บาท)" value={baht.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} valueColor={valueColor} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default CnDefectSummaryCard;


///////////////////////////////////////
// import React from 'react';
// import { Card, CardContent, Box, Typography, useTheme } from '@mui/material';
// import { WarningAmber as WarningIcon } from '@mui/icons-material';
// import { StatItem } from './CnChartsCard'; // Import StatItem ที่เรา Export ไว้

// const CnDefectSummaryCard = ({ title, count, pack, piece, baht }) => {
//   const theme = useTheme();
//   const valueColor = theme.palette.error.dark; // ใช้สีโทนแดง/ส้มสำหรับ "ขาดส่ง"

//   return (
//     <Card sx={{ mb: 3, boxShadow: 3, borderColor: 'error.main', borderWidth: 1, borderStyle: 'solid' }}>
//       <CardContent>
//         <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
//           <WarningIcon sx={{ color: 'error.main' }} />
//           <Typography variant="h6" fontWeight="bold" component="div">
//             {title}
//           </Typography>
//         </Box>
//         <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
//           <StatItem label="ทั้งหมด (ใบ)" value={count.toLocaleString()} valueColor={valueColor} />
//           <StatItem label="ทั้งหมด (แพ็ค)" value={pack.toLocaleString()} valueColor={valueColor} />
//           <StatItem label="ทั้งหมด (ชิ้น)" value={piece.toLocaleString()} valueColor={valueColor} />
//           <StatItem label="ทั้งหมด (บาท)" value={baht.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} valueColor={valueColor} />
//         </Box>
//       </CardContent>
//     </Card>
//   );
// };

// export default CnDefectSummaryCard;