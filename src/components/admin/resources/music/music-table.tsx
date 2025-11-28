"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/ui/table";
import { Button } from "@/components/shadcn/ui/button";
import { Badge } from "@/components/shadcn/ui/badge";
import { Play, Pause, Trash2, Music2 } from "lucide-react";
import type { AlbumMusicItem } from "@/server/types/resources-type";
import { DeleteMusicDialog } from "./dialogs/delete-music-dialog";
import { cn } from "@/lib/utils";

interface MusicTableProps {
  musics: AlbumMusicItem[];
  albumId: string;
  currentMusic: AlbumMusicItem | null;
  isPlaying: boolean;
  onMusicSelect: (music: AlbumMusicItem) => void;
  onPlayPause: () => void;
}

export function MusicTable({
  musics,
  albumId,
  currentMusic,
  isPlaying,
  onMusicSelect,
  onPlayPause,
}: MusicTableProps) {
  const [deleteMusic, setDeleteMusic] = useState<AlbumMusicItem | null>(null);

  const formatTime = (seconds: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatBitrate = (bitrate?: number) => {
    if (!bitrate) return '-';
    return `${Math.round(bitrate / 1000)} kbps`;
  };

  if (musics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-lg">
        <Music2 className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <p className="text-lg font-medium text-muted-foreground">还没有上传音乐</p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          点击右上角按钮上传音乐文件
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[60px]">#</TableHead>
              <TableHead>标题</TableHead>
              <TableHead>艺术家</TableHead>
              <TableHead className="text-right">时长</TableHead>
              <TableHead className="text-right">比特率</TableHead>
              <TableHead className="text-right">大小</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {musics.map((music, index) => {
              const isCurrent = currentMusic?.id === music.id;
              const isCurrentPlaying = isCurrent && isPlaying;

              return (
                <TableRow
                  key={music.id}
                  className={cn(
                    "cursor-pointer h-16",
                    isCurrent && "bg-accent/50"
                  )}
                  onClick={() => onMusicSelect(music)}
                >
                  {/* 播放按钮/序号 */}
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isCurrent) {
                          onPlayPause();
                        } else {
                          onMusicSelect(music);
                        }
                      }}
                    >
                      {isCurrentPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : isCurrent ? (
                        <Play className="h-4 w-4" />
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {index + 1}
                        </span>
                      )}
                    </Button>
                  </TableCell>

                  {/* 标题 */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {isCurrentPlaying && (
                        <div className="flex items-center gap-0.5 h-3">
                          <div className="w-0.5 bg-primary animate-pulse-bar" />
                          <div className="w-0.5 bg-primary animate-pulse-bar delay-75" />
                          <div className="w-0.5 bg-primary animate-pulse-bar delay-150" />
                        </div>
                      )}
                      <span
                        className={cn(
                          "font-medium",
                          isCurrent && "text-primary"
                        )}
                      >
                        {music.name}
                      </span>
                    </div>
                  </TableCell>

                  {/* 艺术家 */}
                  <TableCell>
                    <span className="text-muted-foreground">
                      {music.artist || '-'}
                    </span>
                  </TableCell>

                  {/* 时长 */}
                  <TableCell className="text-right">
                    <Badge variant="secondary" className="font-mono text-xs">
                      {formatTime(music.duration || 0)}
                    </Badge>
                  </TableCell>

                  {/* 比特率 */}
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {formatBitrate(music.bitrate)}
                  </TableCell>

                  {/* 文件大小 */}
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {formatBytes(music.fileSize)}
                  </TableCell>

                  {/* 删除按钮 */}
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteMusic(music);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* 删除对话框 */}
      {deleteMusic && (
        <DeleteMusicDialog
          albumId={albumId}
          music={deleteMusic}
          open={!!deleteMusic}
          onOpenChange={(open) => !open && setDeleteMusic(null)}
        />
      )}
    </>
  );
}
