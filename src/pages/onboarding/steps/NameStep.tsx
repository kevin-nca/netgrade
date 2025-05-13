import React, { useState } from 'react';
import {
  IonCard,
  IonCardContent,
  IonRow,
  IonCol,
  IonText,
  IonButton,
  IonIcon,
} from '@ionic/react';
import { arrowForward } from 'ionicons/icons';
import FormField from '@/components/Form/FormField';
import { useSaveUserName } from '@/hooks';

interface NameStepProps {
  initialName: string;
  onNameSaved: (name: string) => void;
  showMessage: (
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
      showMessage('Bitte gib deinen Namen ein', 'warning');
      return;
    }

    saveUserNameMutation.mutate(userName.trim(), {
      onSuccess: () => {
        onNameSaved(userName.trim());
      },
      onError: (error) => {
        showMessage(
          `Fehler: ${error instanceof Error ? error.message : String(error)}`,
          'danger',
        );
      },
    });
  };

  return (
    <IonCard className="ion-no-margin">
      <IonCardContent className="ion-padding">
        <IonRow>
          <IonCol>
            <IonText className="ion-text-center">
              <h4>Willkommen!</h4>
              <p>Wie heisst du?</p>
            </IonText>
          </IonCol>
        </IonRow>

        <FormField
          label=""
          value={userName}
          onChange={(value) => setUserName(String(value))}
          placeholder="Namen eingeben"
        />

        <IonRow className="ion-margin-top">
          <IonCol className="ion-text-end">
            <IonButton
              onClick={handleSaveName}
              size="default"
              disabled={saveUserNameMutation.isPending}
            >
              {saveUserNameMutation.isPending
                ? 'Wird gespeichert...'
                : 'Weiter'}
              <IonIcon slot="end" icon={arrowForward} />
            </IonButton>
          </IonCol>
        </IonRow>
      </IonCardContent>
    </IonCard>
  );
};
