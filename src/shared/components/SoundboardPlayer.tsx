import { useEffect, useRef } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/shared/lib/firebase';
import { SfxState } from '@/shared/types';

interface SoundboardPlayerProps {
  volume?: number; // 0-100
}

export default function SoundboardPlayer({ volume = 50 }: SoundboardPlayerProps) {
  const lastPlayedRef = useRef<number>(0);

  useEffect(() => {
    const sfxRef = ref(db, 'session/current/sfx');

    const unsubscribe = onValue(sfxRef, (snapshot) => {
      const data = snapshot.val() as SfxState;

      if (data && data.url && data.timestamp) {
        // Only play if the timestamp is newer than the last played timestamp
        // and reasonably recent (e.g., within the last 10 seconds)
        const now = Date.now();
        const isNew = data.timestamp > lastPlayedRef.current;
        const isRecent = (now - data.timestamp) < 10000;

        if (isNew && isRecent) {
          lastPlayedRef.current = data.timestamp;

          // Create a new Audio instance for each sound (Polyphony)
          // This prevents "play() request was interrupted" errors and allows overlapping sounds
          const audio = new Audio(data.url);
          audio.volume = volume / 100;
          audio.play().catch(e => console.error("Error playing SFX:", e));
        } else if (isNew && !isRecent) {
          lastPlayedRef.current = data.timestamp;
        }
      }
    });

    return () => unsubscribe();
  }, [volume]); // Re-subscribe if volume changes to ensure new sounds get current volume

  return null; // Invisible component
}
