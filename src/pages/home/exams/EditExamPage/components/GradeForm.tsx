import React, { useState, useCallback } from 'react';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
} from '@ionic/react';
import {
  ribbonOutline,
  checkmarkCircleOutline,
  trophyOutline,
  scaleOutline,
  chatbubbleOutline,
} from 'ionicons/icons';
import {
  GlassForm,
  GlassFormSection,
  GlassInput,
  GlassTextarea,
  GlassButton,
} from '@/components/GlassForm';
import { validateGrade, validateWeight } from '@/utils/validation';
import { GradeFormData } from '../types';
import styles from '../styles/GradeForm.module.css';

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
  const [errors, setErrors] = useState<
    Partial<Record<keyof GradeFormData, string>>
  >({});

  const handleScoreChange = useCallback(
    (value: number) => {
      const error = validateGrade(value);
      setErrors((prev) => ({ ...prev, score: error || undefined }));
      onFieldChange('score', value);
    },
    [onFieldChange],
  );

  const handleWeightChange = useCallback(
    (value: number) => {
      const error = validateWeight(value);
      setErrors((prev) => ({ ...prev, weight: error || undefined }));
      onFieldChange('weight', value);
    },
    [onFieldChange],
  );

  const handleCommentChange = useCallback(
    (value: string) => {
      onFieldChange('comment', value || '');
    },
    [onFieldChange],
  );

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof GradeFormData, string>> = {};

    const gradeError = validateGrade(formValues.score);
    if (gradeError) newErrors.score = gradeError;

    const weightError = validateWeight(formValues.weight);
    if (weightError) newErrors.weight = weightError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit();
    }
  };

  return (
    <div style={{ padding: '16px' }}>
      {/* Warning Card */}
      <IonCard className={styles.warningCard}>
        <IonCardHeader className={styles.warningCardHeader}>
          <IonCardTitle className={styles.warningCardTitle}>
            <IonIcon icon={ribbonOutline} className={styles.formItemIcon} />
            Prüfung abschliessen
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <p className={styles.warningCardText}>
            Nach dem Eintragen der Note wird die Prüfung als erledigt markiert
            und aus den anstehenden Prüfungen entfernt.
          </p>
        </IonCardContent>
      </IonCard>

      <GlassForm onSubmit={handleSubmit}>
        <GlassFormSection
          title="Note eintragen"
          subtitle="Bewertung und Gewichtung festlegen"
          icon={trophyOutline}
        >
          <GlassInput
            label="Note (1 bis 6)"
            value={formValues.score}
            onChange={handleScoreChange}
            variant="number"
            icon={trophyOutline}
            required
            error={errors.score}
            min={1}
            max={6}
            step={0.1}
            helperText="Gib eine Note zwischen 1.0 und 6.0 ein"
          />

          <GlassInput
            label="Gewichtung (0 bis 100%)"
            value={formValues.weight}
            onChange={handleWeightChange}
            variant="number"
            icon={scaleOutline}
            required
            error={errors.weight}
            min={0}
            max={100}
            step={1}
            helperText="Gewichtung der Note in Prozent"
          />

          <GlassTextarea
            label="Kommentar (optional)"
            value={formValues.comment}
            onChange={handleCommentChange}
            placeholder="Notizen zur Note..."
            icon={chatbubbleOutline}
            rows={3}
            maxLength={500}
            autoGrow
          />
        </GlassFormSection>

        <GlassButton
          variant="primary"
          onClick={handleSubmit}
          icon={checkmarkCircleOutline}
          fullWidth
        >
          Note eintragen
        </GlassButton>
      </GlassForm>
    </div>
  );
};
