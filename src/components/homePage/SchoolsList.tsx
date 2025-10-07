import React from 'react';
import { useHistory } from 'react-router-dom';
import { IonIcon, IonSpinner } from '@ionic/react';
import {
  school,
  chevronForwardOutline,
  statsChartOutline,
} from 'ionicons/icons';
import { School, Grade } from '@/db/entities';
import { Routes } from '@/routes';

interface SchoolsListProps {
  schools: School[] | undefined;
  grades: Grade[] | undefined;
  isLoading: boolean;
}

const SchoolsList: React.FC<SchoolsListProps> = ({
  schools,
  grades,
  isLoading,
}) => {
  const history = useHistory();

  const calculateSchoolAverage = (
    schoolId: string,
    grades: Grade[] | undefined,
  ) => {
    if (!grades || grades.length === 0) return null;

    const schoolGrades = grades.filter(
      (grade) =>
        grade.exam &&
        grade.exam.subject &&
        grade.exam.subject.schoolId &&
        grade.exam.subject.schoolId === schoolId,
    );
    if (schoolGrades.length === 0) return null;

    const totalScore = schoolGrades.reduce(
      (acc, grade) => acc + grade.score * grade.weight,
      0,
    );
    const totalWeight = schoolGrades.reduce(
      (acc, grade) => acc + grade.weight,
      0,
    );
    return totalWeight ? totalScore / totalWeight : null;
  };

  const getSchoolIcon = (schoolName: string) => {
    return schoolName.charAt(0).toUpperCase();
  };

  return (
    <div className="schools-grid">
      {isLoading ? (
        <IonSpinner name="crescent" />
      ) : schools && schools.length > 0 ? (
        schools.map((school, index) => {
          const average = calculateSchoolAverage(school.id, grades);
          return (
            <div
              key={school.id}
              className="school-card glass-card"
              onClick={() =>
                history.push(Routes.SCHOOL.replace(':schoolId', school.id))
              }
            >
              <div className="school-card-header">
                <div className={`school-avatar school-avatar-${index % 4}`}>
                  {getSchoolIcon(school.name)}
                </div>
                <IonIcon
                  icon={chevronForwardOutline}
                  className="school-chevron"
                />
              </div>

              <div className="school-card-content">
                <h3 className="school-name">{school.name}</h3>
                <div className="school-stats">
                  <div className="school-average">
                    <IonIcon icon={statsChartOutline} className="stats-icon" />
                    <span className="school-info">
                      {average ? `${average.toFixed(1)} Ø` : 'Keine Noten'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="empty-schools glass-card">
          <div className="empty-icon-wrapper">
            <IonIcon icon={school} className="empty-icon" />
          </div>
          <h3 className="empty-title">Keine Schulen</h3>
          <p className="empty-description">Tippe + um zu starten</p>
        </div>
      )}
    </div>
  );
};

export default SchoolsList;
