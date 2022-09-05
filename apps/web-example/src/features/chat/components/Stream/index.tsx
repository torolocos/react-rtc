import { useEffect, useRef } from 'react';

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
    <div>
      <p>{username}</p>
      <video ref={videoRef} width={300} autoPlay />
    </div>
  );
};

export default Stream;
