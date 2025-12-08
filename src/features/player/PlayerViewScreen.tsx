'use client';

import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/shared/lib/firebase';
import styles from './player.module.scss';
import dynamic from 'next/dynamic';
import { Volume2, VolumeX, Radio, Pause, Music } from 'lucide-react';
import SoundboardPlayer from '@/shared/components/SoundboardPlayer';

// Dynamic import to avoid SSR (Hydration Mismatch)
const MusicPlayer = dynamic(() => import('@/shared/components/MusicPlayer'), {
  ssr: false
});

export default function PlayerViewScreen() {
  const [hasJoined, setHasJoined] = useState(false);
  const [sceneUrl, setSceneUrl] = useState('');
  const [sceneTitle, setSceneTitle] = useState('');

  // Local volume state
  const [localVolume, setLocalVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);

  // Music state from Firebase
  const [musicState, setMusicState] = useState({
    videoId: '',
    title: '',
    isPlaying: false,
    volume: 50
  });

  useEffect(() => {
    // Listen for scene changes
    const sceneRef = ref(db, 'session/current/scene');
    const unsubScene = onValue(sceneRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.imageUrl) setSceneUrl(data.imageUrl);
        if (data.title) setSceneTitle(data.title);
      }
    });

    // Listen for music changes
    const musicRef = ref(db, 'session/current/music');
    const unsubMusic = onValue(musicRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setMusicState({
          videoId: data.videoId || '',
          title: data.title || '',
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
      {/* Music Component (Only renders if joined) */}
      {hasJoined && (
        <>
          <div className={styles.playerWrapper}>
            <MusicPlayer
              videoId={musicState.videoId}
              playing={musicState.isPlaying}
              volume={isMuted ? 0 : localVolume}
            />
          </div>

          {/* Soundboard Player (Invisible) */}
          <SoundboardPlayer volume={isMuted ? 0 : localVolume} />

          {/* Centered Info & Controls */}
          <div className={styles.centerControls}>
            <div className={styles.infoPanel}>
              {sceneTitle && <h2 className={styles.sceneTitle}>{sceneTitle}</h2>}

              <div className={styles.statusIcon}>
                {musicState.videoId ? (
                  musicState.isPlaying ? (
                    <div className={styles.waveContainer}>
                      <div className={styles.waveBar} />
                      <div className={styles.waveBar} />
                      <div className={styles.waveBar} />
                      <div className={styles.waveBar} />
                      <div className={styles.waveBar} />
                    </div>
                  ) : (
                    <Pause size={32} />
                  )
                ) : (
                  <Music size={32} style={{ opacity: 0.5 }} />
                )}
              </div>

              <div className={styles.nowPlaying}>
                <span className={styles.label}>Now Playing:</span>
                <span className={styles.trackName}>
                  {musicState.title || (musicState.videoId ? 'Loading...' : 'No Music')}
                </span>
              </div>

              <div className={styles.volumeRow}>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={styles.iconBtn}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={localVolume}
                  onChange={(e) => setLocalVolume(parseInt(e.target.value))}
                  className={styles.rangeInput}
                />

                <span className={styles.volumeLabel}>{localVolume}%</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Background Layer */}
      <div
        className={styles.background}
        style={{ backgroundImage: sceneUrl ? `url(${sceneUrl})` : 'none' }}
      />

      {/* "Join" Overlay */}
      {!hasJoined && (
        <div className={styles.overlay}>
          <div className={styles.overlayContent}>
            <h1>BardSync</h1>
            <p>
              Welcome to the tavern. Click below to join the session and sync with the Game Master.
            </p>
            <button className={styles.joinButton} onClick={handleJoin}>
              <Radio size={24} /> Join Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
