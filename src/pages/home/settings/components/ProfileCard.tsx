import { IonIcon } from '@ionic/react';
import { settingsOutline } from 'ionicons/icons';

interface ProfileCardProps {
  userName: string | null | undefined;
  onEditClick: () => void;
}

const ProfileCard = ({ userName, onEditClick }: ProfileCardProps) => {
  return (
    <div className="profile-section">
      <div className="gradient-orb" />
      <div className="profile-card glass-card">
        <div className="profile-content">
          <div className="profile-avatar">
            {userName ? userName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="profile-info">
            <h1 className="profile-name">{userName || 'Benutzer'}</h1>
            <p className="profile-subtitle">Verwalte deine App-Einstellungen</p>
          </div>
          <div className="profile-edit-button" onClick={onEditClick}>
            <IonIcon icon={settingsOutline} className="profile-edit-icon" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
