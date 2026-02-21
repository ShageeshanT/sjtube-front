/**
 * API client for the SJ Tube backend
 */

const API_BASE = (import.meta.env.VITE_API_URL as string) || "http://localhost:8000";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
export interface VideoInfo {
  title: string;
  channel: string;
  duration: number | null;
  duration_string: string | null;
  thumbnail: string | null;
  view_count: number | null;
  upload_date: string | null;
  is_playlist: boolean;
  playlist_count: number | null;
}

export interface ValidateResponse {
  valid: boolean;
  info: VideoInfo | null;
  error: string | null;
}

export interface DownloadStartResponse {
  task_id: string;
  message: string;
}

export interface TaskStatus {
  task_id: string;
  status: "pending" | "downloading" | "processing" | "done" | "error";
  progress: number;
  speed: string | null;
  eta: string | null;
  filename: string | null;
  error: string | null;
}

export interface HistoryItem {
  filename: string;
  size: number;
  size_human: string;
  modified: string;
  download_url: string;
}

// ──────────────────────────────────────────────
// API Functions
// ──────────────────────────────────────────────

/** Validate a YouTube URL and get video metadata */
export async function validateUrl(url: string): Promise<ValidateResponse> {
  const res = await fetch(`${API_BASE}/api/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) throw new Error(`Validation failed: ${res.statusText}`);
  return res.json();
}

/** Start a download task */
export async function startDownload(params: {
  url: string;
  mode: "video" | "audio";
  quality: string;
  audio_format: string;
}): Promise<DownloadStartResponse> {
  const res = await fetch(`${API_BASE}/api/download`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Download failed");
  }
  return res.json();
}

/** Poll download status */
export async function getTaskStatus(taskId: string): Promise<TaskStatus> {
  const res = await fetch(`${API_BASE}/api/status/${taskId}`);
  if (!res.ok) throw new Error(`Status check failed: ${res.statusText}`);
  return res.json();
}

/** Get download history */
export async function getHistory(): Promise<HistoryItem[]> {
  const res = await fetch(`${API_BASE}/api/history`);
  if (!res.ok) throw new Error(`History fetch failed: ${res.statusText}`);
  return res.json();
}

/** Delete a file from history */
export async function deleteFile(filename: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/history/${encodeURIComponent(filename)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Delete failed: ${res.statusText}`);
}

/** Get the download URL for a file */
export function getDownloadUrl(filename: string): string {
  return `${API_BASE}/downloads/${encodeURIComponent(filename)}`;
}
