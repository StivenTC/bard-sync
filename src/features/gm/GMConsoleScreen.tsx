'use client';

import { useState, useEffect } from 'react';
import styles from './gm.module.scss';
import dynamic from 'next/dynamic';
import SoundboardPanel from './components/SoundboardPanel';
import SoundboardPlayer from '@/shared/components/SoundboardPlayer';
import { useSession } from '@/shared/hooks/useSession';
import { HistoryItem } from '@/shared/types';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Image as ImageIcon,
  Music,
  Link,
  ClipboardPaste,
  RefreshCw,
  Type
} from 'lucide-react';

// Dynamic import for MusicPlayer
const MusicPlayer = dynamic(() => import('@/shared/components/MusicPlayer'), {
  ssr: false
});

export default function GMConsoleScreen() {
  const { scene, music, updateScene, updateMusic } = useSession();

  // Local state for inputs
  const [sceneUrl, setSceneUrl] = useState('');
  const [sceneTitle, setSceneTitle] = useState('');
  const [musicId, setMusicId] = useState('');

  // Sync local state with hook state when it changes from external source
  useEffect(() => {
    if (scene.imageUrl) setSceneUrl(scene.imageUrl);
    if (scene.title) setSceneTitle(scene.title);
  }, [scene]);

  useEffect(() => {
    if (music.videoId) setMusicId(music.videoId);
  }, [music]);

  // History state
  const [recentScenes, setRecentScenes] = useState<HistoryItem[]>([]);
  const [recentTracks, setRecentTracks] = useState<HistoryItem[]>([]);

  // Cache for video titles to use in history
  const [videoTitleCache, setVideoTitleCache] = useState<{ [key: string]: string }>({});

  // Local audio state for GM
  const [localVolume, setLocalVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);

  // Feedback state
  const [status, setStatus] = useState('');

  // Load history from localStorage
  useEffect(() => {
    const savedScenes = localStorage.getItem('recentScenes');
    const savedTracks = localStorage.getItem('recentTracks');
    if (savedScenes) {
      try {
        const parsed = JSON.parse(savedScenes);
        // Migration check: if it's an array of strings, convert to objects
        if (parsed.length > 0 && typeof parsed[0] === 'string') {
          setRecentScenes(parsed.map((url: string) => ({ name: 'Scene', value: url })));
        } else {
          setRecentScenes(parsed);
        }
      } catch (e) { console.error(e); }
    }
    if (savedTracks) {
      try {
        const parsed = JSON.parse(savedTracks);
        // Migration check
        if (parsed.length > 0 && typeof parsed[0] === 'string') {
          setRecentTracks(parsed.map((id: string) => ({ name: id, value: id })));
        } else {
          setRecentTracks(parsed);
        }
      } catch (e) { console.error(e); }
    }
  }, []);

  const addToHistory = (name: string, value: string, list: HistoryItem[], setter: (val: HistoryItem[]) => void, key: string) => {
    if (!value) return;
    // Remove existing item with same value to avoid duplicates
    const filtered = list.filter(i => i.value !== value);
    // Add new item to top
    const newList = [{ name: name || value, value }, ...filtered].slice(0, 5);
    setter(newList);
    localStorage.setItem(key, JSON.stringify(newList));
  };

  const handleUpdateScene = async () => {
    try {
      await updateScene({
        imageUrl: sceneUrl,
        title: sceneTitle
      });
      addToHistory(sceneTitle || 'Untitled Scene', sceneUrl, recentScenes, setRecentScenes, 'recentScenes');
      setStatus('Scene updated');
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      console.error(error);
      setStatus('Error updating scene');
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

  const fetchVideoTitle = async (videoIdOrUrl: string): Promise<string | null> => {
    const id = extractVideoId(videoIdOrUrl);
    if (!id || id.length < 5) return null;

    // Return cached if available
    if (videoTitleCache[id]) return videoTitleCache[id];

    try {
      const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${id}`);
      const data = await response.json();
      if (data.title) {
        setVideoTitleCache(prev => ({ ...prev, [id]: data.title }));
        return data.title;
      }
    } catch (error) {
      console.error("Failed to fetch video title", error);
    }
    return null;
  };

  const handleUpdateMusicState = async (updates: { videoId?: string; isPlaying?: boolean; title?: string }) => {
    try {
      // If we have a videoId but no title in updates, try to get it from cache or fetch it
      let titleToSave = updates.title;

      if (updates.videoId && !titleToSave) {
        const id = updates.videoId;
        let name = videoTitleCache[id] || id;

        if (name === id) {
          const fetchedTitle = await fetchVideoTitle(id);
          if (fetchedTitle) name = fetchedTitle;
        }
        titleToSave = name;

        // Also update history
        addToHistory(name, id, recentTracks, setRecentTracks, 'recentTracks');
      }

      await updateMusic({
        ...updates,
        title: titleToSave || undefined
      });

    } catch (error) {
      console.error(error);
      setStatus('Error updating music');
    }
  };

  const handleMusicIdChange = (val: string) => {
    const id = extractVideoId(val);
    setMusicId(id);
  };

  const handlePaste = async (setter: (val: string) => void, parser?: (val: string) => string, autoFetchTitle: boolean = false) => {
    try {
      const text = await navigator.clipboard.readText();
      const value = parser ? parser(text) : text;
      setter(value);

      if (autoFetchTitle) {
        fetchVideoTitle(text);
      }
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
          <h2><ImageIcon size={24} /> Visual Scene</h2>

          <div className={styles.formGroup}>
            <label>Scene Title</label>
            <div className={styles.inputGroup}>
              <div className={styles.iconInput}>
                <Type size={16} />
                <input
                  type="text"
                  value={sceneTitle}
                  onChange={(e) => setSceneTitle(e.target.value)}
                  placeholder="The Prancing Pony"
                />
              </div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Image URL</label>
            <div className={styles.inputGroup}>
              <div className={styles.iconInput}>
                <Link size={16} />
                <input
                  type="url"
                  value={sceneUrl}
                  onChange={(e) => setSceneUrl(e.target.value)}
                  placeholder="https://example.com/map.jpg"
                />
              </div>
              <button className={styles.iconBtn} onClick={() => handlePaste(setSceneUrl)} title="Paste">
                <ClipboardPaste size={18} />
              </button>
            </div>
            {/* History Chips */}
            {recentScenes.length > 0 && (
              <div className={styles.historyChips}>
                {recentScenes.map((item, i) => (
                  <button
                    key={i}
                    className={styles.chip}
                    onClick={() => {
                      setSceneUrl(item.value);
                      if (item.name && item.name !== 'Untitled Scene') setSceneTitle(item.name);
                    }}
                    title={item.value}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className={styles.preview}>
            {sceneUrl ? (
              <img src={sceneUrl} alt="Preview" />
            ) : (
              <p>No image selected</p>
            )}
          </div>
          <div className={styles.buttonGroup}>
            <button className={`${styles.btn} ${styles.primary}`} onClick={handleUpdateScene}>
              <RefreshCw size={18} /> Update Scene
            </button>
          </div>
        </div>

        {/* Music Panel */}
        <div className={styles.card}>
          <h2><Music size={24} /> Music (YouTube)</h2>

          {/* Hidden Local Player for GM */}
          <MusicPlayer
            videoId={musicId}
            playing={music.isPlaying}
            volume={isMuted ? 0 : localVolume}
          />

          <div className={styles.formGroup}>
            <label>YouTube Video ID or URL</label>
            <div className={styles.inputGroup}>
              <div className={styles.iconInput}>
                <Link size={16} />
                <input
                  type="text"
                  value={musicId}
                  onChange={(e) => handleMusicIdChange(e.target.value)}
                  placeholder="Ex: dQw4w9WgXcQ or full URL"
                />
              </div>
              <button
                className={styles.iconBtn}
                onClick={() => handlePaste(setMusicId, extractVideoId, true)}
                title="Paste & Fetch Title"
              >
                <ClipboardPaste size={18} />
              </button>
            </div>
            {/* History Chips */}
            {recentTracks.length > 0 && (
              <div className={styles.historyChips}>
                {recentTracks.map((item, i) => {
                  const isSelected = musicId === item.value;
                  return (
                    <button
                      key={i}
                      className={`${styles.chip} ${isSelected ? styles.selected : ''}`}
                      onClick={() => {
                        setMusicId(item.value);
                      }}
                      title={item.value}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className={styles.volumeControl}>
            <input
              type="range"
              min="0"
              max="100"
              value={localVolume}
              onChange={(e) => setLocalVolume(parseInt(e.target.value))}
              className={styles.rangeInput}
            />
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={styles.iconBtn}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>

          <div className={styles.buttonGroup}>
            <button
              className={`${styles.btn} ${music.isPlaying ? styles.secondary : styles.primary}`}
              onClick={() => handleUpdateMusicState({ isPlaying: !music.isPlaying, videoId: musicId })}
            >
              {music.isPlaying ? <Pause size={18} /> : <Play size={18} />}
              {music.isPlaying ? ' PAUSE' : ' PLAY'}
            </button>
            <button
              className={`${styles.btn} ${styles.primary}`}
              onClick={() => handleUpdateMusicState({ videoId: musicId, isPlaying: true })}
            >
              <RefreshCw size={18} /> Load & Play
            </button>
          </div>
        </div>

        {/* Soundboard Panel */}
        <SoundboardPanel />

        {/* Hidden Soundboard Player for GM Monitoring */}
        <SoundboardPlayer volume={isMuted ? 0 : localVolume} />
      </div>
    </div>
  );
}
