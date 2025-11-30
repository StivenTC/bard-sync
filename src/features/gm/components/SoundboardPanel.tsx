'use client';

import { useState } from 'react';
import { ref, update } from 'firebase/database';
import { db } from '@/lib/firebase';
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
    <div className={styles.card}>
      <h2><Music size={24} /> Soundboard</h2>

      <div className={styles.grid} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.75rem' }}>
        {PRESET_SFX.map((sfx) => (
          <button
            key={sfx.name}
            className={styles.btn}
            style={{
              flexDirection: 'column',
              padding: '1rem 0.5rem',
              fontSize: '0.8rem',
              height: 'auto',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--color-text-primary)'
            }}
            onClick={() => playSfx(sfx.url, sfx.name)}
            title={sfx.name}
          >
            <div style={{ marginBottom: '0.5rem', color: 'var(--color-accent-gold)' }}>
              {sfx.icon}
            </div>
            <span>{sfx.name}</span>
          </button>
        ))}
      </div>

      <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
        <label>Custom SFX URL</label>
        <div className={styles.inputGroup}>
          <div className={styles.iconInput}>
            <Music size={16} />
            <input
              type="text"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://example.com/sound.mp3"
            />
          </div>
          <button
            className={styles.iconBtn}
            onClick={() => playSfx(customUrl, 'Custom SFX')}
            disabled={!customUrl}
            title="Play Custom SFX"
          >
            <Play size={18} />
          </button>
        </div>
      </div>

      {status && <div className={styles.status} style={{ marginTop: '0.5rem', textAlign: 'center' }}>{status}</div>}
    </div>
  );
}
