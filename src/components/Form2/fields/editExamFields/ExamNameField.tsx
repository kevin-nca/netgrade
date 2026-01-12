import React from 'react';
import {
  IonIcon,
  IonInput,
  IonItem,
  IonItemDivider,
  IonItemGroup,
  IonLabel,
} from '@ionic/react';
import { documentTextOutline } from 'ionicons/icons';
import styles from '../../../../pages/home/exams/EditExamPage/styles/FormCommon.module.css';

interface ExamNameFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export const ExamNameField: React.FC<ExamNameFieldProps> = ({
  value,
  onChange,
  placeholder = 'Prüfungstitel',
  required = true,
}) => {
  const handleChange = (inputValue: string | null | undefined) => {
    onChange(inputValue || '');
  };

  return (
    <IonItemGroup className={styles.formItemGroup}>
      <IonItemDivider className={styles.formItemDivider}>
        <IonIcon
          icon={documentTextOutline}
          slot="start"
          color="primary"
          className={styles.formItemIcon}
        />
        <IonLabel color="primary" className={styles.formItemLabel}>
          Titel der Prüfung
        </IonLabel>
      </IonItemDivider>
      <IonItem className={styles.formItem}>
        <IonInput
          value={value}
          onIonInput={(e) => handleChange(e.detail.value)}
          placeholder={placeholder}
          required={required}
          className={styles.formInput}
        />
      </IonItem>
    </IonItemGroup>
  );
};
