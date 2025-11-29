'use client';

import _ReactPlayer from 'react-player';

// Cast to any to avoid TS errors with React 19
const ReactPlayer = _ReactPlayer as unknown as React.ComponentType<any>;

interface MusicPlayerProps {
  videoId: string;
  playing: boolean;
  volume: number;
}

export default function MusicPlayer({ videoId, playing, volume }: MusicPlayerProps) {
  // Construct URL from videoId
  const url = videoId ? `https://www.youtube.com/watch?v=${videoId}` : '';

  // Convert volume from 0-100 to 0-1
  const normalizedVolume = volume / 100;

  if (!videoId) {
    return (
      <div style={{ color: 'white', padding: '20px', textAlign: 'center' }}>
        Waiting for music...
      </div>
    );
  }

  return (
    <div style={{ display: 'none' }}>
      <ReactPlayer
        src={url}
        playing={playing}
        volume={normalizedVolume}
        width="0"
        height="0"
        controls={false}
        loop={true}
        onReady={() => console.log('MusicPlayer: Ready')}
        onStart={() => console.log('MusicPlayer: Started')}
        onPlay={() => console.log('MusicPlayer: Playing')}
        onPause={() => console.log('MusicPlayer: Paused')}
        onError={(e: any) => console.error('MusicPlayer Error:', e)}
      />
    </div>
  );
}
