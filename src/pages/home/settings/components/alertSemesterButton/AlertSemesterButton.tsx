import { IonAlert } from '@ionic/react';

interface AlertSemesterButtonProps {
  isOpen: boolean;
  onDismiss: () => void;
  onDelete: () => void;
}

const AlertSemesterButton = ({
  isOpen,
  onDismiss,
  onDelete,
}: AlertSemesterButtonProps) => {
  return (
    <IonAlert
      isOpen={isOpen}
      onDidDismiss={onDismiss}
      header="Semester löschen?"
      message="Möchtest du das Semester wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."
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

export default AlertSemesterButton;
