import React from 'react';
import { Chip } from '@mui/material';
import config from '../../config/config';

const EnvironmentBadge = () => {
  if (!config.debugMode || config.isProduction) {
    return null;
  }

  const getColor = () => {
    switch (config.environment) {
      case 'development':
        return 'primary';
      case 'staging':
        return 'warning';
      case 'production':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Chip
      label={`ENV: ${config.environment.toUpperCase()}`}
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