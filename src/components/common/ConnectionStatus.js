import React from 'react';
import config from '../../config';

const ConnectionStatus = ({ connectionStatus }) => {
  React.useEffect(() => {
    if (config.debugMode && connectionStatus) {
      if (connectionStatus.success) {
        console.log('✅ API Connection: OK', connectionStatus.data?.message);
      } else {
        console.log('❌ API Connection: Failed', connectionStatus.error);
      }
    }
  }, [connectionStatus]);

  return null;
};

export default ConnectionStatus;


