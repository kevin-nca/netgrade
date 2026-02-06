import React from 'react';
import { IonIcon } from '@ionic/react';
import { addOutline } from 'ionicons/icons';
import '@/shared/components/buttons/submitt-button/submit-button.css';

interface SubmitButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  text: string;
  icon?: string;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  onClick,
  disabled = false,
  isLoading = false,
  loadingText = 'Wird hinzugefügt...',
  text,
  icon = addOutline,
}) => {
  return (
    <>
      <div className="button-section">
        <button
          className="glass-button primary"
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

export default SubmitButton;
