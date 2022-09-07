import { styled } from 'src/features/ui/theme';

export const VideoWrapper = styled('div', {
  minWidth: '400px',
  flex: '1',
  position: 'relative',
});
export const StyledVideo = styled('video', {
  backgroundColor: '$color',
  width: '100%',
  height: '100%',
});

export const StyledTitle = styled('p', {
  position: 'absolute',
  top: '10px',
  left: '10px',
});
