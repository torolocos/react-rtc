import { useEffect, useRef } from 'react';
import { StyledTitle, StyledVideo, VideoWrapper } from './styled';

interface Props {
  stream: MediaStream;
  username: string;
}

const Stream = ({ stream, username }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, []);

  return (
    <VideoWrapper>
      <StyledTitle>{username}</StyledTitle>
      <StyledVideo
        ref={videoRef}
        autoPlay
        // width={500}
        // css={{
        //   backgroundColor: color,
        // }}
      />
    </VideoWrapper>
  );
};

export default Stream;
