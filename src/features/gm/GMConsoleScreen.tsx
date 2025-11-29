'use client';

import { useState, useEffect } from 'react';
import { ref, update, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import styles from './gm.module.scss';

// Types for our state
interface SceneState {
  imageUrl: string;
}

interface MusicState {
  videoId: string;
  isPlaying: boolean;
  volume: number;
}

export default function GMConsoleScreen() {
  // Local state for inputs
  const [sceneUrl, setSceneUrl] = useState('');
  const [musicId, setMusicId] = useState('');
  const [volume, setVolume] = useState(50);
  const [isPlaying, setIsPlaying] = useState(false);

  // Feedback state
  const [status, setStatus] = useState('');

  // Load initial state from Firebase
  useEffect(() => {
    const sceneRef = ref(db, 'session/current/scene');
    const musicRef = ref(db, 'session/current/music');

    const unsubScene = onValue(sceneRef, (snapshot) => {
      const data = snapshot.val();
      if (data?.imageUrl) setSceneUrl(data.imageUrl);
    });

    const unsubMusic = onValue(musicRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.videoId) setMusicId(data.videoId);
        if (typeof data.volume === 'number') setVolume(data.volume);
        if (typeof data.isPlaying === 'boolean') setIsPlaying(data.isPlaying);
      }
    });

    return () => {
      unsubScene();
      unsubMusic();
    };
  }, []);

  const updateScene = async () => {
    try {
      await update(ref(db, 'session/current/scene'), {
        imageUrl: sceneUrl
      });
      setStatus('Scene updated');
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      console.error(error);
      setStatus('Error updating scene');
    }
  };

  const updateMusicState = async (updates: Partial<MusicState>) => {
    try {
      await update(ref(db, 'session/current/music'), {
        ...updates,
        timestamp: Date.now() // Force update
      });
    } catch (error) {
      console.error(error);
      setStatus('Error updating music');
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseInt(e.target.value);
    setVolume(newVol);
    // Simple debounce: update DB only on release or use a timeout if necessary.
    // For simplicity in this phase, we update directly but could optimize.
    updateMusicState({ volume: newVol });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>GM Console</h1>
        {status && <div className={`${styles.status} ${styles.success}`}>{status}</div>}
      </header>

      <div className={styles.grid}>
        {/* Scene Panel */}
        <div className={styles.card}>
          <h2>Visual Scene</h2>
          <div className={styles.formGroup}>
            <label>Image URL</label>
            <input
              type="url"
              value={sceneUrl}
              onChange={(e) => setSceneUrl(e.target.value)}
              placeholder="https://example.com/map.jpg"
            />
          </div>
          <div className={styles.preview}>
            {sceneUrl ? (
              <img src={sceneUrl} alt="Preview" />
            ) : (
              <p>No image</p>
            )}
          </div>
          <div className={styles.buttonGroup}>
            <button className={`${styles.btn} ${styles.primary}`} onClick={updateScene}>
              Update Scene
            </button>
          </div>
        </div>

        {/* Music Panel */}
        <div className={styles.card}>
          <h2>Music (YouTube)</h2>
          <div className={styles.formGroup}>
            <label>YouTube Video ID</label>
            <input
              type="text"
              value={musicId}
              onChange={(e) => setMusicId(e.target.value)}
              placeholder="Ex: dQw4w9WgXcQ"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Volume: {volume}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeChange}
            />
          </div>

          <div className={styles.buttonGroup}>
            <button
              className={`${styles.btn} ${isPlaying ? styles.secondary : styles.primary}`}
              onClick={() => updateMusicState({ isPlaying: !isPlaying, videoId: musicId })}
            >
              {isPlaying ? 'PAUSE' : 'PLAY'}
            </button>
            <button
              className={`${styles.btn} ${styles.primary}`}
              onClick={() => updateMusicState({ videoId: musicId, isPlaying: true })}
            >
              Load & Play
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
