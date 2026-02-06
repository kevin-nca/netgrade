import React from 'react';
import { IonIcon } from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import './modal-cancel-button.css';

interface ModalCancelButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  text: string;
  icon?: string;
}

const ModalCancelButton: React.FC<ModalCancelButtonProps> = ({
  onClick,
  disabled = false,
  isLoading = false,
  loadingText = 'Wird abgebrochen...',
  text,
  icon = closeOutline,
}) => {
  return (
    <button
      className="modal-glass-button-cancel"
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      <IonIcon icon={icon} className="modal-button-icon" />
      <span className="modal-button-text">
        {isLoading ? loadingText : text}
      </span>
    </button>
  );
};

export default ModalCancelButton;
