'use client';

import _ReactPlayer from 'react-player';

import styles from './MusicPlayer.module.scss';

// Cast to any to avoid TS errors with React 19. 
// Ideally we would use React.ComponentProps<typeof _ReactPlayer> but it seems to be missing 'url' in some versions or contexts.
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
      <div className={styles.waitingMessage}>
        Waiting for music...
      </div>
    );
  }

  return (
    <div className={styles.hiddenPlayer}>
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
        onError={(e: unknown) => console.error('MusicPlayer Error:', e)} />
    </div>
  );
}
