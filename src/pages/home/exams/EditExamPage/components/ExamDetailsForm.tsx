import React from 'react';
import {
  IonCard,
  IonList,
  IonItem,
  IonItemGroup,
  IonItemDivider,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonButton,
  IonIcon,
  IonSpinner,
} from '@ionic/react';
import {
  documentTextOutline,
  calendarOutline,
  schoolOutline,
  saveOutline,
} from 'ionicons/icons';
import { Subject } from '@/db/entities';
import { ExamFormApi, ExamFormData } from '../types';
import styles from '../styles/FormCommon.module.css';

interface ExamDetailsFormProps {
  examForm: ExamFormApi;
  subjects: Subject[];
  isSubmitting: boolean;
}

export const ExamDetailsForm: React.FC<ExamDetailsFormProps> = ({
  examForm,
  subjects,
  isSubmitting,
}) => {
  const handleTitleChange = (value: string) => {
    examForm.setFieldValue('title', value || '');
  };

  const handleDateChange = (value: string) => {
    examForm.setFieldValue('date', value || '');
  };

  const handleSubjectChange = (value: string) => {
    examForm.setFieldValue('subject', value);
  };

  const handleDescriptionChange = (value: string) => {
    examForm.setFieldValue('description', value || '');
  };

  const handleSubmit = () => {
    examForm.handleSubmit();
  };

  const formValues = examForm.state.values as ExamFormData;

  return (
    <IonCard className={styles.formCard}>
      <div className={styles.formCardHeader}>
        <h2 className={styles.formCardTitle}>Prüfungsdetails bearbeiten</h2>
      </div>

      <IonList className={styles.formCardContent}>
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
              value={formValues.title}
              onIonChange={(e) => handleTitleChange(e.detail.value || '')}
              placeholder="Prüfungstitel"
              required
              className={styles.formInput}
            />
          </IonItem>
        </IonItemGroup>

        <IonItemGroup className={styles.formItemGroup}>
          <IonItemDivider className={styles.formItemDivider}>
            <IonIcon
              icon={calendarOutline}
              slot="start"
              color="primary"
              className={styles.formItemIcon}
            />
            <IonLabel color="primary" className={styles.formItemLabel}>
              Prüfungsdatum
            </IonLabel>
          </IonItemDivider>
          <IonItem className={styles.formItem}>
            <IonInput
              type="date"
              value={formValues.date}
              onIonChange={(e) => handleDateChange(e.detail.value || '')}
              required
              className={styles.formInput}
            />
          </IonItem>
        </IonItemGroup>

        <IonItemGroup className={styles.formItemGroup}>
          <IonItemDivider className={styles.formItemDivider}>
            <IonIcon
              icon={schoolOutline}
              slot="start"
              color="primary"
              className={styles.formItemIcon}
            />
            <IonLabel color="primary" className={styles.formItemLabel}>
              Fach
            </IonLabel>
          </IonItemDivider>
          <IonItem className={styles.formItem}>
            <IonSelect
              value={formValues.subject}
              onIonChange={(e) => handleSubjectChange(e.detail.value)}
              placeholder="Fach wählen"
              required
              className={styles.formInput}
              interface="popover"
            >
              {subjects.map((subject) => (
                <IonSelectOption key={subject.id} value={subject.id}>
                  {subject.name}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
        </IonItemGroup>

        <IonItemGroup className={styles.formItemGroup}>
          <IonItemDivider className={styles.formItemDivider}>
            <IonIcon
              icon={documentTextOutline}
              slot="start"
              color="primary"
              className={styles.formItemIcon}
            />
            <IonLabel color="primary" className={styles.formItemLabel}>
              Beschreibung (optional)
            </IonLabel>
          </IonItemDivider>
          <IonItem className={styles.formItem}>
            <IonTextarea
              value={formValues.description}
              onIonChange={(e) => handleDescriptionChange(e.detail.value || '')}
              placeholder="Notizen zur Prüfung..."
              rows={3}
              className={styles.formInput}
            />
          </IonItem>
        </IonItemGroup>
      </IonList>

      <div className={styles.formCardFooter}>
        <IonButton
          expand="block"
          className={styles.formButton}
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className={styles.buttonContent}>
              <IonSpinner name="crescent" className={styles.spinner} />
              Wird gespeichert...
            </div>
          ) : (
            <div className={styles.buttonContentSave}>
              <IonIcon icon={saveOutline} className={styles.saveIcon} />
              Änderungen speichern
            </div>
          )}
        </IonButton>
      </div>
    </IonCard>
  );
};
