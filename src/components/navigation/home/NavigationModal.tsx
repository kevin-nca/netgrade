import React, { Dispatch, SetStateAction, useRef } from 'react';
import { IonContent, IonItem, IonLabel, IonModal } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import Header from '@/components/Header/Header';

interface SlideUpProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const NavigationModal: React.FC<SlideUpProps> = ({ isOpen, setIsOpen }) => {
  const history = useHistory();
  const pendingNavigation = useRef<string | null>(null);

  const handleDismiss = () => {
    setIsOpen(false);
    if (pendingNavigation.current) {
      history.push(pendingNavigation.current);
      pendingNavigation.current = null;
    }
  };

  const navigateTo = (path: string) => {
    pendingNavigation.current = path;
    setIsOpen(false);
  };

  const goToTab2 = () => {
    navigateTo('/main/home/grades/add');
  };

  const goToTab3 = () => {
    navigateTo('/main/home/exams/add');
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={handleDismiss}
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
