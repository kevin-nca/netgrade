import React, { useEffect } from 'react';

interface IOSToastProps {
  message: string;
  isVisible: boolean;
  onDismiss: () => void;
  type?: 'success' | 'error';
  duration?: number;
}

const IOSToast: React.FC<IOSToastProps> = ({
  message,
  isVisible,
  onDismiss,
  type = 'success',
  duration = 2000,
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onDismiss]);

  if (!isVisible) return null;

  return (
    <div
      className={`ios-toast ${type === 'success' ? 'success-toast' : 'error-toast'}`}
      onClick={onDismiss}
    >
      {message}
    </div>
  );
};

export default IOSToast;
