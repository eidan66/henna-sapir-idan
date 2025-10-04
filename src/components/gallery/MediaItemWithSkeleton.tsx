"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { User, Download } from 'lucide-react';
import type { WeddingMediaItem } from '@/Entities/WeddingMedia';
import VideoPreview from './VideoPreview';
import { logger } from '@/lib/logger';
import { downloadMedia } from '@/utils';

interface MediaItemWithSkeletonProps {
  item: WeddingMediaItem;
  index: number;
  onMediaClick: (item: WeddingMediaItem) => void;
}

export default function MediaItemWithSkeleton({ item, index, onMediaClick }: MediaItemWithSkeletonProps) {
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the media viewer
    if (isDownloading) return;
    
    logger.userAction('Download button clicked in MediaItemWithSkeleton', {
      mediaId: item.id,
      mediaType: item.media_type,
      mediaUrl: item.media_url,
      title: item.title,
      uploaderName: item.uploader_name,
      itemIndex: index,
      shouldLoad,
      mediaLoaded,
    });
    
    setIsDownloading(true);
    try {
      await downloadMedia(
        item.media_url,
        item.media_type,
        item.title,
        item.id
      );
      
      logger.userAction('Download completed successfully in MediaItemWithSkeleton', {
        mediaId: item.id,
        mediaType: item.media_type,
        title: item.title,
        downloadLocation: 'MediaItemWithSkeleton',
        itemIndex: index,
      });
    } catch (error) {
      logger.error('Download failed in MediaItemWithSkeleton', error instanceof Error ? error : new Error(String(error)), {
        mediaId: item.id,
        mediaType: item.media_type,
        mediaUrl: item.media_url,
        title: item.title,
        itemIndex: index,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      // Error already logged above with logger.error
    } finally {
      setIsDownloading(false);
    }
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    // Default to loading first 6 items, then adjust based on screen size
    let immediateLoadCount = 6;
    
    // Check if mobile or desktop (only on client side)
    const isMobile = window.innerWidth < 768;
    immediateLoadCount = isMobile ? 6 : 12;
    
    // Load first items immediately for better UX
    if (index < immediateLoadCount) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Load immediately without delay
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Reduced from 100px to minimize unnecessary requests
        threshold: 0.1
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [index]);

  // Show skeleton until media is fully loaded
  useEffect(() => {
    if (!shouldLoad) return;
    
    // No delay - show content immediately
    setShowSkeleton(false);
  }, [shouldLoad]);

  // Track when media is actually loaded
  const handleMediaLoad = () => {
    setMediaLoaded(true);
    
    logger.debug('Media item loaded', {
      component: 'MediaItemWithSkeleton',
      mediaId: item.id,
      mediaType: item.media_type,
      index: index,
      url: item.media_url,
    });
    
    // Remove preloading to reduce unnecessary requests
    // Preloading was causing spam of Amazon S3 calls
  };

  const handleMediaError = () => {
    setMediaLoaded(true); // Still hide skeleton on error
  };

  return (
    <motion.div
      ref={elementRef}
      key={`${item.id}-${index}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group cursor-pointer"
      onClick={() => onMediaClick(item)}
    >
      <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 glass-effect border border-gold-200 group-hover:border-emerald-300">
        {/* Media Content */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {showSkeleton && !mediaLoaded ? (
              // Enhanced Skeleton
              <motion.div
                key="skeleton"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full relative overflow-hidden rounded-2xl"
                style={{ height: `${200 + (index % 3) * 50}px` }}
              >
                {/* Main skeleton background */}
                <div className="absolute inset-0 bg-gradient-to-br from-gold-100 to-cream-100 animate-pulse" />
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" 
                     style={{ 
                       animation: 'shimmer 2s infinite',
                       background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'
                     }} />
                
                {/* Loading indicator */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-lg">
                    <div className="w-6 h-6 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                </div>
                
                {/* Media type indicator */}
                <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 bg-white/60 rounded-full flex items-center justify-center">
                    {item.media_type === 'photo' ? (
                      <div className="w-3 h-3 bg-gold-400 rounded-sm" />
                    ) : (
                      <div className="w-3 h-3 bg-emerald-400 rounded-sm" />
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              // Actual Media
              <motion.div
                key="media"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {item.media_type === 'photo' ? (
                  shouldLoad ? (
                    <Image
                      src={item.media_url}
                      alt={item.title || "Wedding memory"}
                      width={500}
                      height={500}
                      className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-700"
                      loading={index < 4 ? "eager" : "lazy"}
                      priority={index < 2}
                      decoding="async"
                      onLoad={handleMediaLoad}
                      onError={handleMediaError}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-gold-100 to-cream-100 animate-pulse" />
                  )
                ) : (
                  shouldLoad ? (
                    <VideoPreview
                      mp4Url={item.media_url}
                      posterUrl={item.thumbnail_url || ""}
                      className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-700"
                      onLoad={handleMediaLoad}
                      onError={() => {
                        console.debug('Video failed to load in MediaGrid for item:', item.id);
                        handleMediaError();
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-gold-100 to-cream-100 animate-pulse flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="absolute top-3 right-3 w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white border border-white/30 opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:opacity-50"
          >
            <Download className={`w-4 h-4 ${isDownloading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          {item.title && (
            <p className="font-medium mb-2 text-sm leading-relaxed">
              {item.title}
            </p>
          )}
          {item.uploader_name && (
            <div className="flex items-center gap-2 text-xs opacity-90">
              <User className="w-3 h-3" />
              <span>על ידי {item.uploader_name}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
