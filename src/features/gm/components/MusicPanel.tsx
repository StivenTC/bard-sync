'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import styles from '../gm.module.scss';
import { useSession } from '@/shared/hooks/useSession';
import { HistoryItem } from '@/shared/types';
import {
  Music,
  Link,
  ClipboardPaste,
  RefreshCw,
  Play,
  Pause,
  Volume2,
  VolumeX
} from 'lucide-react';

// Dynamic import for MusicPlayer
const MusicPlayer = dynamic(() => import('@/shared/components/MusicPlayer'), {
  ssr: false
});

interface MusicPanelProps {
  localVolume: number;
  onVolumeChange: (vol: number) => void;
  isMuted: boolean;
  onMuteToggle: () => void;
}

export default function MusicPanel({ localVolume, onVolumeChange, isMuted, onMuteToggle }: MusicPanelProps) {
  const { music, updateMusic } = useSession();

  const [musicId, setMusicId] = useState('');
  const [status, setStatus] = useState('');
  const [recentTracks, setRecentTracks] = useState<HistoryItem[]>([]);
  const [videoTitleCache, setVideoTitleCache] = useState<{ [key: string]: string }>({});

  // Sync local state
  useEffect(() => {
    if (music.videoId) setMusicId(music.videoId);
  }, [music]);

  // Load history
  useEffect(() => {
    const savedTracks = localStorage.getItem('recentTracks');
    if (savedTracks) {
      try {
        const parsed = JSON.parse(savedTracks);
        if (parsed.length > 0 && typeof parsed[0] === 'string') {
          setRecentTracks(parsed.map((id: string) => ({ name: id, value: id })));
        } else {
          setRecentTracks(parsed);
        }
      } catch (e) { console.error(e); }
    }
  }, []);

  const addToHistory = (name: string, value: string) => {
    if (!value) return;
    const filtered = recentTracks.filter(i => i.value !== value);
    const newList = [{ name: name || value, value }, ...filtered].slice(0, 5);
    setRecentTracks(newList);
    localStorage.setItem('recentTracks', JSON.stringify(newList));
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
      let titleToSave = updates.title;

      if (updates.videoId && !titleToSave) {
        const id = updates.videoId;
        let name = videoTitleCache[id] || id;

        if (name === id) {
          const fetchedTitle = await fetchVideoTitle(id);
          if (fetchedTitle) name = fetchedTitle;
        }
        titleToSave = name;
        addToHistory(name, id);
      }

      await updateMusic({
        ...updates,
        title: titleToSave || undefined
      });

      setStatus('Music updated');
      setTimeout(() => setStatus(''), 2000);

    } catch (error) {
      console.error(error);
      setStatus('Error updating music');
    }
  };

  const handleMusicIdChange = (val: string) => {
    const id = extractVideoId(val);
    setMusicId(id);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const id = extractVideoId(text);
      setMusicId(id);
      fetchVideoTitle(text);
    } catch (err) {
      console.error('Failed to read clipboard', err);
      setStatus('Error reading clipboard');
    }
  };

  return (
    <section className={styles.card} aria-labelledby="music-title">
      <h2 id="music-title"><Music size={24} aria-hidden="true" /> Music (YouTube)</h2>

      {/* Hidden Local Player for GM */}
      <MusicPlayer
        videoId={musicId}
        playing={music.isPlaying}
        volume={isMuted ? 0 : localVolume} />

      <div className={styles.formGroup}>
        <label htmlFor="music-id-input">YouTube Video ID or URL</label>
        <div className={styles.inputGroup}>
          <div className={styles.iconInput}>
            <Link size={16} aria-hidden="true" />
            <input
              id="music-id-input"
              type="text"
              value={musicId}
              onChange={(e) => handleMusicIdChange(e.target.value)}
              placeholder="Ex: dQw4w9WgXcQ or full URL" />
          </div>
          <button
            className={styles.iconBtn}
            onClick={handlePaste}
            title="Paste & Fetch Title"
            aria-label="Paste and Fetch Video Title" >
            <ClipboardPaste size={18} aria-hidden="true" />
          </button>
        </div>
        {/* History Chips */}
        {recentTracks.length > 0 && (
          <div className={styles.historyChips} aria-label="Recent Tracks">
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
                  aria-label={`Load track: ${item.name}`}
                  aria-pressed={isSelected} >
                  {item.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className={styles.volumeControl}>
        <label htmlFor="local-volume" className="sr-only">Local Volume</label>
        <input
          id="local-volume"
          type="range"
          min="0"
          max="100"
          value={localVolume}
          onChange={(e) => onVolumeChange(parseInt(e.target.value))}
          className={styles.rangeInput}
          aria-label="Local Volume" />
        <button
          onClick={onMuteToggle}
          className={styles.iconBtn}
          title={isMuted ? "Unmute" : "Mute"}
          aria-label={isMuted ? "Unmute" : "Mute"}>
          {isMuted ? <VolumeX size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}
        </button>
      </div>

      <div className={styles.buttonGroup}>
        <button
          className={`${styles.btn} ${music.isPlaying ? styles.secondary : styles.primary}`}
          onClick={() => handleUpdateMusicState({ isPlaying: !music.isPlaying, videoId: musicId })}
          aria-label={music.isPlaying ? "Pause Music" : "Play Music"}>
          {music.isPlaying ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
          {music.isPlaying ? ' PAUSE' : ' PLAY'}
        </button>
        <button
          className={`${styles.btn} ${styles.primary}`}
          onClick={() => handleUpdateMusicState({ videoId: musicId, isPlaying: true })}>
          <RefreshCw size={18} aria-hidden="true" /> Load & Play
        </button>
      </div>
      {status && <div className={`${styles.status} ${styles.success}`} role="status" style={{ marginTop: '1rem', textAlign: 'center' }}>{status}</div>}
    </section>
  );
}
