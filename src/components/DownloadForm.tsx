import { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import {
  Search,
  Download,
  Music,
  Video,
  Loader2,
  Copy,
  Check,
  Clock,
  Eye,
  User,
  ListVideo,
  Zap,
  Lock,
  Crown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

import { usePlan, isQualityLocked, PRO_QUALITIES } from "@/hooks/usePlan";
import type { VideoInfo, TaskStatus } from "@/lib/api";
import {
  validateUrl,
  startDownload,
  getTaskStatus,
  getDownloadUrl,
} from "@/lib/api";

// All quality options with display labels
const QUALITY_OPTIONS = [
  { value: "144", label: "144p" },
  { value: "270", label: "270p" },
  { value: "360", label: "360p" },
  { value: "480", label: "480p" },
  { value: "720", label: "720p" },
  { value: "1080", label: "1080p" },
  { value: "best", label: "Best" },
];

export default function DownloadForm() {
  const { getToken } = useAuth();
  const { isPro } = usePlan();

  const [url, setUrl] = useState("");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [validating, setValidating] = useState(false);
  const [mode, setMode] = useState<"video" | "audio">("video");
  const [quality, setQuality] = useState("360");
  const [audioFormat, setAudioFormat] = useState("mp3");
  const [downloading, setDownloading] = useState(false);
  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null);
  const [copied, setCopied] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // ── URL validation with debounce ──
  const handleUrlChange = useCallback((value: string) => {
    setUrl(value);
    setVideoInfo(null);
    setTaskStatus(null);
    setDownloading(false);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = value.trim();
    if (!trimmed || (!trimmed.includes("youtube.com") && !trimmed.includes("youtu.be"))) {
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setValidating(true);
      try {
        const res = await validateUrl(trimmed);
        if (res.valid && res.info) {
          setVideoInfo(res.info);
          toast.success("Video found!");
        } else {
          toast.error(res.error || "Invalid video URL");
        }
      } catch {
        toast.error("Failed to validate URL. Is the backend running?");
      } finally {
        setValidating(false);
      }
    }, 800);
  }, []);

  // ── Start download ──
  const handleDownload = async () => {
    if (!url.trim()) return;

    // Check if selected quality is locked
    if (mode === "video" && isQualityLocked(quality, isPro)) {
      toast.error("This quality requires a Pro plan. Upgrade to unlock!");
      return;
    }

    setDownloading(true);
    setTaskStatus(null);

    try {
      const res = await startDownload({
        url: url.trim(),
        mode,
        quality: mode === "video" ? quality : "best",
        audio_format: audioFormat,
      });

      toast.info("Download started!");

      pollRef.current = setInterval(async () => {
        try {
          const status = await getTaskStatus(res.task_id);
          setTaskStatus(status);

          if (status.status === "done") {
            if (pollRef.current) clearInterval(pollRef.current);
            setDownloading(false);
            toast.success("Download complete!", { duration: 5000 });

            if (status.filename) {
              const link = document.createElement("a");
              link.href = getDownloadUrl(status.filename);
              link.download = status.filename;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
          } else if (status.status === "error") {
            if (pollRef.current) clearInterval(pollRef.current);
            setDownloading(false);
            toast.error(status.error || "Download failed");
          }
        } catch {
          // Network error during poll — keep trying
        }
      }, 1000);
    } catch (e) {
      setDownloading(false);
      toast.error(e instanceof Error ? e.message : "Download failed");
    }
  };

  // ── Copy title ──
  const copyTitle = async () => {
    if (!videoInfo?.title) return;
    await navigator.clipboard.writeText(videoInfo.title);
    setCopied(true);
    toast.success("Title copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const formatViews = (n: number | null) => {
    if (!n) return null;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M views`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K views`;
    return `${n} views`;
  };

  const isDownloadActive = downloading || taskStatus?.status === "downloading" || taskStatus?.status === "processing";

  return (
    <div className="space-y-8">
      {/* ── Hero ── */}
      <div className="flex flex-col items-center text-center space-y-4 pt-4 pb-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm text-blue-700 font-medium">
          <Zap className="h-3.5 w-3.5" />
          Powered by yt-dlp
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          Download YouTube Videos
        </h1>
        <p className="max-w-lg text-slate-500">
          Paste a YouTube URL to download videos or extract audio in the highest quality.
        </p>
      </div>

      {/* ── URL Input ── */}
      <div className="relative max-w-2xl mx-auto">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {validating ? (
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          ) : (
            <Search className="h-5 w-5" />
          )}
        </div>
        <Input
          type="url"
          placeholder="Paste a YouTube URL here..."
          value={url}
          onChange={(e) => handleUrlChange(e.target.value)}
          className="h-14 rounded-xl border-slate-200 bg-white pl-12 pr-4 text-base placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-400 shadow-sm transition-all"
        />
      </div>

      {/* ── Video Preview ── */}
      {videoInfo && (
        <Card className="max-w-2xl mx-auto overflow-hidden border-slate-200 bg-white shadow-md animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row">
              {/* Thumbnail */}
              {videoInfo.thumbnail && (
                <div className="relative sm:w-72 flex-shrink-0">
                  <img
                    src={videoInfo.thumbnail}
                    alt={videoInfo.title}
                    className="h-full w-full object-cover"
                  />
                  {videoInfo.duration_string && (
                    <div className="absolute bottom-2 right-2 rounded-md bg-black/80 px-2 py-0.5 text-xs font-medium text-white">
                      {videoInfo.duration_string}
                    </div>
                  )}
                  {videoInfo.is_playlist && (
                    <Badge className="absolute top-2 left-2 bg-blue-600 text-white border-0">
                      <ListVideo className="h-3 w-3 mr-1" />
                      Playlist · {videoInfo.playlist_count || "?"} videos
                    </Badge>
                  )}
                </div>
              )}

              {/* Info */}
              <div className="flex-1 p-5 space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-base font-semibold leading-snug text-slate-900 line-clamp-2">
                      {videoInfo.title}
                    </h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={copyTitle}
                      className="flex-shrink-0 h-8 w-8 text-slate-400 hover:text-slate-700"
                    >
                      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      {videoInfo.channel}
                    </span>
                    {videoInfo.duration_string && (
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {videoInfo.duration_string}
                      </span>
                    )}
                    {videoInfo.view_count && (
                      <span className="flex items-center gap-1.5">
                        <Eye className="h-3.5 w-3.5" />
                        {formatViews(videoInfo.view_count)}
                      </span>
                    )}
                  </div>
                </div>

                {/* ── Download Options ── */}
                <div className="space-y-3 pt-2">
                  {/* Mode Toggle */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500">Format</label>
                    <div className="flex rounded-lg border border-slate-200 p-0.5 w-fit">
                      <button
                        onClick={() => setMode("video")}
                        className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-medium transition-all ${
                          mode === "video"
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        <Video className="h-3.5 w-3.5" />
                        Video
                      </button>
                      <button
                        onClick={() => setMode("audio")}
                        className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-medium transition-all ${
                          mode === "audio"
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        <Music className="h-3.5 w-3.5" />
                        Audio
                      </button>
                    </div>
                  </div>

                  {/* Quality Selector (video) or Audio format (audio) */}
                  {mode === "video" ? (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-500">Quality</label>
                      <div className="flex flex-wrap gap-1.5">
                        {QUALITY_OPTIONS.map((opt) => {
                          const locked = isQualityLocked(opt.value, isPro);
                          const selected = quality === opt.value;
                          return (
                            <button
                              key={opt.value}
                              onClick={() => {
                                if (locked) {
                                  toast("Pro feature", {
                                    description: "Upgrade to unlock higher qualities",
                                    action: {
                                      label: "Upgrade",
                                      onClick: () => window.location.href = "/upgrade",
                                    },
                                  });
                                  return;
                                }
                                setQuality(opt.value);
                              }}
                              className={`relative flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium border transition-all ${
                                selected && !locked
                                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                  : locked
                                  ? "bg-slate-50 text-slate-400 border-slate-200 cursor-pointer hover:border-blue-200"
                                  : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50"
                              }`}
                            >
                              {opt.label}
                              {locked && <Lock className="h-3 w-3 text-slate-400" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-500">Audio Format</label>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setAudioFormat("mp3")}
                          className={`rounded-lg px-3.5 py-1.5 text-xs font-medium border transition-all ${
                            audioFormat === "mp3"
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-slate-700 border-slate-200 hover:border-blue-300"
                          }`}
                        >
                          MP3
                        </button>
                        <button
                          onClick={() => {
                            if (!isPro) {
                              toast("Pro feature", {
                                description: "M4A format requires Pro plan",
                                action: {
                                  label: "Upgrade",
                                  onClick: () => window.location.href = "/upgrade",
                                },
                              });
                              return;
                            }
                            setAudioFormat("m4a");
                          }}
                          className={`flex items-center gap-1 rounded-lg px-3.5 py-1.5 text-xs font-medium border transition-all ${
                            audioFormat === "m4a"
                              ? "bg-blue-600 text-white border-blue-600"
                              : !isPro
                              ? "bg-slate-50 text-slate-400 border-slate-200 cursor-pointer"
                              : "bg-white text-slate-700 border-slate-200 hover:border-blue-300"
                          }`}
                        >
                          M4A {!isPro && <Lock className="h-3 w-3" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Download Button */}
                  <Button
                    onClick={handleDownload}
                    disabled={isDownloadActive}
                    className="w-full sm:w-auto gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/25 h-10"
                  >
                    {isDownloadActive ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    {isDownloadActive ? "Downloading..." : "Download Now"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Progress ── */}
      {taskStatus && taskStatus.status !== "done" && taskStatus.status !== "error" && (
        <Card className="max-w-2xl mx-auto border-slate-200 bg-white shadow-sm animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-sm font-medium text-slate-700 capitalize">{taskStatus.status}...</span>
              </div>
              <span className="text-sm font-mono text-slate-500">
                {taskStatus.progress.toFixed(1)}%
              </span>
            </div>
            <Progress value={taskStatus.progress} className="h-2" />
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="truncate max-w-[200px]">{taskStatus.filename || "Preparing..."}</span>
              <div className="flex items-center gap-4">
                {taskStatus.speed && <span>⚡ {taskStatus.speed}</span>}
                {taskStatus.eta && <span>⏱ ETA {taskStatus.eta}</span>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Done ── */}
      {taskStatus?.status === "done" && taskStatus.filename && (
        <Card className="max-w-2xl mx-auto border-emerald-200 bg-emerald-50/50 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <CardContent className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Check className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Download Complete</p>
                <p className="text-xs text-slate-500 truncate max-w-xs">{taskStatus.filename}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
              onClick={() => {
                const link = document.createElement("a");
                link.href = getDownloadUrl(taskStatus.filename!);
                link.download = taskStatus.filename!;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              <Download className="h-3.5 w-3.5" />
              Save Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Error ── */}
      {taskStatus?.status === "error" && (
        <Card className="max-w-2xl mx-auto border-red-200 bg-red-50/50 animate-in fade-in-0 duration-300">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-red-700">Download Failed</p>
            <p className="mt-1 text-xs text-red-500">{taskStatus.error || "An unknown error occurred"}</p>
          </CardContent>
        </Card>
      )}

      {/* ── Pro Upsell (for free users) ── */}
      {!isPro && videoInfo && (
        <div className="max-w-2xl mx-auto">
          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white flex-shrink-0">
                <Crown className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">Unlock all qualities</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upgrade to Pro for 480p, 720p, 1080p, Best quality + M4A audio
                </p>
              </div>
              <Link to="/upgrade">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                  Upgrade
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
