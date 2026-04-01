import { IonAlert } from '@ionic/react';

interface AlertButtonProps {
  isOpen: boolean;
  onDismiss: () => void;
  onDelete: () => void;
}

const AlertButton = ({ isOpen, onDismiss, onDelete }: AlertButtonProps) => {
  return (
    <IonAlert
      isOpen={isOpen}
      onDidDismiss={onDismiss}
      header="Schule löschen?"
      message={`Möchtest du die Schule wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`}
      buttons={[
        {
          text: 'Abbrechen',
          role: 'cancel',
          handler: onDismiss,
        },
        {
          text: 'Löschen',
          role: 'destructive',
          handler: onDelete,
        },
      ]}
    />
  );
};

export default AlertButton;
