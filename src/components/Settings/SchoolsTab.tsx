import React from 'react';
import {
  IonButton,
  IonIcon,
  IonItem,
  IonItemOptions,
  IonItemOption,
  IonItemSliding,
  IonLabel,
} from '@ionic/react';
import {
  addOutline,
  schoolOutline,
  closeOutline,
  trashOutline,
} from 'ionicons/icons';

import SettingsHeader from './SettingsHeader';
import SettingsGroup from './SettingsGroup';

interface SchoolsTabProps {
  schools: any[];
  isLoading: boolean;
  error: any;
  onAddSchool: () => void;
  onDeleteSchool?: (schoolId: string) => void;
}

const SchoolsTab: React.FC<SchoolsTabProps> = ({
  schools,
  isLoading,
  error,
  onAddSchool,
  onDeleteSchool,
}) => {
  return (
    <div className="settings-section">
      <SettingsHeader
        title="Schulverwaltung"
        subtitle="Verwalten Sie Ihre Schulen"
      />

      <div className="add-button-container">
        <IonButton expand="block" onClick={onAddSchool} className="ios-button">
          <IonIcon icon={addOutline} slot="start" />
          Neue Schule hinzufügen
        </IonButton>
      </div>

      <SettingsGroup>
        {isLoading ? (
          Array(3)
            .fill(0)
            .map((_, i) => (
              <IonItem key={i} className="ios-item">
                <div className="skeleton-container">
                  <div className="skeleton-circle"></div>
                  <div className="skeleton-content">
                    <div className="skeleton-line-large"></div>
                    <div className="skeleton-line-small"></div>
                  </div>
                </div>
              </IonItem>
            ))
        ) : error ? (
          <IonItem className="ios-item error-item">
            <IonIcon
              icon={closeOutline}
              slot="start"
              className="settings-icon"
            />
            <IonLabel color="danger">
              <h2>Fehler beim Laden</h2>
              <p>Bitte versuchen Sie es später erneut</p>
            </IonLabel>
          </IonItem>
        ) : schools.length > 0 ? (
          schools.map((school) => (
            <IonItemSliding key={school.id}>
              <IonItem detail={true} className="ios-item">
                <IonIcon
                  icon={schoolOutline}
                  slot="start"
                  className="settings-icon"
                />
                <IonLabel>
                  <h2>{school.name}</h2>
                  <p>{school.type || 'Keine Schulart angegeben'}</p>
                </IonLabel>
              </IonItem>
              <IonItemOptions side="end">
                <IonItemOption
                  color="danger"
                  className="ios-item-option"
                  onClick={() => onDeleteSchool && onDeleteSchool(school.id)}
                >
                  <IonIcon slot="icon-only" icon={trashOutline} />
                </IonItemOption>
              </IonItemOptions>
            </IonItemSliding>
          ))
        ) : (
          <IonItem lines="none" className="ios-item empty-item">
            <IonLabel className="ion-text-center">
              <h2>Keine Schulen vorhanden</h2>
              <p>Fügen Sie Ihre erste Schule hinzu</p>
            </IonLabel>
          </IonItem>
        )}
      </SettingsGroup>
    </div>
  );
};

export default SchoolsTab;
