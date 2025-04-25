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
} from '@ionic/react';

interface SchoolFormData {
  name: string;
  type: string;
  address: string;
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
    type: '',
    address: '',
  });

  const updateField = (field: keyof SchoolFormData, value: string) => {
    setSchoolData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (schoolData.name.trim()) {
      onSubmit(schoolData);
      setSchoolData({ name: '', type: '', address: '' });
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDismiss} className="ios-modal">
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={onDismiss} className="modal-button">
              Abbrechen
            </IonButton>
          </IonButtons>
          <IonTitle>Neue Schule</IonTitle>
          <IonButtons slot="end">
            <IonButton
              onClick={handleSubmit}
              strong={true}
              disabled={!schoolData.name.trim()}
              className="modal-button"
            >
              Hinzufügen
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="modal-content">
          <IonList className="ios-list">
            <IonItem className="ios-item">
              <IonLabel position="stacked">Name der Schule</IonLabel>
              <IonInput
                value={schoolData.name}
                placeholder="Name der Schule eingeben"
                onIonChange={(e) => updateField('name', e.detail.value!)}
                clearInput
                autofocus
                className="ios-input"
              />
            </IonItem>
            <IonItem className="ios-item">
              <IonLabel position="stacked">Schultyp (optional)</IonLabel>
              <IonInput
                value={schoolData.type}
                placeholder="z.B. Gymnasium, Realschule"
                onIonChange={(e) => updateField('type', e.detail.value!)}
                className="ios-input"
              />
            </IonItem>
            <IonItem className="ios-item">
              <IonLabel position="stacked">Adresse (optional)</IonLabel>
              <IonInput
                value={schoolData.address}
                placeholder="Adresse der Schule"
                onIonChange={(e) => updateField('address', e.detail.value!)}
                className="ios-input"
              />
            </IonItem>
          </IonList>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default AddSchoolModal;
