import React, { useEffect, useState } from 'react';
import { IonContent, IonPage, IonToast } from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { addGrade } from '@/store/gradesSlice';
import { Subject } from '@/store/subjectsSlice';
import Button from '@/components/Button/Button';
import Header from '@/components/Header/Header';
import FormField from '@/components/Form/FormField';

const GradeAddingPage: React.FC = () => {
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [examName, setExamName] = useState('');
  const [date, setDate] = useState('');
  const [weight, setWeight] = useState(1);
  const [score, setScore] = useState(0);
  const [counts, setCounts] = useState(true);
  const [comment, setComment] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const history = useHistory();
  const dispatch = useDispatch();
  const { schoolId } = useParams<{ schoolId: string }>();

  useEffect(() => {
    if (schoolId) {
      setSelectedSchoolId(schoolId);
    }
  }, [schoolId]);

  const effectiveSchoolId = selectedSchoolId || schoolId;
  const schools = useSelector(
    (state: RootState) => state.schools.schools || [],
  );
  const subjects: Subject[] = useSelector(
    (state: RootState) => state.subjects[effectiveSchoolId] || [],
  );

  useEffect(() => {
    setSelectedSubject('');
  }, [selectedSchoolId]);

  const setShowToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const validateScore = (value: string) => {
    const parsedValue = parseFloat(value);
    if (value.includes('.') && value.split('.')[1].length > 2) {
      setScore(0);
      setShowToastMessage('Die Note darf maximal zwei Dezimalstellen haben.');
      return false;
    }
    if (parsedValue < 1 || parsedValue > 6) {
      setScore(0);
      setShowToastMessage('Die Note muss zwischen 1 und 6 liegen.');
      return false;
    }
    setScore(parsedValue);
    return true;
  };

  const validateWeight = (value: string) => {
    const parsedValue = parseFloat(value);
    if (value.includes('.') && value.split('.')[1].length > 2) {
      setWeight(0);
      setShowToastMessage(
        'Die Gewichtung darf maximal zwei Dezimalstellen haben.',
      );
      return false;
    }
    if (parsedValue <= 0 || parsedValue > 1) {
      setWeight(0);
      setShowToastMessage('Die Gewichtung muss zwischen 0 und 1 liegen.');
      return false;
    }
    setWeight(parsedValue);
    return true;
  };

  const handleAddGrade = () => {
    if (!selectedSubject) {
      setShowToastMessage('Bitte wähle ein Fach aus!');
      return;
    }
    if (!examName.trim()) {
      setShowToastMessage('Bitte gib einen Prüfungsnamen ein!');
      return;
    }
    if (
      !validateWeight(weight.toString()) ||
      !validateScore(score.toString())
    ) {
      return;
    }

    const newGrade = {
      subject: selectedSubject,
      examName: examName,
      date: date,
      weight: weight,
      score: score,
      counts: counts,
      comment: comment,
    };

    console.log('New Grade:', newGrade);
    dispatch(
      addGrade({
        schoolId: effectiveSchoolId,
        grade: newGrade,
      }),
    );

    setSelectedSchoolId('');
    setSelectedSubject('');
    setExamName('');
    setDate('');
    setWeight(1);
    setScore(0);
    setCounts(true);
    setComment('');

    history.push('/main/home');
  };

  return (
    <IonPage>
      <Header
        title={'Note hinzufügen'}
        backButton={true}
        defaultHref={'/main/home'}
      />
      <IonContent fullscreen>
        <FormField
          label="Schule"
          value={selectedSchoolId}
          onChange={(value) => setSelectedSchoolId(value)}
          type="select"
          options={schools.map((school) => ({
            value: school.id,
            label: school.name,
          }))}
        />

        <FormField
          label="Fach"
          value={selectedSubject}
          onChange={(value) => setSelectedSubject(value)}
          type="select"
          options={subjects.map((subject: Subject) => ({
            value: subject.id,
            label: subject.name,
          }))}
          disabled={!selectedSchoolId}
        />

        <FormField
          label="Prüfungsname"
          value={examName}
          onChange={(value) => setExamName(value)}
        />

        <FormField
          label="Datum"
          value={date}
          onChange={(value) => setDate(value)}
          type="date"
        />

        <FormField
          label="Gewichtung"
          value={weight}
          onChange={(value) => validateWeight(value)}
          type="number"
        />

        <FormField
          label="Note"
          value={score}
          onChange={(value) => validateScore(value)}
          type="number"
        />

        <FormField
          label="Note zählt"
          value={counts}
          onChange={(checked) => setCounts(checked)}
          type="toggle"
        />

        <FormField
          label="Kommentar"
          value={comment}
          onChange={(value) => setComment(value)}
          type="text"
        />

        <Button handleEvent={handleAddGrade} text={'Hinzufügen'} />
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          color="danger"
        />
      </IonContent>
    </IonPage>
  );
};

export default GradeAddingPage;
