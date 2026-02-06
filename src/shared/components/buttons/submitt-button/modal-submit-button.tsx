import React from 'react';
import { IonIcon } from '@ionic/react';
import { checkmarkOutline } from 'ionicons/icons';
import './modal-submit-button.css';

interface ModalSubmitButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  text: string;
  icon?: string;
}

const ModalSubmitButton: React.FC<ModalSubmitButtonProps> = ({
  onClick,
  isLoading = false,
  loadingText = 'Speichert...',
  text,
  icon = checkmarkOutline,
}) => {
  return (
    <button className="modal-glass-button-submit" onClick={onClick}>
      <IonIcon icon={icon} className="modal-button-icon" />
      <span className="modal-button-text">
        {isLoading ? loadingText : text}
      </span>
    </button>
  );
};

export default ModalSubmitButton;
