import React from 'react';
import { IonIcon } from '@ionic/react';
import { GlassFormSectionProps } from './types';
import './GlassForm.css';

const GlassFormSection: React.FC<GlassFormSectionProps> = ({
  children,
  title,
  subtitle,
  icon,
  className = '',
}) => {
  const sectionClasses = ['glass-form-section', 'glass-base', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={sectionClasses}>
      {(title || subtitle || icon) && (
        <div className="glass-form-section-header">
          {icon && (
            <div className="glass-form-section-icon">
              <IonIcon icon={icon} />
            </div>
          )}

          {(title || subtitle) && (
            <div className="glass-form-section-content">
              {title && <h3 className="glass-form-section-title">{title}</h3>}
              {subtitle && (
                <p className="glass-form-section-subtitle">{subtitle}</p>
              )}
            </div>
          )}
        </div>
      )}

      {children}
    </div>
  );
};

export default GlassFormSection;
