'use client';

import { useState } from 'react';
import styles from './player.module.scss';
import dynamic from 'next/dynamic';
import { Volume2, VolumeX, Radio, Pause, Music } from 'lucide-react';
import SoundboardPlayer from '@/shared/components/SoundboardPlayer';
import { useSession } from '@/shared/hooks/useSession';

// Dynamic import to avoid SSR (Hydration Mismatch)
const MusicPlayer = dynamic(() => import('@/shared/components/MusicPlayer'), {
  ssr: false
});

export default function PlayerViewScreen() {
  const { scene, music, isLoading, error } = useSession();
  const [hasJoined, setHasJoined] = useState(false);

  // Local volume state
  const [localVolume, setLocalVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);

  const handleJoin = () => {
    setHasJoined(true);
    console.log("Player joined session - Audio enabled");
  };

  if (isLoading) {
    return (
      <main className={styles.loadingContainer}>
        <div className={styles.loadingText}>Loading Tavern...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <h2>Connection Error</h2>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      {/* Music Component (Only renders if joined) */}
      {hasJoined && (
        <>
          <div className={styles.playerWrapper}>
            <MusicPlayer
              videoId={music.videoId}
              playing={music.isPlaying}
              volume={isMuted ? 0 : localVolume} />
          </div>

          {/* Soundboard Player (Invisible) */}
          <SoundboardPlayer volume={isMuted ? 0 : localVolume} />

          {/* Centered Info & Controls */}
          <section className={styles.centerControls} aria-label="Player Controls">
            <div className={styles.infoPanel}>
              {scene.title && <h2 className={styles.sceneTitle}>{scene.title}</h2>}

              <div className={styles.statusIcon} aria-hidden="true">
                {music.videoId ? (
                  music.isPlaying ? (
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
                  <Music size={32} className={styles.iconFaded} />
                )}
              </div>

              <div className={styles.nowPlaying} aria-live="polite">
                <span className={styles.label}>Now Playing:</span>
                <span className={styles.trackName}>
                  {music.title || (music.videoId ? 'Loading...' : 'No Music')}
                </span>
              </div>

              <div className={styles.volumeRow}>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={styles.iconBtn}
                  title={isMuted ? "Unmute" : "Mute"}
                  aria-label={isMuted ? "Unmute" : "Mute"} >
                  {isMuted ? <VolumeX size={20} aria-hidden="true" /> : <Volume2 size={20} aria-hidden="true" />}
                </button>

                <label htmlFor="player-volume" className="sr-only">Volume</label>
                <input
                  id="player-volume"
                  type="range"
                  min="0"
                  max="100"
                  value={localVolume}
                  onChange={(e) => setLocalVolume(parseInt(e.target.value))}
                  className={styles.rangeInput}
                  aria-label="Volume Control" />

                <span className={styles.volumeLabel} aria-hidden="true">{localVolume}%</span>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Background Layer */}
      <div
        className={styles.background}
        style={{ backgroundImage: scene.imageUrl ? `url(${scene.imageUrl})` : 'none' }}
        role="img"
        aria-label={scene.title ? `Background image: ${scene.title}` : "Background image"} />

      {/* "Join" Overlay */}
      {!hasJoined && (
        <section className={styles.overlay} aria-labelledby="join-title" role="dialog" aria-modal="true">
          <div className={styles.overlayContent}>
            <h1 id="join-title">BardSync</h1>
            <p>
              Welcome to the tavern. Click below to join the session and sync with the Game Master.
            </p>
            <button className={styles.joinButton} onClick={handleJoin} aria-label="Join Session">
              <Radio size={24} aria-hidden="true" /> Join Session
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
