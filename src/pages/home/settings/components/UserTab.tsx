import React, { useState, useEffect } from 'react';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonList,
  useIonToast,
} from '@ionic/react';
import { personCircle, save } from 'ionicons/icons';
import { useUserName, useSaveUserName } from '@/hooks/queries';

const UserTab: React.FC = () => {
  const { data: userName, isLoading } = useUserName();
  const saveUserNameMutation = useSaveUserName();
  const [nameInput, setNameInput] = useState('');
  const [present] = useIonToast();

  useEffect(() => {
    if (userName) {
      setNameInput(userName);
    }
  }, [userName]);

  const handleSave = () => {
    if (nameInput.trim()) {
      saveUserNameMutation.mutate(nameInput.trim(), {
        onSuccess: () => {
          present({
            message: 'Name erfolgreich gespeichert',
            duration: 2000,
            position: 'bottom',
            color: 'success',
          });
        },
        onError: (error) => {
          present({
            message: `Fehler: ${error instanceof Error ? error.message : String(error)}`,
            duration: 2000,
            position: 'bottom',
            color: 'danger',
          });
        },
      });
    }
  };

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>
          <IonIcon icon={personCircle} />
          Benutzereinstellungen
        </IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonList>
          <IonItem>
            <IonLabel position="stacked">Dein Name</IonLabel>
            <IonInput
              value={nameInput}
              placeholder="Namen eingeben"
              onIonChange={(e) => setNameInput(e.detail.value || '')}
              disabled={isLoading || saveUserNameMutation.isPending}
            />
          </IonItem>
        </IonList>
        <IonButton
          expand="block"
          onClick={handleSave}
          disabled={
            isLoading || saveUserNameMutation.isPending || !nameInput.trim()
          }
        >
          <IonIcon icon={save} slot="start" />
          Speichern
        </IonButton>
      </IonCardContent>
    </IonCard>
  );
};

export default UserTab;
