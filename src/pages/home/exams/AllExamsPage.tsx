import React, { useMemo, useState } from 'react';
import { IonContent, IonIcon, IonPage, useIonRouter } from '@ionic/react';
import { chevronBack, chevronForward, bookOutline } from 'ionicons/icons';
import Header from '@/components/Header/Header';
import { useAllExams } from '@/hooks/queries';
import { Routes } from '@/routes';
import type { Exam } from '@/db/entities';
import '../school/SchoolPage.css';
import '../main/MainPage.css';

const AllExamsPage: React.FC = () => {
  const router = useIonRouter();
  const { data: exams = [] } = useAllExams();
  const [activeIndex, setActiveIndex] = useState(0);

  // Group all exams (past and future) by "month year", newest first.
  const groups = useMemo(() => {
    const map = new Map<string, { label: string; exams: Exam[] }>();
    for (const exam of exams) {
      const date = new Date(exam.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const label = date.toLocaleDateString('de-CH', {
        month: 'long',
        year: 'numeric',
      });
      const group = map.get(key) ?? { label, exams: [] };
      group.exams.push(exam);
      map.set(key, group);
    }
    return Array.from(map.values());
  }, [exams]);

  const activeGroup = groups[activeIndex];

  const openExam = (examId: string) =>
    router.push(Routes.EXAM_EDIT.replace(':examId', examId));

  return (
    <IonPage className="home-page">
      <Header title="Alle Prüfungen" backButton defaultHref={Routes.HOME} />
      <IonContent className="home-content">
        <div className="school-semester-selector">
          <button
            className="school-semester-arrow"
            onClick={() => setActiveIndex((i) => i - 1)}
            disabled={activeIndex <= 0}
          >
            <IonIcon icon={chevronBack} />
          </button>
          <span className="school-semester-name">
            {activeGroup?.label ?? '—'}
          </span>
          <button
            className="school-semester-arrow"
            onClick={() => setActiveIndex((i) => i + 1)}
            disabled={activeIndex >= groups.length - 1}
          >
            <IonIcon icon={chevronForward} />
          </button>
        </div>

        <div className="subjects-container">
          {activeGroup ? (
            activeGroup.exams.map((exam) => (
              <div key={exam.id} className="subject-item-container">
                <div className="subject-item" onClick={() => openExam(exam.id)}>
                  <div className="subject-icon-badge">
                    <IonIcon icon={bookOutline} className="subject-initial" />
                  </div>
                  <div className="subject-info">
                    <h3 className="subject-name">{exam.name}</h3>
                    <div className="subject-average-text">
                      {new Date(exam.date).toLocaleDateString('de-CH')}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="subjects-empty-state">
              <div className="subjects-empty-icon">
                <IonIcon icon={bookOutline} />
              </div>
              <h3>Keine Prüfungen</h3>
              <p>Es sind noch keine Prüfungen vorhanden.</p>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AllExamsPage;
