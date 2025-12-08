'use client';

import { useState } from 'react';
import styles from './gm.module.scss';
import SoundboardPanel from './components/SoundboardPanel';
import ScenePanel from './components/ScenePanel';
import MusicPanel from './components/MusicPanel';
import SoundboardPlayer from '@/shared/components/SoundboardPlayer';
import { useSession } from '@/shared/hooks/useSession';

export default function GMConsoleScreen() {
  const { isLoading, error } = useSession();

  // Local audio state for GM (shared between Music and Soundboard)
  const [localVolume, setLocalVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);

  if (isLoading) {
    return (
      <main className={styles.loadingContainer}>
        <div className={styles.loadingText}>Loading GM Console...</div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>GM Console</h1>
        {error && <div className={`${styles.status} ${styles.error}`} role="alert">{error}</div>}
      </header>

      <div className={styles.grid}>
        {/* Scene Panel */}
        <ScenePanel />

        {/* Music Panel */}
        <MusicPanel
          localVolume={localVolume}
          onVolumeChange={setLocalVolume}
          isMuted={isMuted}
          onMuteToggle={() => setIsMuted(!isMuted)}
        />

        {/* Soundboard Panel */}
        <SoundboardPanel />

        {/* Hidden Soundboard Player for GM Monitoring */}
        <SoundboardPlayer volume={isMuted ? 0 : localVolume} />
      </div>
    </main>
  );
}
