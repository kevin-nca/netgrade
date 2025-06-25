import React, { useState } from 'react';
import { IonCard, IonCardContent, IonButton, IonIcon } from '@ionic/react';
import { arrowForward, personCircleOutline } from 'ionicons/icons';
import FormField from '@/components/Form/FormField';
import styles from './NameStep.module.css';
import { Layout } from '@/components/Layout/Layout';
import { useSaveUserName } from '@/hooks/queries';

interface NameStepProps {
  initialName: string;
  onNameSaved: (name: string) => void;
  showMessage?: (
    message: string,
    color?: 'success' | 'danger' | 'warning',
  ) => void;
}

export const NameStep: React.FC<NameStepProps> = ({
  initialName,
  onNameSaved,
  showMessage,
}) => {
  const [userName, setUserName] = useState(initialName);
  const saveUserNameMutation = useSaveUserName();

  const handleSaveName = () => {
    if (!userName.trim()) {
      showMessage?.('Bitte gib deinen Namen ein', 'warning');
      return;
    }

    saveUserNameMutation.mutate(userName.trim(), {
      onSuccess: () => {
        onNameSaved(userName.trim());
      },
      onError: (error) => {
        showMessage?.(
          `Fehler: ${error instanceof Error ? error.message : String(error)}`,
          'danger',
        );
      },
    });
  };

  return (
    <Layout>
      <IonCard className={`ion-no-margin ${styles.container}`}>
        <IonCardContent>
          <div className={styles.header}>
            <div className={styles.avatar}>
              <IonIcon icon={personCircleOutline} />
            </div>
            <h4 className={styles.title}>Willkommen!</h4>
            <p className={styles.subtitle}>Wie heisst du?</p>
          </div>

          <div className={styles.formField}>
            <FormField
              label=""
              value={userName}
              onChange={(value) => setUserName(String(value))}
              placeholder="Namen eingeben"
              inputProps={{
                className: 'styles.input',
                autoFocus: true,
                maxLength: 32,
              }}
            />
          </div>

          <div className={styles.buttonRow}>
            <IonButton
              onClick={handleSaveName}
              size="large"
              disabled={saveUserNameMutation.isPending}
              className={styles.nextButton}
            >
              {saveUserNameMutation.isPending
                ? 'Wird gespeichert....'
                : 'Weiter'}
              <IonIcon slot="end" icon={arrowForward} />
            </IonButton>
          </div>
        </IonCardContent>
      </IonCard>
    </Layout>
  );
};
