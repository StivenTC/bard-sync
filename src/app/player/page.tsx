'use client';

import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import styles from './player.module.scss';
import dynamic from 'next/dynamic';

// Importación dinámica para evitar SSR (Hydration Mismatch)
const MusicPlayer = dynamic(() => import('@/components/MusicPlayer'), {
  ssr: false
});

export default function PlayerView() {
  const [hasJoined, setHasJoined] = useState(false);
  const [sceneUrl, setSceneUrl] = useState('');

  // Estado para la música
  const [musicState, setMusicState] = useState({
    videoId: '',
    isPlaying: false,
    volume: 50
  });

  useEffect(() => {
    // Escuchar cambios en la escena
    const sceneRef = ref(db, 'session/current/scene');
    const unsubScene = onValue(sceneRef, (snapshot) => {
      const data = snapshot.val();
      if (data?.imageUrl) {
        setSceneUrl(data.imageUrl);
      }
    });

    // Escuchar cambios en la música
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
      {/* Componente de Música (Solo renderiza si ha entrado) */}
      {hasJoined && (
        <div className={styles.playerWrapper}>
          <MusicPlayer
            videoId={musicState.videoId}
            playing={musicState.isPlaying}
            volume={musicState.volume}
          />
        </div>
      )}

      {/* Capa de Fondo */}
      <div
        className={styles.background}
        style={{ backgroundImage: sceneUrl ? `url(${sceneUrl})` : 'none' }}
      />

      {/* Pantalla de "Join" (Overlay) */}
      {!hasJoined && (
        <div className={styles.overlay}>
          <h1>BardSync</h1>
          <p>
            Bienvenido a la sesión. Haz clic en el botón para sincronizarte
            con el tablero del Game Master y habilitar el audio.
          </p>
          <button className={styles.joinButton} onClick={handleJoin}>
            Entrar a la Sesión
          </button>
        </div>
      )}
    </div>
  );
}
