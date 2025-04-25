import React from 'react';

interface SettingsHeaderProps {
  title: string;
  subtitle?: string;
}

const SettingsHeader: React.FC<SettingsHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="settings-header">
      <h1>{title}</h1>
      {subtitle && <p className="settings-subtitle">{subtitle}</p>}
    </div>
  );
};

export default SettingsHeader;
