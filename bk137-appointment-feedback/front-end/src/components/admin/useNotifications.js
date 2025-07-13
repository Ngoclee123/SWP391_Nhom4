import { useState, useCallback } from 'react';

const useNotifications = () => {
  const [count, setCount] = useState(3);
  const clearNotifications = useCallback(() => setCount(0), []);
  return { count, clearNotifications };
};

export default useNotifications;