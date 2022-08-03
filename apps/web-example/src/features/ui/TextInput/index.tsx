import { FC, forwardRef, InputHTMLAttributes } from 'react';
import { Container, StyledInput } from './styled';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string | null;
};

export const TextInput: FC<Props> = forwardRef<HTMLInputElement, Props>(
  ({ label, type, ...rest }, ref) => {
    return (
      <Container>
        <StyledInput placeholder={label} type={type} {...rest} ref={ref} />
      </Container>
    );
  }
);

TextInput.displayName = 'TextInput';
