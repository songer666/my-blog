"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";
import { getSignedUrlAction } from "@/server/actions/resources/r2-action";
import type { CollectionVideoItem } from "@/server/types/resources-type";

const styles = {
    container: `w-full h-full rounded-lg overflow-hidden bg-card`.trim(),
    playerWrapper: `relative w-full aspect-video bg-black rounded-lg overflow-hidden group`.trim(),
    video: `w-full h-full object-contain`.trim(),
    loading: `absolute inset-0 flex items-center justify-center bg-black/80 z-50`.trim(),
    error: `absolute inset-0 flex items-center justify-center bg-black text-white p-4 text-center`.trim(),
    placeholder: `w-full aspect-video bg-muted flex items-center justify-center text-muted-foreground rounded-lg`.trim(),
    controls: `absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200`.trim(),
    progressBar: `w-full h-1 bg-white/30 rounded-full mb-3 cursor-pointer hover:h-1.5 transition-all`.trim(),
    progressFilled: `h-full bg-primary rounded-full transition-all`.trim(),
    controlsRow: `flex items-center gap-3 text-white`.trim(),
    button: `hover:bg-white/20 rounded p-1.5 transition-colors cursor-pointer`.trim(),
    timeText: `text-sm font-mono min-w-[100px]`.trim(),
    volumeSlider: `w-24 h-1 bg-white/30 rounded-full cursor-pointer`.trim(),
    volumeFilled: `h-full bg-white rounded-full`.trim(),
    info: `p-4 bg-card border-t`.trim(),
    title: `font-semibold text-lg`.trim(),
    metadata: `flex gap-3 mt-2 text-sm text-muted-foreground`.trim(),
};

interface VideoPlayerProps {
    video: CollectionVideoItem | null;
}

export function VideoPlayer({ video }: VideoPlayerProps) {
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!video) {
            setVideoUrl(null);
            setError(null);
            return;
        }

        let cancelled = false;

        const loadVideo = async () => {
            setLoading(true);
            setError(null);
            setVideoUrl(null);
            setIsPlaying(false);
            setCurrentTime(0);
            
            try {
                const result = await getSignedUrlAction(video.r2Key);
                if (!cancelled) {
                    if (result.success && result.signedUrl) {
                        setVideoUrl(result.signedUrl);
                    } else {
                        setError(result.error || '加载视频失败');
                    }
                }
            } catch (err: any) {
                if (!cancelled) {
                    setError(err.message || '加载视频失败');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadVideo();

        return () => {
            cancelled = true;
            if (videoRef.current) {
                videoRef.current.pause();
            }
        };
    }, [video?.id]);

    // 视频事件处理
    useEffect(() => {
        const videoElement = videoRef.current;
        if (!videoElement) return;

        const handleTimeUpdate = () => setCurrentTime(videoElement.currentTime);
        const handleLoadedMetadata = () => setDuration(videoElement.duration);
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };

        videoElement.addEventListener('timeupdate', handleTimeUpdate);
        videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
        videoElement.addEventListener('play', handlePlay);
        videoElement.addEventListener('pause', handlePause);
        videoElement.addEventListener('ended', handleEnded);

        return () => {
            videoElement.removeEventListener('timeupdate', handleTimeUpdate);
            videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
            videoElement.removeEventListener('play', handlePlay);
            videoElement.removeEventListener('pause', handlePause);
            videoElement.removeEventListener('ended', handleEnded);
        };
    }, [videoUrl]);

    // 全屏监听
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
        }
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!videoRef.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        videoRef.current.currentTime = pos * duration;
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!videoRef.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        videoRef.current.volume = pos;
        setVolume(pos);
        if (pos > 0 && isMuted) {
            setIsMuted(false);
            videoRef.current.muted = false;
        }
    };

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (isFullscreen) {
            document.exitFullscreen();
        } else {
            containerRef.current.requestFullscreen();
        }
    };

    const formatTime = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!video) {
        return (
            <div className={styles.container}>
                <div className={styles.placeholder}>
                    <p>选择一个视频开始播放</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div ref={containerRef} className={styles.playerWrapper}>
                {loading && (
                    <div className={styles.loading}>
                        <Loader2 className="h-12 w-12 animate-spin text-white" />
                    </div>
                )}

                {error && (
                    <div className={styles.error}>
                        <p>{error}</p>
                    </div>
                )}

                {videoUrl && !error && (
                    <>
                        <video
                            ref={videoRef}
                            src={videoUrl}
                            className={styles.video}
                            onClick={togglePlay}
                        />

                        {/* 自定义控制栏 */}
                        <div className={styles.controls}>
                            {/* 进度条 */}
                            <div className={styles.progressBar} onClick={handleProgressClick}>
                                <div
                                    className={styles.progressFilled}
                                    style={{ width: `${(currentTime / duration) * 100}%` }}
                                />
                            </div>

                            {/* 控制按钮行 */}
                            <div className={styles.controlsRow}>
                                <div className={styles.button} onClick={togglePlay}>
                                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                                </div>

                                <span className={styles.timeText}>
                                    {formatTime(currentTime)} / {formatTime(duration)}
                                </span>

                                <div className="flex items-center gap-2">
                                    <div className={styles.button} onClick={toggleMute}>
                                        {isMuted || volume === 0 ? (
                                            <VolumeX className="h-5 w-5" />
                                        ) : (
                                            <Volume2 className="h-5 w-5" />
                                        )}
                                    </div>
                                    <div className={styles.volumeSlider} onClick={handleVolumeChange}>
                                        <div
                                            className={styles.volumeFilled}
                                            style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                <div className={styles.button + " ml-auto"} onClick={toggleFullscreen}>
                                    {isFullscreen ? (
                                        <Minimize className="h-5 w-5" />
                                    ) : (
                                        <Maximize className="h-5 w-5" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* 视频信息 */}
            {video && (
                <div className={styles.info}>
                    <h3 className={styles.title}>{video.name}</h3>
                    <div className={styles.metadata}>
                        {video.width && video.height && (
                            <span>{video.width}x{video.height}</span>
                        )}
                        {video.duration && (
                            <span>时长: {formatTime(video.duration)}</span>
                        )}
                        {video.mimeType && (
                            <span>{video.mimeType}</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
