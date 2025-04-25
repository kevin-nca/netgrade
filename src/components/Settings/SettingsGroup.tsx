import React from 'react';
import { IonList } from '@ionic/react';

interface SettingsGroupProps {
  title?: string;
  isDanger?: boolean;
  children: React.ReactNode;
}

const SettingsGroup: React.FC<SettingsGroupProps> = ({
  title,
  isDanger = false,
  children,
}) => {
  return (
    <>
      {title && (
        <div className={`settings-group-title ${isDanger ? 'danger' : ''}`}>
          {title}
        </div>
      )}
      <div className="settings-group">
        <IonList className="ios-list">{children}</IonList>
      </div>
    </>
  );
};

export default SettingsGroup;
