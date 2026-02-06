import React from 'react';
import './modal-button-group.css';

interface ModalButtonGroupProps {
  children: React.ReactNode;
}

const ModalButtonGroup: React.FC<ModalButtonGroupProps> = ({ children }) => {
  return <div className="modal-buttons-container">{children}</div>;
};

export default ModalButtonGroup;
