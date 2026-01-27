import React from 'react';
import {
  IonCard,
  IonList,
  IonItem,
  IonItemGroup,
  IonItemDivider,
  IonLabel,
  IonTextarea,
  IonButton,
  IonIcon,
  IonRange,
  IonInput,
} from '@ionic/react';
import {
  checkmarkCircleOutline,
  trophyOutline,
  scaleOutline,
  chatbubbleOutline,
} from 'ionicons/icons';
import { GradeFormData } from './types';
import styles from './styles/grade-form.module.css';

interface GradeFormProps {
  formValues: GradeFormData;
  onFieldChange: <K extends keyof GradeFormData>(
    field: K,
    value: GradeFormData[K],
  ) => void;
  getGradeColor: (grade: number) => string;
  onSubmit: () => void;
}

export const GradeForm: React.FC<GradeFormProps> = ({
  formValues,
  onFieldChange,
  getGradeColor,
  onSubmit,
}) => {
  return (
    <>
      <IonCard className={styles.formCard}>
        <div className={styles.formCardHeader}>
          <h2 className={styles.formCardTitle}>Note eintragen</h2>
        </div>

        <IonList className={styles.formCardContent}>
          {/* Note Field */}
          <IonItemGroup className={styles.formItemGroup}>
            <IonItemDivider className={styles.formItemDivider}>
              <IonIcon
                icon={trophyOutline}
                slot="start"
                color="primary"
                className={styles.formItemIcon}
              />
              <IonLabel color="primary" className={styles.formItemLabel}>
                Note
              </IonLabel>
            </IonItemDivider>
            <IonItem className={styles.formItem}>
              <div className={styles.gradeInputContainer}>
                <div className={styles.gradeInputSmall}>
                  <IonInput
                    type="number"
                    value={formValues.score}
                    onIonInput={(e) =>
                      onFieldChange('score', parseFloat(e.detail.value!) || 1)
                    }
                    step="0.1"
                    min={1}
                    max={6}
                  />
                </div>
                <div className={styles.rangeContainer}>
                  <IonRange
                    value={formValues.score}
                    onIonChange={(e) =>
                      onFieldChange('score', e.detail.value as number)
                    }
                    min={1}
                    max={6}
                    step={0.5}
                    snaps
                    color={getGradeColor(formValues.score)}
                    className={styles.rangeInput}
                  />
                </div>
              </div>
            </IonItem>
          </IonItemGroup>

          {/* Weight Field */}
          <IonItemGroup className={styles.formItemGroup}>
            <IonItemDivider className={styles.formItemDivider}>
              <IonIcon
                icon={scaleOutline}
                slot="start"
                color="primary"
                className={styles.formItemIcon}
              />
              <IonLabel color="primary" className={styles.formItemLabel}>
                Gewichtung
              </IonLabel>
            </IonItemDivider>
            <IonItem className={styles.formItem}>
              <div className={styles.gradeInputContainer}>
                <div className={styles.gradeInputSmall}>
                  <IonInput
                    type="number"
                    value={formValues.weight}
                    onIonInput={(e) =>
                      onFieldChange('weight', parseFloat(e.detail.value!) || 0)
                    }
                    min={0}
                    max={100}
                  />
                </div>
                <div className={styles.rangeContainer}>
                  <IonRange
                    value={formValues.weight}
                    onIonChange={(e) =>
                      onFieldChange('weight', e.detail.value as number)
                    }
                    min={0}
                    max={100}
                    step={5}
                    snaps
                    className={styles.rangeInput}
                  />
                </div>
              </div>
            </IonItem>
          </IonItemGroup>

          {/* Comment Field */}
          <IonItemGroup className={styles.formItemGroup}>
            <IonItemDivider className={styles.formItemDivider}>
              <IonIcon
                icon={chatbubbleOutline}
                slot="start"
                color="primary"
                className={styles.formItemIcon}
              />
              <IonLabel color="primary" className={styles.formItemLabel}>
                Kommentar (optional)
              </IonLabel>
            </IonItemDivider>
            <IonItem className={styles.formItem}>
              <IonTextarea
                value={formValues.comment}
                onIonChange={(e) =>
                  onFieldChange('comment', e.detail.value || '')
                }
                placeholder="Notizen zur Note..."
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
            onClick={onSubmit}
          >
            <div className={styles.buttonContent}>
              <IonIcon
                icon={checkmarkCircleOutline}
                className={styles.saveIcon}
              />
              Note eintragen
            </div>
          </IonButton>
        </div>
      </IonCard>
    </>
  );
};
