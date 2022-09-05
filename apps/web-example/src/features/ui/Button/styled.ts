import { styled } from '@stitches/react';

export const StyledButton = styled('button', {
  display: 'block',
  border: 'none',
  borderRadius: '5px',
  color: 'white',

  variants: {
    size: {
      sm: {
        fontSize: '13px',
        height: '25px',
        paddingRight: '10px',
        paddingLeft: '10px',
      },
      lg: {
        fontSize: '15px',
        height: '35px',
        paddingLeft: '15px',
        paddingRight: '15px',
      },
    },
    bg: {
      primary: {
        backgroundColor: '#2196f3',
        '&:hover': {
          backgroundColor: '#64b5f6',
        },
      },
      secondary: {
        backgroundColor: '#009688',
        '&:hover': {
          backgroundColor: '#4db6ac',
        },
      },
      danger: {
        backgroundColor: '#f44336',
      },
    },
  },
});
