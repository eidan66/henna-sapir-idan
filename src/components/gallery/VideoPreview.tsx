"use client";
import { useState, useEffect, useRef } from "react";
import { Play } from "lucide-react";
import VideoPlaceholder from "./VideoPlaceholder";
import { isMobile } from "@/utils";
import { logger } from "@/lib/logger";
import { apiServices } from "@/services/api";

interface VideoPreviewProps {
  mp4Url: string;
  webmUrl?: string;
  posterUrl?: string;
  className?: string;
  onError?: () => void;
  onLoad?: () => void;
  fixedAspect?: boolean; // if true, wrap with aspect-video
  showControls?: boolean; // if true, show video controls
  autoPlay?: boolean; // if true, autoplay video
}

export default function VideoPreview({ 
  mp4Url, 
  webmUrl, 
  posterUrl, 
  className = "", 
  onError,
  onLoad,
  fixedAspect = true,
  showControls = false,
  autoPlay = false,
}: VideoPreviewProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [posterVisible, setPosterVisible] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const isIOS = typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);

  useEffect(() => {
    console.log('VideoPreview: Initializing video', {
      mp4Url,
      posterUrl,
      showControls,
      autoPlay,
      fixedAspect,
      isMobile: isMobile(),
      isIOS,
    });
    
    setHasError(false);
    setIsLoading(!isMobile());
    setShowFallback(false);
    setPosterVisible(true);
    setIsReady(false);
  }, [mp4Url, posterUrl, showControls, autoPlay, fixedAspect, isIOS]);

  // Failsafe: if events never fire, hide overlay after a short delay
  useEffect(() => {
    if (isReady) return;
    const t = setTimeout(() => {
      console.log('VideoPreview: Failsafe timeout - hiding overlay', { mp4Url, posterUrl });
      setIsReady(true);
      setPosterVisible(false);
    }, 5000); // Increased timeout to 5 seconds
    return () => clearTimeout(t);
  }, [isReady, mp4Url, posterUrl]);

  // Optional: log video element errors
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onErr = () => {
      const err = v.error;
      console.debug("video error", err?.code, err?.message, { readyState: v.readyState, networkState: v.networkState, src: v.currentSrc });
    };
    v.addEventListener("error", onErr);
    return () => v.removeEventListener("error", onErr);
  }, []);

  const handleVideoError = (e?: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e?.currentTarget || videoRef.current;
    const error = video?.error;
    
    console.error('VideoPreview: Video failed to load', { 
      mp4Url, 
      posterUrl,
      errorCode: error?.code,
      errorMessage: error?.message,
      networkState: video?.networkState,
      readyState: video?.readyState,
      currentSrc: video?.currentSrc,
      isMobile: isMobile(),
      isIOS,
    });
    
    const errorMessage = error?.message || 'Video load failed';
    const errorToLog = new Error(`Video error: ${errorMessage}`);
    
    logger.error('Video failed to load', errorToLog, {
      component: 'VideoPreview',
      mp4Url: mp4Url,
      hasPoster: !!posterUrl,
      errorCode: error?.code,
      errorMessage: error?.message,
      isMobile: isMobile(),
      isIOS,
    });
    
    setHasError(true);
    setIsLoading(false);
    setShowFallback(true); // Always show fallback on error
    setPosterVisible(false);
    setIsReady(true); // Mark as ready so overlay disappears
    onError?.();
  };

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    console.log('VideoPreview: Metadata loaded', {
      mp4Url,
      duration: video.duration,
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight,
      readyState: video.readyState,
      isMobile: isMobile(),
      isIOS,
    });
    
    setIsReady(true);
    setPosterVisible(false);
  };

  const handleCanPlay = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (isReady) return; // Prevent multiple calls
    
    setIsLoading(false);
    setIsReady(true);
    const v = e.currentTarget;
    if (v.readyState >= 2) {
      try { v.currentTime = 0.001; } catch {}
    }
    setPosterVisible(false);
    onLoad?.();
  };

  const containerClass = fixedAspect ? `relative aspect-video ${className}` : `relative w-full h-full ${className}`;
  const videoClass = fixedAspect 
    ? "w-full h-auto object-cover" 
    : "w-full h-full object-contain";

  return (
    <div className={containerClass} style={!fixedAspect ? { maxHeight: '100%', display: 'flex', alignItems: 'center' } : undefined}>
      {hasError && posterUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={apiServices.imageProxy.getProxiedImageUrl(posterUrl)}
          alt="Video poster"
          className={fixedAspect ? "absolute inset-0 w-full h-full object-cover" : "w-full h-full object-contain"}
        />
      )}

      {!showFallback && (
        <video
          ref={videoRef}
          playsInline
          {...({ 
            'webkit-playsinline': 'true',
            'x-webkit-airplay': 'allow',
          } as Record<string, string>)}
          muted={!showControls}
          loop={!showControls}
          autoPlay={autoPlay}
          preload={showControls ? "auto" : "metadata"}
          poster={posterUrl ? apiServices.imageProxy.getProxiedImageUrl(posterUrl) : undefined}
          disableRemotePlayback={false}
          controls={showControls}
          controlsList="nodownload"
          className={videoClass}
          style={!fixedAspect ? { maxHeight: '100%', maxWidth: '100%' } : undefined}
          onLoadStart={() => {
            console.log('VideoPreview: Load started', { mp4Url });
            setIsLoading(true);
          }}
          onLoadedMetadata={handleLoadedMetadata}
          onCanPlay={handleCanPlay}
          onError={handleVideoError}
        >
          {!isIOS && webmUrl && <source src={apiServices.imageProxy.getProxiedImageUrl(webmUrl)} type="video/webm" />}
          <source src={apiServices.imageProxy.getProxiedImageUrl(mp4Url)} type="video/mp4" />
        </video>
      )}

      {isLoading && !showFallback && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {showFallback && (
        <VideoPlaceholder className="w-full h-full" />
      )}

      {(!showFallback && !hasError && (posterVisible || (!isReady && !isLoading))) && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
            <Play className="w-8 h-8 text-emerald-600 ml-1" />
          </div>
        </div>
      )}
    </div>
  );
}
