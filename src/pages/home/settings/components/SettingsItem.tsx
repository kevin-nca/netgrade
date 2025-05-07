import React from 'react';
import { IonItem, IonLabel, IonIcon, IonInput } from '@ionic/react';

interface SettingsItemProps {
  icon?: string;
  label: string;
  type?: 'button' | 'input';
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  onClick?: () => void;
  color?: string;
}

const SettingsItem: React.FC<SettingsItemProps> = ({
  icon,
  label,
  type = 'button',
  value,
  placeholder,
  onChange,
  onClick,
  color,
}) => {
  return (
    <IonItem button={type === 'button'} onClick={onClick}>
      {icon && <IonIcon icon={icon} slot="start" color={color} />}

      {type === 'input' ? (
        <>
          <IonLabel position="stacked" color={color}>
            {label}
          </IonLabel>
          <IonInput
            value={value}
            placeholder={placeholder}
            type="text"
            onIonChange={(e) => onChange && onChange(e.detail.value!)}
            clearInput
          />
        </>
      ) : (
        <IonLabel color={color}>{label}</IonLabel>
      )}
    </IonItem>
  );
};

export default SettingsItem;
