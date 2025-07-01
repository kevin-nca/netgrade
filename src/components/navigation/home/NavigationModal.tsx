import React, { Dispatch, SetStateAction } from 'react';
import { IonContent, IonItem, IonLabel, IonModal } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import Header from '@/components/Header/Header';

interface SlideUpProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const NavigationModal: React.FC<SlideUpProps> = ({ isOpen, setIsOpen }) => {
  const history = useHistory();

  const closeModal = () => setIsOpen(false);

  const goToTab2 = () => {
    closeModal();
    history.push('/main/home/grades/add');
  };

  const goToTab3 = () => {
    closeModal();
    history.push('/main/home/exams/add');
  };

  return (
    <IonModal
      isOpen={isOpen}
      onWillDismiss={closeModal}
      breakpoints={[0, 0.5, 1]}
      initialBreakpoint={0.8}
    >
      <Header title={'Eintragen'} backButton={false}></Header>
      <IonContent>
        <IonItem button onClick={goToTab2}>
          <IonLabel>Note</IonLabel>
        </IonItem>
        <IonItem button onClick={goToTab3}>
          <IonLabel>Anstehende Prüfung</IonLabel>
        </IonItem>
      </IonContent>
    </IonModal>
  );
};

export default NavigationModal;
