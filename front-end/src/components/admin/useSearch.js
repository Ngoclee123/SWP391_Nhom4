import { useState, useCallback } from 'react';

const useSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    clearFilters: useCallback(() => {
      setSearchTerm('');
      setStatusFilter('all');
    }, [])
  };
};

<<<<<<< HEAD
export default useSearch; 
=======
export default useSearch;
>>>>>>> ngocle_new
