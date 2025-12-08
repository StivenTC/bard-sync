'use client';

import { useState } from 'react';
import { ref, update } from 'firebase/database';
import { db } from '@/shared/lib/firebase';
import styles from '../gm.module.scss'; // Reusing GM styles for consistency
import {
  Sword,
  MousePointerClick,
  Radio,
  Settings,
  Cog,
  Sparkles,
  Music,
  Play,
  Send
} from 'lucide-react';

const PRESET_SFX = [
  { name: 'Sword Clash', icon: <Sword size={24} />, url: 'https://www.myinstants.com/media/sounds/sword-clash.mp3' },
  { name: 'Trap Click', icon: <MousePointerClick size={24} />, url: 'https://www.myinstants.com/media/sounds/bandicam-right-click-sound.mp3' },
  { name: 'Ping', icon: <Radio size={24} />, url: 'https://www.myinstants.com/media/sounds/sonar-ping-sound-effect.mp3' },
  { name: 'Gear', icon: <Settings size={24} />, url: 'https://www.myinstants.com/media/sounds/light-gears.mp3' },
  { name: 'Mechanism', icon: <Cog size={24} />, url: 'https://www.myinstants.com/media/sounds/heavy-gears.mp3' },
  { name: 'Magic', icon: <Sparkles size={24} />, url: 'https://www.myinstants.com/media/sounds/magic-fairy.mp3' },
];

export default function SoundboardPanel() {
  const [customUrl, setCustomUrl] = useState('');
  const [status, setStatus] = useState('');

  const playSfx = async (url: string, name: string) => {
    try {
      await update(ref(db, 'session/current/sfx'), {
        url,
        timestamp: Date.now(),
        name
      });
      setStatus(`Playing: ${name}`);
      setTimeout(() => setStatus(''), 2000);
    } catch (error) {
      console.error('Error playing SFX:', error);
      setStatus('Error playing SFX');
    }
  };

  return (
    <section className={styles.card} aria-labelledby="soundboard-title">
      <h2 id="soundboard-title"><Music size={24} aria-hidden="true" /> Soundboard</h2>

      <div className={styles.sfxGrid} role="group" aria-label="Sound Effects">
        {PRESET_SFX.map((sfx) => (
          <button
            key={sfx.name}
            className={`${styles.btn} ${styles.sfxBtn}`}
            onClick={() => playSfx(sfx.url, sfx.name)}
            title={sfx.name}
            aria-label={`Play sound: ${sfx.name}`} >
            <div className={styles.sfxIcon} aria-hidden="true">
              {sfx.icon}
            </div>
            <span>{sfx.name}</span>
          </button>
        ))}
      </div>

      <div className={`${styles.formGroup} ${styles.customSfxGroup}`}>
        <label htmlFor="custom-sfx-url">Custom SFX URL</label>
        <div className={styles.inputGroup}>
          <div className={styles.iconInput}>
            <Music size={16} aria-hidden="true" />
            <input
              id="custom-sfx-url"
              type="text"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://example.com/sound.mp3" />
          </div>
          <button
            className={styles.iconBtn}
            onClick={() => playSfx(customUrl, 'Custom SFX')}
            disabled={!customUrl}
            title="Play Custom SFX"
            aria-label="Play Custom Sound Effect" >
            <Play size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      {status && <div className={`${styles.status} ${styles.sfxStatus}`} role="status">{status}</div>}
    </section>
  );
}
