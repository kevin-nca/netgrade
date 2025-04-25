import React from 'react';
import { IonItem, IonLabel, IonIcon, IonToggle, IonInput } from '@ionic/react';

interface SettingsItemProps {
  icon?: string;
  label: string;
  sublabel?: string;
  type?: 'toggle' | 'input' | 'button' | 'select';
  inputType?:
    | 'text'
    | 'password'
    | 'number'
    | 'email'
    | 'tel'
    | 'url'
    | 'search'
    | 'date'
    | 'time'
    | 'datetime-local'
    | 'month'
    | 'week';
  value?: any;
  placeholder?: string;
  onChange?: (value: any) => void;
  onClick?: () => void;
  detail?: boolean;
  children?: React.ReactNode;
  color?: string;
}

const SettingsItem: React.FC<SettingsItemProps> = ({
  icon,
  label,
  sublabel,
  type = 'button',
  inputType = 'text',
  value,
  placeholder,
  onChange,
  onClick,
  detail = false,
  children,
  color,
}) => {
  return (
    <IonItem
      button={type === 'button' || type === 'select'}
      detail={detail}
      className="ios-item"
      onClick={onClick}
    >
      {icon && (
        <IonIcon
          icon={icon}
          slot="start"
          className="settings-icon"
          color={color}
        />
      )}

      {type === 'input' ? (
        <>
          <IonLabel position="stacked" color={color}>
            {label}
          </IonLabel>
          <IonInput
            value={value}
            placeholder={placeholder}
            type={inputType}
            onIonChange={(e) => onChange && onChange(e.detail.value!)}
            clearInput
            className="ios-input"
          />
        </>
      ) : (
        <IonLabel color={color}>
          {label}
          {sublabel && <p>{sublabel}</p>}
        </IonLabel>
      )}

      {type === 'toggle' && (
        <IonToggle
          checked={value}
          onIonChange={(e) => onChange && onChange(e.detail.checked)}
          mode="ios"
          className="ios-toggle"
        />
      )}

      {children}
    </IonItem>
  );
};

export default SettingsItem;
