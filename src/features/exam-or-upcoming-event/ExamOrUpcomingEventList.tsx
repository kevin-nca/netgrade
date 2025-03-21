// pages/ExamList.tsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import ExamOrUpcomingEventCard from '@/features/exam-or-upcoming-event/ExamOrUpcomingEventCard';
import { IonContent, IonLabel, IonModal } from '@ionic/react';
import Button from '@/components/Button/Button';
import Header from '@/components/Header/Header';

interface Exam {
  id: string;
  title: string;
  date: string;
  subject: string;
  description: string;
}

const ExamOrUpcomingEventList: React.FC = () => {
  const exams = useSelector((state: RootState) => state.exams.exams);

  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  const handleExamClick = (exam: Exam) => {
    setSelectedExam(exam);
  };

  const closeModal = () => {
    setSelectedExam(null);
  };

  return (
    <div>
      {exams.length === 0 ? (
        <p>Keine Prüfungen vorhanden.</p>
      ) : (
        exams.map((exam) => (
          <ExamOrUpcomingEventCard key={exam.id} exam={exam} />
        ))
      )}

      <IonModal isOpen={selectedExam !== null} onDidDismiss={closeModal}>
        <Header title={'Prüfungsdetails'} backButton={false} />
        <IonContent>
          {selectedExam && (
            <div>
              <IonLabel>Titel:</IonLabel>
              <p>{selectedExam.title}</p>

              <IonLabel>Datum:</IonLabel>
              <p>{selectedExam.date}</p>

              <IonLabel>Fach/Modul:</IonLabel>
              <p>{selectedExam.subject}</p>

              <IonLabel>Beschreibung:</IonLabel>
              <p>{selectedExam.description}</p>
            </div>
          )}

          <Button handleEvent={closeModal} text={'Schliessen'} />
        </IonContent>
      </IonModal>
    </div>
  );
};

export default ExamOrUpcomingEventList;
