import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PauseMenu({ onResume, onHome }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-md"
    >
      <div className="max-w-md mx-auto px-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="mb-8">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
              Paused
            </h2>
            <p className="text-white/60 text-lg">Take a breather</p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={onResume}
              size="lg"
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xl px-8 py-7 rounded-2xl shadow-2xl shadow-green-500/50 border-2 border-white/20"
            >
              <Play className="w-6 h-6 mr-3" />
              Resume Game
            </Button>

            <Button
              onClick={onHome}
              variant="outline"
              size="lg"
              className="w-full bg-white/5 hover:bg-white/10 text-white border-white/20 text-xl px-8 py-7 rounded-2xl"
            >
              <Home className="w-6 h-6 mr-3" />
              Main Menu
            </Button>
          </div>

          <p className="mt-8 text-white/40 text-sm">
            Press ESC to resume
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
