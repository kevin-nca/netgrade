import React from 'react';
import { IonCard, IonIcon } from '@ionic/react';
import { time, school } from 'ionicons/icons';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Exam } from '@/db/entities/Exam';

interface ExamListViewProps {
  groupedExams: {
    monthKey: string;
    monthName: string;
    exams: Exam[];
  }[];
  onSelectExam: (exam: Exam) => void;
  getRelativeDate: (date: Date) => string;
}

const ExamListView: React.FC<ExamListViewProps> = ({
  groupedExams,
  onSelectExam,
  getRelativeDate,
}) => {
  const isDateToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <IonCard className="modern-list-container">
      {groupedExams.length > 0 ? (
        groupedExams.map((group) => (
          <IonCard key={group.monthKey} className="month-section">
            <IonCard className="month-label">
              <span>{group.monthName}</span>
            </IonCard>

            <IonCard className="exams-list">
              {group.exams.map((exam) => (
                <IonCard
                  key={exam.id}
                  className="exam-card"
                  onClick={() => onSelectExam(exam)}
                >
                  <IonCard className="exam-date-badge">
                    <IonCard className="exam-date-day">
                      {format(exam.date, 'dd')}
                    </IonCard>
                    <IonCard className="exam-date-month">
                      {format(exam.date, 'MMM', { locale: de }).toUpperCase()}
                    </IonCard>
                    {isDateToday(exam.date) && (
                      <IonCard className="today-marker"></IonCard>
                    )}
                  </IonCard>

                  <IonCard className="exam-content">
                    <h3 className="exam-title">{exam.name}</h3>
                    <IonCard className="exam-meta">
                      <IonCard className="exam-time">
                        <IonIcon icon={time} />
                        <span className="relative-date">
                          {getRelativeDate(exam.date)}
                        </span>
                      </IonCard>
                    </IonCard>
                    {exam.description && (
                      <p className="exam-desc">
                        {exam.description.length > 100
                          ? `${exam.description.substring(0, 100)}...`
                          : exam.description}
                      </p>
                    )}
                  </IonCard>
                </IonCard>
              ))}
            </IonCard>
          </IonCard>
        ))
      ) : (
        <IonCard className="empty-state" color={'light'}>
          <IonCard className="empty-icon">
            <IonIcon icon={school} />
          </IonCard>
          <h3>Keine anstehenden Prüfungen</h3>
          <p>Du hast aktuell keine anstehenden Prüfungen.</p>
        </IonCard>
      )}
    </IonCard>
  );
};

export default ExamListView;
