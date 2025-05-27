import React from 'react';
import { IonIcon } from '@ionic/react';
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
    <div className="modern-list-container">
      {groupedExams.length > 0 ? (
        groupedExams.map((group) => (
          <div key={group.monthKey} className="month-section">
            <div className="month-label">
              <span>{group.monthName}</span>
            </div>

            <div className="exams-list">
              {group.exams.map((exam) => (
                <div
                  key={exam.id}
                  className="exam-card"
                  onClick={() => onSelectExam(exam)}
                >
                  <div className="exam-date-badge">
                    <div className="exam-date-day">
                      {format(exam.date, 'dd')}
                    </div>
                    <div className="exam-date-month">
                      {format(exam.date, 'MMM', { locale: de }).toUpperCase()}
                    </div>
                    {isDateToday(exam.date) && (
                      <div className="today-marker"></div>
                    )}
                  </div>

                  <div className="exam-content">
                    <h3 className="exam-title">{exam.name}</h3>
                    <div className="exam-meta">
                      <div className="exam-time">
                        <IonIcon icon={time} />
                        <span className="relative-date">
                          {getRelativeDate(exam.date)}
                        </span>
                      </div>
                    </div>
                    {exam.description && (
                      <p className="exam-desc">
                        {exam.description.length > 100
                          ? `${exam.description.substring(0, 100)}...`
                          : exam.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="empty-state">
          <div className="empty-icon">
            <IonIcon icon={school} />
          </div>
          <h3>Keine anstehenden Prüfungen</h3>
          <p>Du hast aktuell keine anstehenden Prüfungen.</p>
        </div>
      )}
    </div>
  );
};

export default ExamListView;
