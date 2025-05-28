import { useState } from 'react';

export const useToast = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  return {
    showToast,
    toastMessage,
    setShowToast,
    showMessage,
  };
};
