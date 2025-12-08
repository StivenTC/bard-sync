import { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { db } from '@/shared/lib/firebase';
import { SceneState, MusicState } from '@/shared/types';

export function useSession() {
  const [scene, setScene] = useState<SceneState>({ imageUrl: '', title: '' });
  const [music, setMusic] = useState<MusicState>({ videoId: '', isPlaying: false });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
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
      setIsLoading(false);
    }, (err) => {
      console.error("Firebase Scene Error:", err);
      setError("Failed to load scene data");
      setIsLoading(false);
    });

    const unsubMusic = onValue(musicRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setMusic({
          videoId: data.videoId || '',
          isPlaying: typeof data.isPlaying === 'boolean' ? data.isPlaying : false,
          title: data.title,
          timestamp: data.timestamp
        });
      }
      setIsLoading(false);
    }, (err) => {
      console.error("Firebase Music Error:", err);
      setError("Failed to load music data");
      setIsLoading(false);
    });

    return () => {
      unsubScene();
      unsubMusic();
    };
  }, []);

  const updateScene = async (newScene: Partial<SceneState>) => {
    try {
      setError(null);
      await update(ref(db, 'session/current/scene'), newScene);
    } catch (err) {
      console.error("Update Scene Error:", err);
      setError("Failed to update scene");
      throw err;
    }
  };

  const updateMusic = async (newMusic: Partial<MusicState>) => {
    try {
      setError(null);
      await update(ref(db, 'session/current/music'), {
        ...newMusic,
        timestamp: Date.now()
      });
    } catch (err) {
      console.error("Update Music Error:", err);
      setError("Failed to update music");
      throw err;
    }
  };

  return {
    scene,
    music,
    isLoading,
    error,
    updateScene,
    updateMusic
  };
}
