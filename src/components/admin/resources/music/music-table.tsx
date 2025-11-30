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

const styles = {
  emptyContainer: `flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-lg`.trim(),
  emptyIcon: `w-16 h-16 text-muted-foreground/50 mb-4`.trim(),
  emptyTitle: `text-lg font-medium text-muted-foreground`.trim(),
  emptyDescription: `text-sm text-muted-foreground/70 mt-1`.trim(),
  tableContainer: `border rounded-lg overflow-hidden`.trim(),
  tableHeaderRow: `hover:bg-transparent`.trim(),
  tableHeadNumber: `w-[60px]`.trim(),
  tableHeadRight: `text-right`.trim(),
  tableHeadActions: `w-[60px]`.trim(),
  tableRow: `cursor-pointer h-16`.trim(),
  tableRowActive: `bg-accent/50`.trim(),
  playButton: `h-8 w-8`.trim(),
  playButtonNumber: `text-sm text-muted-foreground`.trim(),
  titleContainer: `flex items-center gap-2`.trim(),
  waveformContainer: `flex items-center gap-0.5 h-3`.trim(),
  waveformBar: `w-0.5 bg-primary animate-pulse-bar`.trim(),
  waveformBarDelay75: `w-0.5 bg-primary animate-pulse-bar delay-75`.trim(),
  waveformBarDelay150: `w-0.5 bg-primary animate-pulse-bar delay-150`.trim(),
  titleText: `font-medium`.trim(),
  titleTextActive: `text-primary`.trim(),
  artistText: `text-muted-foreground`.trim(),
  durationBadge: `font-mono text-xs`.trim(),
  bitrateText: `text-right text-sm text-muted-foreground`.trim(),
  sizeText: `text-right text-sm text-muted-foreground`.trim(),
  deleteButton: `h-8 w-8`.trim(),
};

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
      <div className={styles.emptyContainer}>
        <Music2 className={styles.emptyIcon} />
        <p className={styles.emptyTitle}>还没有上传音乐</p>
        <p className={styles.emptyDescription}>
          点击右上角按钮上传音乐文件
        </p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.tableContainer}>
        <Table>
          <TableHeader>
            <TableRow className={styles.tableHeaderRow}>
              <TableHead className={styles.tableHeadNumber}>#</TableHead>
              <TableHead>标题</TableHead>
              <TableHead>艺术家</TableHead>
              <TableHead className={styles.tableHeadRight}>时长</TableHead>
              <TableHead className={styles.tableHeadRight}>比特率</TableHead>
              <TableHead className={styles.tableHeadRight}>大小</TableHead>
              <TableHead className={styles.tableHeadActions}></TableHead>
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
                    styles.tableRow,
                    isCurrent && styles.tableRowActive
                  )}
                  onClick={() => onMusicSelect(music)}
                >
                  {/* 播放按钮/序号 */}
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      className={styles.playButton}
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
                        <span className={styles.playButtonNumber}>
                          {index + 1}
                        </span>
                      )}
                    </Button>
                  </TableCell>

                  {/* 标题 */}
                  <TableCell>
                    <div className={styles.titleContainer}>
                      {isCurrentPlaying && (
                        <div className={styles.waveformContainer}>
                          <div className={styles.waveformBar} />
                          <div className={styles.waveformBarDelay75} />
                          <div className={styles.waveformBarDelay150} />
                        </div>
                      )}
                      <span
                        className={cn(
                          styles.titleText,
                          isCurrent && styles.titleTextActive
                        )}
                      >
                        {music.name}
                      </span>
                    </div>
                  </TableCell>

                  {/* 艺术家 */}
                  <TableCell>
                    <span className={styles.artistText}>
                      {music.artist || '-'}
                    </span>
                  </TableCell>

                  {/* 时长 */}
                  <TableCell className={styles.tableHeadRight}>
                    <Badge variant="secondary" className={styles.durationBadge}>
                      {formatTime(music.duration || 0)}
                    </Badge>
                  </TableCell>

                  {/* 比特率 */}
                  <TableCell className={styles.bitrateText}>
                    {formatBitrate(music.bitrate)}
                  </TableCell>

                  {/* 文件大小 */}
                  <TableCell className={styles.sizeText}>
                    {formatBytes(music.fileSize)}
                  </TableCell>

                  {/* 删除按钮 */}
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      className={styles.deleteButton}
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
