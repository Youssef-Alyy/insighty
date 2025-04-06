import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';

interface TooltipProps {
  content: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block self-start mt-2 ">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-pointer p-2  rounded-full hover:bg-primary/5 transition-colors"
      >
        <Info className="h-5 w-5 text-primary hover:text-primary/80 transition-colors" />
      </div>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="absolute z-50 w-80 p-4 text-sm bg-white/95 backdrop-blur-sm 
              rounded-xl shadow-xl border border-primary/10 top-0 right-6
              text-gray-600 leading-relaxed"
          >

            <div className="font-medium text-primary/90 mb-1">Insight</div>
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 