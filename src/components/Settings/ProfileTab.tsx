import React from 'react';
import { IonIcon } from '@ionic/react';
import {
  personCircleOutline,
  languageOutline,
  notificationsOutline,
  moonOutline,
  keyOutline,
  timeOutline,
  colorPaletteOutline,
  informationCircleOutline,
  chevronForward,
} from 'ionicons/icons';

import SettingsHeader from './SettingsHeader';
import SettingsGroup from './SettingsGroup';
import SettingsItem from './SettingsItem';
import { UserSettings } from '@/services/SettingsService';

interface ProfileTabProps {
  settings: UserSettings;
  onUpdate: (field: keyof UserSettings, value: any) => void;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ settings, onUpdate }) => {
  return (
    <div className="settings-section">
      <SettingsHeader
        title="Benutzerprofil"
        subtitle="Passen Sie Ihre persönlichen Einstellungen an"
      />

      <SettingsGroup>
        <SettingsItem
          icon={personCircleOutline}
          label="Benutzername"
          type="input"
          value={settings.name}
          placeholder="Name eingeben"
          onChange={(value) => onUpdate('name', value)}
        />

        <SettingsItem
          icon={languageOutline}
          label="Sprache"
          type="select"
          detail={true}
          onClick={() => {
            const newLang = settings.language === 'de' ? 'en' : 'de';
            onUpdate('language', newLang);
          }}
        >
          <div slot="end" className="language-selector">
            <span>{settings.language === 'de' ? 'Deutsch' : 'Englisch'}</span>
            <IonIcon icon={chevronForward} />
          </div>
        </SettingsItem>

        <SettingsItem
          icon={notificationsOutline}
          label="Benachrichtigungen"
          type="toggle"
          value={settings.notifications}
          onChange={(value) => onUpdate('notifications', value)}
        />

        <SettingsItem
          icon={moonOutline}
          label="Dunkelmodus"
          type="toggle"
          value={settings.darkMode}
          onChange={(value) => onUpdate('darkMode', value)}
        />

        <SettingsItem icon={keyOutline} label="Passwort ändern" detail={true} />
      </SettingsGroup>

      <SettingsGroup title="App-Einstellungen">
        <SettingsItem icon={timeOutline} label="Erinnerungen" detail={true} />

        <SettingsItem
          icon={colorPaletteOutline}
          label="Farbschema"
          detail={true}
        />

        <SettingsItem
          icon={informationCircleOutline}
          label="Über die App"
          detail={true}
        />
      </SettingsGroup>
    </div>
  );
};

export default ProfileTab;
