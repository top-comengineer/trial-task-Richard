import React from 'react';
import { GlobalContext } from '@/context/useGlobalContext/useGlobalContext'

const useGlobalContext = () => {
  return React.useContext(GlobalContext);
}

export default useGlobalContext;