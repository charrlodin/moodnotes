export interface Note {
  id: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  createdAt: number;
}

export interface AudioTrack {
  id: string;
  name: string;
  url: string;
}

export interface BackgroundImage {
  id: string;
  name: string;
  url: string;
  thumbnail?: string;
}
