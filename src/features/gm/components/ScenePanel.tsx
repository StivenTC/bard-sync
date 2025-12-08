'use client';

import { useState, useEffect } from 'react';
import styles from '../gm.module.scss';
import { useSession } from '@/shared/hooks/useSession';
import { HistoryItem } from '@/shared/types';
import {
  ImageIcon,
  Link,
  ClipboardPaste,
  RefreshCw,
  Type
} from 'lucide-react';

export default function ScenePanel() {
  const { scene, updateScene } = useSession();

  // Local state for inputs
  const [sceneUrl, setSceneUrl] = useState('');
  const [sceneTitle, setSceneTitle] = useState('');
  const [status, setStatus] = useState('');
  const [recentScenes, setRecentScenes] = useState<HistoryItem[]>([]);

  // Sync local state with hook state when it changes from external source
  useEffect(() => {
    if (scene.imageUrl) setSceneUrl(scene.imageUrl);
    if (scene.title) setSceneTitle(scene.title);
  }, [scene]);

  // Load history from localStorage
  useEffect(() => {
    const savedScenes = localStorage.getItem('recentScenes');
    if (savedScenes) {
      try {
        const parsed = JSON.parse(savedScenes);
        if (parsed.length > 0 && typeof parsed[0] === 'string') {
          setRecentScenes(parsed.map((url: string) => ({ name: 'Scene', value: url })));
        } else {
          setRecentScenes(parsed);
        }
      } catch (e) { console.error(e); }
    }
  }, []);

  const addToHistory = (name: string, value: string) => {
    if (!value) return;
    const filtered = recentScenes.filter(i => i.value !== value);
    const newList = [{ name: name || value, value }, ...filtered].slice(0, 5);
    setRecentScenes(newList);
    localStorage.setItem('recentScenes', JSON.stringify(newList));
  };

  const handleUpdateScene = async () => {
    try {
      await updateScene({
        imageUrl: sceneUrl,
        title: sceneTitle
      });
      addToHistory(sceneTitle || 'Untitled Scene', sceneUrl);
      setStatus('Scene updated');
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      console.error(error);
      setStatus('Error updating scene');
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setSceneUrl(text);
    } catch (err) {
      console.error('Failed to read clipboard', err);
      setStatus('Error reading clipboard');
    }
  };

  return (
    <section className={styles.card} aria-labelledby="scene-title">
      <h2 id="scene-title"><ImageIcon size={24} aria-hidden="true" /> Visual Scene</h2>

      <div className={styles.formGroup}>
        <label htmlFor="scene-title-input">Scene Title</label>
        <div className={styles.inputGroup}>
          <div className={styles.iconInput}>
            <Type size={16} aria-hidden="true" />
            <input
              id="scene-title-input"
              type="text"
              value={sceneTitle}
              onChange={(e) => setSceneTitle(e.target.value)}
              placeholder="The Prancing Pony" />
          </div>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="scene-url-input">Image URL</label>
        <div className={styles.inputGroup}>
          <div className={styles.iconInput}>
            <Link size={16} aria-hidden="true" />
            <input
              id="scene-url-input"
              type="url"
              value={sceneUrl}
              onChange={(e) => setSceneUrl(e.target.value)}
              placeholder="https://example.com/map.jpg" />
          </div>
          <button className={styles.iconBtn} onClick={handlePaste} title="Paste" aria-label="Paste Image URL">
            <ClipboardPaste size={18} aria-hidden="true" />
          </button>
        </div>
        {/* History Chips */}
        {recentScenes.length > 0 && (
          <div className={styles.historyChips} aria-label="Recent Scenes">
            {recentScenes.map((item, i) => (
              <button
                key={i}
                className={styles.chip}
                onClick={() => {
                  setSceneUrl(item.value);
                  if (item.name && item.name !== 'Untitled Scene') setSceneTitle(item.name);
                }}
                title={item.value}
                aria-label={`Load scene: ${item.name}`} >
                {item.name}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className={styles.preview} aria-label="Scene Preview">
        {sceneUrl ? (
          <img src={sceneUrl} alt={`Preview of ${sceneTitle || 'scene'}`} />
        ) : (
          <p>No image selected</p>
        )}
      </div>
      <div className={styles.buttonGroup}>
        <button className={`${styles.btn} ${styles.primary}`} onClick={handleUpdateScene}>
          <RefreshCw size={18} aria-hidden="true" /> Update Scene
        </button>
      </div>
      {status && <div className={`${styles.status} ${styles.success}`} role="status" style={{ marginTop: '1rem', textAlign: 'center' }}>{status}</div>}
    </section>
  );
}
