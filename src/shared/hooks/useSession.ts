import { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { db } from '@/shared/lib/firebase';
import { SceneState, MusicState } from '@/shared/types';

export function useSession() {
  const [scene, setScene] = useState<SceneState>({ imageUrl: '', title: '' });
  const [music, setMusic] = useState<MusicState>({ videoId: '', isPlaying: false });

  useEffect(() => {
    const sceneRef = ref(db, 'session/current/scene');
    const musicRef = ref(db, 'session/current/music');

    const unsubScene = onValue(sceneRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setScene({
          imageUrl: data.imageUrl || '',
          title: data.title || ''
        });
      }
    });

    const unsubMusic = onValue(musicRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setMusic({
          videoId: data.videoId || '',
          isPlaying: typeof data.isPlaying === 'boolean' ? data.isPlaying : false,
          title: data.title,
          volume: data.volume,
          timestamp: data.timestamp
        });
      }
    });

    return () => {
      unsubScene();
      unsubMusic();
    };
  }, []);

  const updateScene = async (newScene: Partial<SceneState>) => {
    await update(ref(db, 'session/current/scene'), newScene);
  };

  const updateMusic = async (newMusic: Partial<MusicState>) => {
    await update(ref(db, 'session/current/music'), {
      ...newMusic,
      timestamp: Date.now()
    });
  };

  return {
    scene,
    music,
    updateScene,
    updateMusic
  };
}
