import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

import {
  Download,
  HardDrive,
  TrendingUp,
  Crown,
  ArrowRight,
  FileVideo,
  FileAudio,
  File,
  Clock,
  Loader2,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePlan } from "@/hooks/usePlan";
import type { HistoryItem } from "@/lib/api";
import { getHistory, getDownloadUrl } from "@/lib/api";

export default function DashboardPage() {
  const { user } = useUser();
  const { isPro, isTrial, trialDaysLeft } = usePlan();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getHistory();
        setHistory(data);
      } catch {
        // Backend might not be running
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Stats
  const totalDownloads = history.length;
  const totalSize = history.reduce((sum, item) => sum + item.size, 0);
  const totalSizeFormatted = totalSize > 1024 * 1024 * 1024
    ? `${(totalSize / (1024 * 1024 * 1024)).toFixed(1)} GB`
    : totalSize > 1024 * 1024
    ? `${(totalSize / (1024 * 1024)).toFixed(1)} MB`
    : `${(totalSize / 1024).toFixed(1)} KB`;

  const recentDownloads = history.slice(0, 5);
  const firstName = user?.firstName || "there";

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (["mp4", "webm", "mkv", "avi"].includes(ext || "")) return FileVideo;
    if (["mp3", "m4a", "wav", "ogg", "flac"].includes(ext || "")) return FileAudio;
    return File;
  };

  return (
    <div className="space-y-8">
      {/* ── Welcome ── */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Welcome back, {firstName} 👋
        </h1>
        <p className="mt-1 text-slate-500">
          Here's an overview of your downloads.
        </p>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Total Downloads */}
        <Card className="border-slate-200/60 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Downloads</p>
                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {loading ? "—" : totalDownloads}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Download className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Size */}
        <Card className="border-slate-200/60 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Storage Used</p>
                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {loading ? "—" : totalSizeFormatted}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <HardDrive className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan */}
        <Card className={`border-slate-200/60 shadow-sm hover:shadow-md transition-shadow ${isPro ? "bg-gradient-to-br from-blue-50 to-indigo-50" : "bg-white"}`}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Current Plan</p>
                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {isPro ? "Pro" : "Free"}
                </p>
                {isTrial && trialDaysLeft !== null && (
                  <p className="mt-0.5 text-xs text-blue-600">
                    {trialDaysLeft} days left in trial
                  </p>
                )}
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${isPro ? "bg-blue-100 text-blue-700" : "bg-amber-50 text-amber-600"}`}>
                <Crown className="h-6 w-6" />
              </div>
            </div>
            {!isPro && (
              <Link to="/upgrade" className="mt-3 block">
                <Button size="sm" className="w-full gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20">
                  Upgrade to Pro <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/download">
          <Card className="group border-slate-200/60 bg-white shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white group-hover:scale-105 transition-transform">
                <Download className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">New Download</p>
                <p className="text-sm text-slate-500">Paste a YouTube URL to get started</p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </CardContent>
          </Card>
        </Link>

        <Link to="/history">
          <Card className="group border-slate-200/60 bg-white shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white group-hover:scale-105 transition-transform">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">View All History</p>
                <p className="text-sm text-slate-500">{totalDownloads} files downloaded</p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* ── Recent Downloads ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Recent Downloads</h2>
          {history.length > 5 && (
            <Link to="/history" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all →
            </Link>
          )}
        </div>

        {loading ? (
          <Card className="border-slate-200/60 bg-white">
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </CardContent>
          </Card>
        ) : recentDownloads.length === 0 ? (
          <Card className="border-slate-200/60 bg-white">
            <CardContent className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Clock className="h-8 w-8 mb-2" />
              <p className="text-sm">No downloads yet. Start your first download!</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-slate-200/60 bg-white shadow-sm">
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {recentDownloads.map((item) => {
                  const Icon = getFileIcon(item.filename);
                  const ext = item.filename.split(".").pop()?.toUpperCase() || "";
                  return (
                    <div key={item.filename} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/50 transition-colors">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 flex-shrink-0">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {item.filename}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-slate-100 text-slate-600">
                            {ext}
                          </Badge>
                          <span className="text-[11px] text-slate-400">{item.size_human}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = getDownloadUrl(item.filename);
                          link.download = item.filename;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
