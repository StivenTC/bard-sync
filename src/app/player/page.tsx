'use client';

import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import styles from './player.module.scss';

export default function PlayerView() {
  const [hasJoined, setHasJoined] = useState(false);
  const [sceneUrl, setSceneUrl] = useState('');

  useEffect(() => {
    // Escuchar cambios en la escena
    const sceneRef = ref(db, 'session/current/scene');
    const unsubscribe = onValue(sceneRef, (snapshot) => {
      const data = snapshot.val();
      if (data?.imageUrl) {
        setSceneUrl(data.imageUrl);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleJoin = () => {
    setHasJoined(true);
    // Aquí inicializaremos el AudioContext en la Fase 4
    console.log("Player joined session");
  };

  return (
    <div className={styles.container}>
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
