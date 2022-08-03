import { styled } from 'src/features/ui/theme';

export const Container = styled('div', {
  width: '80%',
  height: '50px',
  borderRadius: '3px',
  backgroundColor: '$body',
  alignItems: 'center',
  display: 'flex',
});

export const StyledInput = styled('input', {
  height: '80%',
  width: '80%',
  marginLeft: '50px',
  backgroundColor: 'inherit',
  borderWidth: '0px',
  color: '$text',

  '&:focus': {
    outline: 'none',
  },
});
