import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Download,
  Trash2,
  FileVideo,
  FileAudio,
  File,
  RefreshCw,
  Loader2,
  FolderOpen,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import type { HistoryItem } from "@/lib/api";
import { getHistory, deleteFile, saveFile } from "@/lib/api";

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getHistory();
      setItems(data);
    } catch {
      toast.error("Failed to load history. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleDelete = async (filename: string) => {
    setDeleting(filename);
    try {
      await deleteFile(filename);
      setItems((prev) => prev.filter((i) => i.filename !== filename));
      toast.success("File deleted");
    } catch {
      toast.error("Failed to delete file");
    } finally {
      setDeleting(null);
    }
  };

  const handleDownload = (filename: string) => {
    saveFile(filename).catch(() => {});
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (["mp4", "webm", "mkv", "avi"].includes(ext || "")) return FileVideo;
    if (["mp3", "m4a", "wav", "ogg", "flac"].includes(ext || "")) return FileAudio;
    return File;
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
        <p className="text-sm">Loading download history...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
          <FolderOpen className="h-8 w-8" />
        </div>
        <h2 className="text-lg font-semibold text-slate-700 mb-1">No downloads yet</h2>
        <p className="text-sm">Downloaded files will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Download History</h1>
          <p className="text-sm text-slate-500 mt-1">
            {items.length} file{items.length !== 1 ? "s" : ""} downloaded
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchHistory}
          className="gap-2 border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const Icon = getFileIcon(item.filename);
          const ext = item.filename.split(".").pop()?.toUpperCase() || "";
          const isDeleting = deleting === item.filename;

          return (
            <Card
              key={item.filename}
              className="group border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200"
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 flex-shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate" title={item.filename}>
                      {item.filename}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-slate-100 text-slate-600">
                        {ext}
                      </Badge>
                      <span className="text-[11px] text-slate-400">{item.size_human}</span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400">{formatDate(item.modified)}</p>

                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1.5 h-8 text-xs border-slate-200 text-blue-600 hover:bg-blue-50 hover:border-blue-200"
                    onClick={() => handleDownload(item.filename)}
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200"
                    onClick={() => handleDelete(item.filename)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
