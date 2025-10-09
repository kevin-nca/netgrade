import React from 'react';
import { useHistory } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import {
  school,
  chevronForwardOutline,
  statsChartOutline,
} from 'ionicons/icons';
import { Routes } from '@/routes';
import { useSchoolCompleted, useGradeCompleted } from '@/hooks/queries';
import { SchoolService } from '@/services/SchoolService';

const SchoolsList: React.FC = () => {
  const history = useHistory();
  const { data: schools } = useSchoolCompleted();
  const { data: grades } = useGradeCompleted();

  console.log('SchoolsList - schools:', schools);
  console.log('SchoolsList - is schools undefined?', schools === undefined);
  console.log('SchoolsList - is schools null?', schools === null);

  const getSchoolIcon = (schoolName: string) => {
    return schoolName.charAt(0).toUpperCase();
  };

  if (schools!.length === 0) {
    return (
      <div className="schools-grid">
        <div className="empty-schools glass-card">
          <div className="empty-icon-wrapper">
            <IonIcon icon={school} className="empty-icon" />
          </div>
          <h3 className="empty-title">Keine Schulen</h3>
          <p className="empty-description">Tippe + um zu starten</p>
        </div>
      </div>
    );
  }

  return (
    <div className="schools-grid">
      {schools!.map((school, index) => {
        const average = SchoolService.calculateSchoolAverage(school.id, grades);
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
      })}
    </div>
  );
};

export default SchoolsList;
