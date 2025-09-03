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
  step,
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
      {label ? (
        <IonItem>
          <IonLabel position="stacked">{label}</IonLabel>
          <IonInput
            type="number"
            value={value}
            onIonInput={handleInputChange}
            step={step}
            min={min}
            max={max}
          />
        </IonItem>
      ) : (
        <IonInput
          type="number"
          value={value}
          onIonChange={handleInputChange}
          step={step}
          min={min}
          max={max}
        />
      )}
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
