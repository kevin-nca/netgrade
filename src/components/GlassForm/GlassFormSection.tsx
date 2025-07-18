import React from 'react';
import { IonIcon } from '@ionic/react';
import { GlassFormSectionProps } from './types';
import './GlassForm.css';

interface GlassFormSectionExtraProps extends GlassFormSectionProps {
  contentSpacing?: number;
}

const GlassFormSection: React.FC<GlassFormSectionExtraProps> = ({
  children,
  title,
  subtitle,
  icon,
  className = '',
  contentSpacing = 0,
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

      <div style={contentSpacing ? { marginTop: contentSpacing } : undefined}>
        {children}
      </div>
    </div>
  );
};

export default GlassFormSection;
