'use client';

import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import styles from './player.module.scss';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR (Hydration Mismatch)
const MusicPlayer = dynamic(() => import('./components/MusicPlayer'), {
  ssr: false
});

export default function PlayerViewScreen() {
  const [hasJoined, setHasJoined] = useState(false);
  const [sceneUrl, setSceneUrl] = useState('');

  // Music state
  const [musicState, setMusicState] = useState({
    videoId: '',
    isPlaying: false,
    volume: 50
  });

  useEffect(() => {
    // Listen for scene changes
    const sceneRef = ref(db, 'session/current/scene');
    const unsubScene = onValue(sceneRef, (snapshot) => {
      const data = snapshot.val();
      if (data?.imageUrl) {
        setSceneUrl(data.imageUrl);
      }
    });

    // Listen for music changes
    const musicRef = ref(db, 'session/current/music');
    const unsubMusic = onValue(musicRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setMusicState({
          videoId: data.videoId || '',
          isPlaying: data.isPlaying || false,
          volume: typeof data.volume === 'number' ? data.volume : 50
        });
      }
    });

    return () => {
      unsubScene();
      unsubMusic();
    };
  }, []);

  const handleJoin = () => {
    setHasJoined(true);
    console.log("Player joined session - Audio enabled");
  };

  return (
    <div className={styles.container}>
      <h1>Player View</h1>
      {/* Music Component (Only renders if joined) */}
      {hasJoined && (
        <div className={styles.playerWrapper}>
          <MusicPlayer
            videoId={musicState.videoId}
            playing={musicState.isPlaying}
            volume={musicState.volume}
          />
        </div>
      )}

      {/* Background Layer */}
      <div
        className={styles.background}
        style={{ backgroundImage: sceneUrl ? `url(${sceneUrl})` : 'none' }}
      />

      {/* "Join" Overlay */}
      {!hasJoined && (
        <div className={styles.overlay}>
          <h1>BardSync</h1>
          <p>
            Welcome to the session. Click the button to sync with the Game Master's board and enable audio.
          </p>
          <button className={styles.joinButton} onClick={handleJoin}>
            Join Session
          </button>
        </div>
      )}
    </div>
  );
}
