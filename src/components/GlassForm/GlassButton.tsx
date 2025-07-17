import React from 'react';
import { IonIcon } from '@ionic/react';
import { GlassButtonProps } from './types';
import './GlassForm.css';

const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'start',
  disabled = false,
  loading = false,
  fullWidth = false,
  type = 'button',
  className = '',
}) => {
  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  const buttonClasses = [
    'glass-button',
    variant === 'primary' && 'glass-button-base primary',
    variant === 'secondary' && 'secondary',
    variant === 'danger' && 'danger',
    variant === 'ghost' && 'ghost',
    size,
    fullWidth && 'full-width',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <div className="glass-button-spinner" />
          {children}
        </>
      );
    }

    const iconElement = icon && (
      <IonIcon icon={icon} className="glass-button-icon" />
    );

    if (iconPosition === 'start') {
      return (
        <>
          {iconElement}
          {children}
        </>
      );
    } else {
      return (
        <>
          {children}
          {iconElement}
        </>
      );
    }
  };

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-busy={loading}
    >
      {renderContent()}
    </button>
  );
};

export default GlassButton;
