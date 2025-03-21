import React, { ReactNode } from 'react';
import { IonButton } from '@ionic/react';
import './Button.css';

interface ButtonProps {
  handleEvent: () => void;
  text: ReactNode;
  color?: string;
  fill?: 'solid' | 'clear' | 'outline';
  slot?: string;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  handleEvent,
  text,
  color,
  fill,
  slot,
  className,
}) => {
  return (
    <IonButton
      expand="block"
      onClick={handleEvent}
      color={color}
      fill={fill}
      {...(slot ? { slot } : {})}
      className={className}
    >
      {text}
    </IonButton>
  );
};

export default Button;
