import React, { useState } from 'react';
import {
  IonCard,
  IonContent,
  IonItem,
  IonList,
  IonPage,
  IonTitle,
} from '@ionic/react';
import { useDispatch, useSelector } from 'react-redux';
import { addSchool } from '@/store/schoolsSlice';
import { useHistory } from 'react-router-dom';
import Button from '@/components/Button/Button';
import Header from '@/components/Header/Header';
import FormField from '@/components/Form/FormField';

const OnboardingPage: React.FC = () => {
  const [schoolName, setSchoolName] = useState('');

  const schools = useSelector(
    (state: { schools: { schools: { id: string; name: string }[] } }) =>
      state.schools.schools,
  );
  const dispatch = useDispatch();
  const history = useHistory();

  const handleAddSchool = () => {
    if (schoolName.trim()) {
      dispatch(addSchool(schoolName.trim()));
      setSchoolName('');
    }
  };

  const handleContinue = () => {
    history.push('/main/home');
  };

  return (
    <IonPage>
      <Header title={'Schulen hinzufügen'} backButton={false} />
      <IonContent className="onboarding-container">
        <IonCard className="onboarding-card">
          <FormField
            label={'Name der Schule'}
            value={schoolName}
            onChange={(value) => setSchoolName(value)}
            placeholder={'Name der Schule eingeben'}
          />
          <Button
            handleEvent={handleAddSchool}
            text={'Hinzufügen'}
            className="add-button"
          />
        </IonCard>

        <IonCard className="onboarding-card">
          <IonTitle size="small">Hinzugefügte Schulen</IonTitle>
          <IonList>
            {schools.length > 0 ? (
              schools.map((school) => (
                <IonItem key={school.id}>{school.name}</IonItem>
              ))
            ) : (
              <IonItem>Keine Schulen hinzugefügt.</IonItem>
            )}
          </IonList>
        </IonCard>
        <Button
          handleEvent={handleContinue}
          text={'Fortfahren'}
          className="continue-button"
        />
      </IonContent>
    </IonPage>
  );
};

export default OnboardingPage;
