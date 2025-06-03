import React from 'react';
import { IonInput, IonItem, IonLabel, IonToast } from '@ionic/react';

interface ValidatedNumberInputProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  validation: (value: number) => string | null;
  step?: string;
  min?: string;
  max?: string;
}

const ValidatedNumberInput: React.FC<ValidatedNumberInputProps> = ({
  label,
  value,
  onChange,
  validation,
  step = '1',
  min,
  max,
}) => {
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleInputChange = (e: CustomEvent) => {
    const inputValue = e.detail.value;
    const parsedValue = parseFloat(inputValue);

    if (isNaN(parsedValue)) {
      setErrorMessage('Bitte eine gültige Zahl eingeben.');
      onChange(0);
      return;
    }

    const error = validation(parsedValue);
    if (error) {
      setErrorMessage(error);
      onChange(0);
    } else {
      setErrorMessage(null);
      onChange(parsedValue);
    }
  };

  return (
    <>
      <IonItem
        style={{
          '--border-width': '0px',
          '--border-style': 'none',
          '--border-color': 'transparent',
          '--inner-border-width': '0px',
          '--show-full-highlight': '0',
          '--show-inset-highlight': '0',
          '--highlight-height': '0px',
        }}
      >
        {label && <IonLabel position="stacked">{label}</IonLabel>}
        <IonInput
          type="number"
          value={value}
          onIonChange={handleInputChange}
          step={step}
          min={min}
          max={max}
        />
      </IonItem>
      <IonToast
        isOpen={!!errorMessage}
        onDidDismiss={() => setErrorMessage(null)}
        message={errorMessage || ''}
        duration={2000}
        color="danger"
      />
    </>
  );
};

export default ValidatedNumberInput;
