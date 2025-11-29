'use client';

import { useState, useEffect } from 'react';
import { ref, update, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import styles from './gm.module.scss';
import dynamic from 'next/dynamic';

// Dynamic import for MusicPlayer
const MusicPlayer = dynamic(() => import('@/features/player/components/MusicPlayer'), {
  ssr: false
});

// Types for our state
interface SceneState {
  imageUrl: string;
}

interface MusicState {
  videoId: string;
  isPlaying: boolean;
  // volume removed from global state
}

export default function GMConsoleScreen() {
  // Local state for inputs
  const [sceneUrl, setSceneUrl] = useState('');
  const [musicId, setMusicId] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  // Local audio state for GM
  const [localVolume, setLocalVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);

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

  const extractVideoId = (url: string) => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
        return urlObj.searchParams.get('v') || urlObj.pathname.slice(1) || url;
      }
      return url;
    } catch (e) {
      return url;
    }
  };

  const handleMusicIdChange = (val: string) => {
    const id = extractVideoId(val);
    setMusicId(id);
  };

  const handlePaste = async (setter: (val: string) => void, parser?: (val: string) => string) => {
    try {
      const text = await navigator.clipboard.readText();
      const value = parser ? parser(text) : text;
      setter(value);
    } catch (err) {
      console.error('Failed to read clipboard', err);
      setStatus('Error reading clipboard');
    }
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
            <div className={styles.inputGroup}>
              <input
                type="url"
                value={sceneUrl}
                onChange={(e) => setSceneUrl(e.target.value)}
                placeholder="https://example.com/map.jpg"
              />
              <button className={styles.btn} onClick={() => handlePaste(setSceneUrl)}>
                Paste
              </button>
            </div>
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

          {/* Hidden Local Player for GM */}
          <MusicPlayer
            videoId={musicId}
            playing={isPlaying}
            volume={isMuted ? 0 : localVolume}
          />

          <div className={styles.formGroup}>
            <label>YouTube Video ID or URL</label>
            <div className={styles.inputGroup}>
              <input
                type="text"
                value={musicId}
                onChange={(e) => handleMusicIdChange(e.target.value)}
                placeholder="Ex: dQw4w9WgXcQ or full URL"
              />
              <button className={styles.btn} onClick={() => handlePaste(setMusicId, extractVideoId)}>
                Paste
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
              <label style={{ marginBottom: 0 }}>Local Monitoring Volume: {localVolume}%</label>
              <button
                onClick={() => setIsMuted(!isMuted)}
                style={{
                  background: 'none',
                  border: '1px solid #ccc',
                  color: '#ccc',
                  borderRadius: '4px',
                  padding: '2px 5px',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                {isMuted ? 'Unmute' : 'Mute'}
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={localVolume}
              onChange={(e) => setLocalVolume(parseInt(e.target.value))}
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
