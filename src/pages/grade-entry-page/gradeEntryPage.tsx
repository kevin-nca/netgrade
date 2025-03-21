import React, { useState } from 'react';
import { IonContent, IonList, IonModal, IonPage, IonToast } from '@ionic/react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { deleteGrade, Grade, updateGrade } from '@/store/gradesSlice';
import { useParams } from 'react-router-dom';
import ValidatedNumberInput from '../validated-number-input/validatedNumberInput';
import Button from '@/components/Button/Button';
import Header from '@/components/Header/Header';
import GradeForm from '@/components/Form/GradeForm';
import GradeListItem from '@/components/List/GradeListItem';
import FormField from '@/components/Form/FormField';

const GradeEntryPage: React.FC = () => {
  const dispatch = useDispatch();
  const { schoolId, subjectId } = useParams<{
    schoolId: string;
    subjectId: string;
  }>();
  const grades = useSelector((state: RootState) =>
    (state.grades[schoolId] || []).filter(
      (grade) => grade.subject === subjectId,
    ),
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const [updatedGrade, setUpdatedGrade] = useState<Grade>({
    id: '',
    examName: '',
    score: 0,
    weight: 1,
    date: '',
    counts: true,
    comment: '',
    subject: subjectId || '',
  });

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const setShowToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const handleDelete = (gradeId: string) => {
    dispatch(deleteGrade({ schoolId, gradeId }));
    setShowToastMessage('Note erfolgreich gelöscht.');
  };

  const startEdit = (grade: Grade) => {
    setEditingId(grade.id);
    setUpdatedGrade(grade);
  };

  const saveEdit = () => {
    if (editingId !== null) {
      dispatch(
        updateGrade({
          schoolId,
          gradeId: editingId,
          updatedGrade: { ...updatedGrade, id: editingId },
        }),
      );
      setShowToastMessage('Note erfolgreich aktualisiert.');
      setEditingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleWeightValidation = (value: number) => {
    if (value <= 0 || value > 1)
      return 'Bitte eine Zahl zwischen 0 und 1 eingeben.';
    if (
      value.toString().includes('.') &&
      value.toString().split('.')[1].length > 2
    )
      return 'Die Gewichtung darf maximal zwei Dezimalstellen haben.';
    return null;
  };

  const handleGradeValidation = (value: number) => {
    if (value < 1 || value > 6)
      return 'Bitte eine Zahl zwischen 1 und 6 eingeben.';
    if (
      value.toString().includes('.') &&
      value.toString().split('.')[1].length > 2
    )
      return 'Die Note darf maximal zwei Dezimalstellen haben.';
    return null;
  };

  const handleDateChange = (e: CustomEvent) => {
    const value = e.detail.value;
    setUpdatedGrade({ ...updatedGrade, date: value });
  };

  return (
    <IonPage>
      <Header
        title={'Notenübersicht'}
        backButton={true}
        defaultHref={'/main/home'}
      />
      <IonContent>
        <IonList>
          {grades.map((grade) => (
            <GradeListItem
              key={grade.id}
              grade={grade}
              onEdit={() => startEdit(grade)}
              onDelete={() => handleDelete(grade.id)}
            />
          ))}
        </IonList>

        <IonModal isOpen={editingId !== null}>
          <Header title={'Note bearbeiten'} backButton={false} />
          <IonContent>
            <GradeForm
              updatedGrade={updatedGrade}
              setUpdatedGrade={setUpdatedGrade}
            />
            <ValidatedNumberInput
              label="Note"
              value={updatedGrade.score}
              onChange={(value) =>
                setUpdatedGrade({ ...updatedGrade, score: value })
              }
              validation={handleGradeValidation}
            />
            <ValidatedNumberInput
              label="Gewichtung"
              value={updatedGrade.weight}
              onChange={(value) =>
                setUpdatedGrade({ ...updatedGrade, weight: value })
              }
              validation={handleWeightValidation}
            />
            <FormField
              label="Datum:"
              value={updatedGrade.date}
              onChange={(e) => handleDateChange(e)}
              type="date"
            />

            <FormField
              label="Note zählt"
              value={updatedGrade.counts}
              onChange={(e) => setUpdatedGrade({ ...updatedGrade, counts: e })}
              type="toggle"
            />

            <FormField
              label="Kommentar:"
              value={updatedGrade.comment}
              onChange={(e) => setUpdatedGrade({ ...updatedGrade, comment: e })}
              type="text"
            />

            <Button handleEvent={saveEdit} text={'Speichern'} />
            <Button
              handleEvent={cancelEdit}
              text={'Abbrechen'}
              color="medium"
            />
          </IonContent>
        </IonModal>

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

export default GradeEntryPage;
