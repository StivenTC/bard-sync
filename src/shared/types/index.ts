export interface SceneState {
  imageUrl: string;
  title?: string;
}

export interface MusicState {
  videoId: string;
  isPlaying: boolean;
  title?: string;
  volume?: number;
  timestamp?: number;
}

export interface HistoryItem {
  name: string;
  value: string;
}

export interface SfxState {
  url: string;
  timestamp: number;
  name?: string;
}
