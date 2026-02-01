import { useEffect, useRef } from 'react';
import { wsClient } from '../lib/websocket';

export const useWebSocket = () => {
  const connectedRef = useRef(false);

  useEffect(() => {
    if (!connectedRef.current) {
      wsClient.connect();
      connectedRef.current = true;
    }

    return () => {
      // Don't disconnect on unmount, let it persist
    };
  }, []);

  return {
    isConnected: wsClient.isConnected(),
    subscribe: wsClient.subscribe.bind(wsClient),
    unsubscribe: wsClient.unsubscribe.bind(wsClient),
    emit: wsClient.emit.bind(wsClient),
  };
};