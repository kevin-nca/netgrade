import React from 'react';
import './ProgressBar.css';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
}) => {
  return (
    <div className="progress-container">
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{
            width: `${(currentStep / (totalSteps - 1)) * 100}%`,
          }}
        />
        <div className="progress-glow" />
      </div>
    </div>
  );
};

export default ProgressBar;
