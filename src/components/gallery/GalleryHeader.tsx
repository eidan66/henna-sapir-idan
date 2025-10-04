"use client";
import { motion } from "framer-motion";
import { Camera, Heart, Users, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface GalleryHeaderProps {
  mediaCount: number;
}

export default function GalleryHeader({ mediaCount }: GalleryHeaderProps) {
  const [showDownloadButton, setShowDownloadButton] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Wedding event: September 18, 2025 at 20:00 (Israel time)
    const hennaDate = new Date('2025-09-18T20:00:00+03:00');
    const downloadDate = new Date(hennaDate.getTime() + (25 * 60 * 60 * 1000)); // +25 hours
    
    const checkDownloadAvailability = () => {
      const now = new Date();
      
      if (now >= downloadDate) {
        setShowDownloadButton(true);
      }
    };

    checkDownloadAvailability();
    const interval = setInterval(checkDownloadAvailability, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const handleDownloadPage = () => {
    router.push('/download');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-12"
    >
      <div className="relative">
        {/* Decorative hearts */}
        <div className="absolute -top-4 right-1/4 text-gold-400 opacity-30 float-animation">
          <Heart className="w-8 h-8" />
        </div>
        <div className="absolute -top-2 left-1/3 text-emerald-400 opacity-30 float-animation" style={{ animationDelay: '1s' }}>
          <Heart className="w-6 h-6" />
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-emerald-700 via-gold-400 to-emerald-600 bg-clip-text text-transparent mb-4">
          זכרונות מהחינה שלנו
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto leading-relaxed">
          כל חיוך, כל דמעה, כל רגע קסום מהיום המיוחד שלנו, 
          נתפס ומשותף באהבה על ידי המשפחה והחברים היקרים שלנו.
        </p>
        
        {/* Download Info Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3">
            <Download className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div className="text-center">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                💡 <strong>טיפ:</strong> ניתן להוריד תמונות בודדות על ידי לחיצה עליהן
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                לחצו על כל תמונה או סרטון כדי לצפות ולהוריד אותה למכשיר שלכם
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-8 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-gold-100 to-emerald-100 dark:from-gold-900/20 dark:to-emerald-900/20 rounded-full flex items-center justify-center">
              <Camera className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="font-medium">{mediaCount} זכרונות שותפו</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-100 to-gold-100 dark:from-gold-900/20 dark:to-emerald-900/20 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-gold-400 dark:text-gold-400" />
            </div>
            <span className="font-medium">על ידי האהובים שלנו</span>
          </div>
        </div>

        {/* Hidden Download Button - Only visible after 25 hours */}
        {showDownloadButton && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8"
          >
            <motion.button
              onClick={handleDownloadPage}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-8 py-3 rounded-full font-semibold shadow-lg transition-all duration-300 flex items-center gap-3 mx-auto"
            >
              <Download className="w-5 h-5" />
              הורד את כל הזיכרונות שלנו
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}