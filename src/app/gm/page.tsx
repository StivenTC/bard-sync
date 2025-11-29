'use client';

import { useState, useEffect } from 'react';
import { ref, update, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import styles from './gm.module.scss';

// Tipos para nuestro estado
interface SceneState {
  imageUrl: string;
}

interface MusicState {
  videoId: string;
  isPlaying: boolean;
  volume: number;
}

export default function GMConsole() {
  // Estado local para los inputs
  const [sceneUrl, setSceneUrl] = useState('');
  const [musicId, setMusicId] = useState('');
  const [volume, setVolume] = useState(50);
  const [isPlaying, setIsPlaying] = useState(false);

  // Estado de feedback
  const [status, setStatus] = useState('');

  // Cargar estado inicial desde Firebase
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
      setStatus('Escena actualizada');
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      console.error(error);
      setStatus('Error actualizando escena');
    }
  };

  const updateMusicState = async (updates: Partial<MusicState>) => {
    try {
      await update(ref(db, 'session/current/music'), {
        ...updates,
        timestamp: Date.now() // Forzar actualización
      });
    } catch (error) {
      console.error(error);
      setStatus('Error actualizando música');
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseInt(e.target.value);
    setVolume(newVol);
    // Debounce simple: actualizar DB solo al soltar o usar un timeout si fuera necesario.
    // Para simplificar en esta fase, actualizamos directo pero podríamos optimizar.
    updateMusicState({ volume: newVol });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>GM Console</h1>
        {status && <div className={`${styles.status} ${styles.success}`}>{status}</div>}
      </header>

      <div className={styles.grid}>
        {/* Panel de Escena */}
        <div className={styles.card}>
          <h2>Escena Visual</h2>
          <div className={styles.formGroup}>
            <label>URL de Imagen</label>
            <input
              type="url"
              value={sceneUrl}
              onChange={(e) => setSceneUrl(e.target.value)}
              placeholder="https://ejemplo.com/mapa.jpg"
            />
          </div>
          <div className={styles.preview}>
            {sceneUrl ? (
              <img src={sceneUrl} alt="Vista previa" />
            ) : (
              <p>Sin imagen</p>
            )}
          </div>
          <div className={styles.buttonGroup}>
            <button className={`${styles.btn} ${styles.primary}`} onClick={updateScene}>
              Actualizar Escena
            </button>
          </div>
        </div>

        {/* Panel de Música */}
        <div className={styles.card}>
          <h2>Música (YouTube)</h2>
          <div className={styles.formGroup}>
            <label>YouTube Video ID</label>
            <input
              type="text"
              value={musicId}
              onChange={(e) => setMusicId(e.target.value)}
              placeholder="Ej: dQw4w9WgXcQ"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Volumen: {volume}%</label>
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
              Cargar & Play
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
