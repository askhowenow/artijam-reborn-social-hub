
import { ApiStream, Stream } from '@/types/stream';

export const transformStreamFromApi = (apiStream: ApiStream): Stream => {
  return {
    id: apiStream.id,
    userId: apiStream.user_id,
    title: apiStream.title,
    description: apiStream.description,
    thumbnailUrl: apiStream.thumbnail_url,
    status: apiStream.status as Stream['status'],
    startedAt: apiStream.started_at,
    endedAt: apiStream.ended_at,
    viewerCount: apiStream.viewer_count,
    maxViewerCount: apiStream.max_viewer_count,
    streamKey: apiStream.stream_key,
    playbackUrl: apiStream.playback_url,
    ingestUrl: apiStream.ingest_url,
    recordingUrl: apiStream.recording_url,
    isRecorded: apiStream.is_recorded,
    isPublic: apiStream.is_public,
    createdAt: apiStream.created_at,
    updatedAt: apiStream.updated_at
  };
};
