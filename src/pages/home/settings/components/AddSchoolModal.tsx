import React, { useState } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';

interface SchoolFormData {
  name: string;
}

interface AddSchoolModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  onSubmit: (schoolData: SchoolFormData) => void;
}

const AddSchoolModal: React.FC<AddSchoolModalProps> = ({
  isOpen,
  onDismiss,
  onSubmit,
}) => {
  const [schoolData, setSchoolData] = useState<SchoolFormData>({
    name: '',
  });

  const updateField = (value: string) => {
    setSchoolData({ name: value });
  };

  const handleSubmit = () => {
    if (schoolData.name.trim()) {
      onSubmit(schoolData);
      setSchoolData({ name: '' });
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDismiss}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={onDismiss}>Abbrechen</IonButton>
          </IonButtons>
          <IonTitle>Neue Schule</IonTitle>
          <IonButtons slot="end">
            <IonButton
              onClick={handleSubmit}
              strong={true}
              disabled={!schoolData.name.trim()}
            >
              Hinzufügen
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonGrid>
          <IonRow>
            <IonCol>
              <IonList>
                <IonItem>
                  <IonLabel position="stacked">Name der Schule</IonLabel>
                  <IonInput
                    value={schoolData.name}
                    placeholder="Name der Schule eingeben"
                    onIonChange={(e) => updateField(e.detail.value!)}
                    clearInput
                    autofocus
                  />
                </IonItem>
              </IonList>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonModal>
  );
};

export default AddSchoolModal;
