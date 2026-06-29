import React, { useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonPage,
  IonSpinner,
  useIonRouter,
} from '@ionic/react';
import { bookOutline, calendarOutline, chevronForward } from 'ionicons/icons';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import Header from '@/components/Header/Header';
import { Routes } from '@/routes';
import { useAllExams, createExamDetailQuery } from '@/hooks/queries';
import type { Exam } from '@/db/entities';
import './AllExamsPage.css';

interface ExamMonthGroup {
  key: string;
  label: string;
  exams: Exam[];
}

const groupByMonth = (exams: Exam[]): ExamMonthGroup[] => {
  const groups = new Map<string, ExamMonthGroup>();

  for (const exam of exams) {
    const date = new Date(exam.date);
    const key = format(date, 'yyyy-MM');
    const label = format(date, 'MMMM yyyy', { locale: de });

    const existing = groups.get(key);
    if (existing) {
      existing.exams.push(exam);
    } else {
      groups.set(key, { key, label, exams: [exam] });
    }
  }

  return Array.from(groups.values());
};

const AllExamsPage: React.FC = () => {
  const router = useIonRouter();
  const history = useHistory();
  const queryClient = useQueryClient();
  const { data: exams, isLoading } = useAllExams();

  const goHome = () => router.push(Routes.HOME, 'back', 'pop');

  const monthGroups = useMemo(() => groupByMonth(exams ?? []), [exams]);

  const handleExamClick = async (examId: string) => {
    await queryClient.prefetchQuery(createExamDetailQuery(examId));
    history.push(Routes.EXAM_EDIT.replace(':examId', examId));
  };

  return (
    <IonPage>
      <Header title="Alle Prüfungen" backButton onBack={goHome} />
      <IonContent className="all-exams-content">
        {isLoading ? (
          <div className="all-exams-state">
            <IonSpinner name="crescent" />
          </div>
        ) : monthGroups.length === 0 ? (
          <div className="all-exams-state">
            <p className="all-exams-empty">Noch keine Prüfungen vorhanden</p>
          </div>
        ) : (
          <div className="all-exams-list">
            {monthGroups.map((group) => (
              <div key={group.key} className="all-exams-month">
                <h2 className="all-exams-month-title">{group.label}</h2>
                {group.exams.map((exam) => (
                  <IonButton
                    key={exam.id}
                    expand="block"
                    fill="clear"
                    className="all-exam-card"
                    onClick={() => handleExamClick(exam.id)}
                  >
                    <div className="all-exam-card-inner">
                      <div className="all-exam-icon-wrapper">
                        <IonIcon icon={bookOutline} className="all-exam-icon" />
                      </div>
                      <div className="all-exam-info">
                        <span className="all-exam-title">{exam.name}</span>
                        <div className="all-exam-meta">
                          {exam.subject?.name && (
                            <span className="all-exam-subject">
                              {exam.subject.name}
                            </span>
                          )}
                          <span className="all-exam-date">
                            <IonIcon
                              icon={calendarOutline}
                              className="all-exam-meta-icon"
                            />
                            {format(new Date(exam.date), 'dd.MM.yyyy')}
                          </span>
                        </div>
                      </div>
                      {exam.grade ? (
                        <span className="all-exam-grade">
                          {exam.grade.score.toFixed(1)}
                        </span>
                      ) : (
                        <IonIcon
                          icon={chevronForward}
                          className="all-exam-chevron"
                        />
                      )}
                    </div>
                  </IonButton>
                ))}
              </div>
            ))}
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default AllExamsPage;
