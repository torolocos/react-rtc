import { Modal } from '..';
import { useModal } from '../hooks/useModal';
import React, { createContext, useContext } from 'react';

const contextDefaults: ReturnType<typeof useModal> = {
  modal: false,
  showModal: () => {},
  modalContent: undefined,
  closeModal: () => {},
};

export const ModalContext =
  createContext<ReturnType<typeof useModal>>(contextDefaults);

export const ModalContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const modalValues = useModal();

  return (
    <ModalContext.Provider value={modalValues}>
      <Modal />
      {children}
    </ModalContext.Provider>
  );
};

export const useCustomModal = () => {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error('useCustomModal must be used within ModalContextProvider');
  }

  return context;
};
