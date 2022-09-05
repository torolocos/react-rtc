import ReactDOM from 'react-dom';
import { useCustomModal } from './contexts/modal';
import { Container } from './styled';

const Modal = () => {
  const { modalContent, modal } = useCustomModal();

  if (modal) {
    return ReactDOM.createPortal(
      <Container>{modalContent}</Container>,
      document.querySelector('#modal') as HTMLElement
    );
  } else return null;
};

export { Modal };
