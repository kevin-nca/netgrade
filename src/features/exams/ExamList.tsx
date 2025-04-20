import React, { useState } from 'react';
import ExamCard from '@/features/exams/ExamCard';
import { IonContent, IonLabel, IonModal } from '@ionic/react';
import Button from '@/components/Button/Button';
import Header from '@/components/Header/Header';
import { Exam } from '@/db/entities';
import { useExams } from '@/hooks/queries';

const ExamList: React.FC = () => {
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  const { data: exams = [] } = useExams();

  const closeModal = () => {
    setSelectedExam(null);
  };

  return (
    <div>
      {exams.length === 0 ? (
        <p>Keine Prüfungen vorhanden.</p>
      ) : (
        exams.map((exam: Exam) => <ExamCard key={exam.id} exam={exam} />)
      )}

      <IonModal isOpen={selectedExam !== null} onDidDismiss={closeModal}>
        <Header title={'Prüfungsdetails'} backButton={false} />
        <IonContent>
          {selectedExam && (
            <div>
              <IonLabel>Titel:</IonLabel>
              <p>{selectedExam.name}</p>

              <IonLabel>Datum:</IonLabel>
              <p>{selectedExam.date.toLocaleDateString()}</p>

              <IonLabel>Fach/Modul:</IonLabel>
              <p>{selectedExam.subject?.name || 'Nicht zugeordnet'}</p>

              <IonLabel>Beschreibung:</IonLabel>
              <p>{selectedExam.description || 'Keine Beschreibung'}</p>
            </div>
          )}

          <Button handleEvent={closeModal} text={'Schliessen'} />
        </IonContent>
      </IonModal>
    </div>
  );
};

export default ExamList;
