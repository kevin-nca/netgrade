import React from 'react';
import { useHistory } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import { bookOutline, timeOutline } from 'ionicons/icons';
import { Routes } from '@/routes';
import { useExamsCompleted } from '@/hooks/queries';

const ExamsList: React.FC = () => {
  const history = useHistory();
  const { data: upcomingExams } = useExamsCompleted();

  const formatDate = (date: Date) => {
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Heute';
    if (diffDays === 1) return 'Morgen';
    if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} Tagen`;

    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'short',
    });
  };

  if (!upcomingExams || upcomingExams.length === 0) {
    return (
      <div className="exams-scroll-container">
        <div className="exams-list">
          <div className="empty-exams glass-card">
            <h3 className="empty-title">Alles erledigt!</h3>
            <p className="empty-description">Keine anstehenden Prüfungen</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="exams-scroll-container">
      <div className="exams-list">
        {upcomingExams.map((exam) => (
          <div
            key={exam.id}
            className="exam-card glass-card"
            onClick={() =>
              history.push(Routes.EXAM_EDIT.replace(':examId', exam.id))
            }
          >
            <div className="exam-card-content">
              <div className="exam-icon-and-info">
                <div className="exam-icon-wrapper">
                  <IonIcon icon={bookOutline} className="exam-icon" />
                </div>

                <div className="exam-info">
                  <h4 className="exam-title">{exam.name}</h4>
                  <div className="exam-meta">
                    <div className="exam-date">
                      <IonIcon icon={timeOutline} className="meta-icon" />
                      <span>{formatDate(exam.date)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="exam-priority">
                <div className="priority-dot" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExamsList;
