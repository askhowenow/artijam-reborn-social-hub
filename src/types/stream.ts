
export interface Stream {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  status: StreamStatus;
  startedAt: string | null;
  endedAt: string | null;
  viewerCount: number;
  maxViewerCount: number;
  streamKey: string;
  playbackUrl: string | null;
  ingestUrl: string | null;
  recordingUrl: string | null;
  isRecorded: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export type StreamStatus = 'offline' | 'live' | 'ended';

export interface StreamChat {
  id: string;
  streamId: string;
  userId: string;
  message: string;
  createdAt: string;
  user?: {
    username: string;
    avatarUrl: string;
    fullName: string;
  };
}

export interface StreamReaction {
  id: string;
  streamId: string;
  userId: string;
  reactionType: string;
  createdAt: string;
}

export interface ApiStream {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  status: string;
  started_at: string | null;
  ended_at: string | null;
  viewer_count: number;
  max_viewer_count: number;
  stream_key: string;
  playback_url: string | null;
  ingest_url: string | null;
  recording_url: string | null;
  is_recorded: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}
