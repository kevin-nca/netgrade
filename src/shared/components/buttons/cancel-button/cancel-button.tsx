import React from 'react';
import { IonIcon } from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import './cancel-button.css';

interface CancelButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  text: string;
  icon?: string;
}

const CancelButton: React.FC<CancelButtonProps> = ({
  onClick,
  disabled = false,
  isLoading = false,
  loadingText = 'Wird abgebrochen...',
  text,
  icon = closeOutline,
}) => {
  return (
    <>
      <div className="button-section-cancel">
        <button
          className="glass-button-cancel primary"
          onClick={onClick}
          disabled={disabled || isLoading}
        >
          <IonIcon icon={icon} className="button-icon" />
          <span className="button-text">{isLoading ? loadingText : text}</span>
        </button>
      </div>

      <div className="bottom-spacer" />
    </>
  );
};

export default CancelButton;
