import { useState } from 'react';

const useModal = () => {
  const [modal, setModal] = useState(false);
  const [modalContent, setModalContent] = useState<JSX.Element>();

  const showModal = (content: JSX.Element) => {
    setModal(true);
    if (content) {
      setModalContent(content);
    }
  };

  const closeModal = () => {
    setModal(false);
  };

  return { modal, showModal, modalContent, closeModal };
};

export { useModal };
