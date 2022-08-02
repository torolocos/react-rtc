import { styled } from 'src/features/ui/theme';

export const Container = styled('div', {
  height: '100px',
  backgroundColor: '$secondary',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const Title = styled('h1', {
  color: '$title',
  fontFamily: '$Rift',
  fontSize: '2rem',
});
