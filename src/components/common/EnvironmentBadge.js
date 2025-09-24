import React from 'react';
import { Chip } from '@mui/material';
import config from '../../config';

const EnvironmentBadge = () => {
  // 1. ตรวจสอบว่า debugMode เปิดอยู่หรือไม่
  if (!config.debugMode) {
    return null;
  }

  // 2. **[FIX]** ตรวจสอบว่ามีค่า environment หรือไม่ ถ้าไม่มีให้ใช้ค่า default 'UNKNOWN'
  const environmentName = config.environment || 'UNKNOWN';

  const getColor = () => {
    switch (environmentName) {
      case 'development': return 'primary';
      case 'staging': return 'warning';
      case 'production': return 'error';
      default: return 'default';
    }
  };

  return (
    <Chip
      // 3. **[FIX]** ใช้ตัวแปร environmentName ที่ปลอดภัยแล้ว
      label={`ENV: ${environmentName.toUpperCase()}`}
      color={getColor()}
      size="small"
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 9999,
        fontSize: '0.7rem',
      }}
    />
  );
};

export default EnvironmentBadge;

////////////////////////////////////
// import React from 'react';
// import { Chip } from '@mui/material';
// import config from '../../config';

// const EnvironmentBadge = () => {
//   if (!config.debugMode) return null;

//   const getColor = () => {
//     switch (config.environment) {
//       case 'development': return 'primary';
//       case 'staging': return 'warning';
//       case 'production': return 'error';
//       default: return 'default';
//     }
//   };

//   return (
//     <Chip
//       label={`ENV: ${config.environment.toUpperCase()}`}
//       color={getColor()}
//       size="small"
//       sx={{
//         position: 'fixed',
//         bottom: 16,
//         right: 16,
//         zIndex: 9999,
//         fontSize: '0.7rem',
//       }}
//     />
//   );
// };

// export default EnvironmentBadge;


