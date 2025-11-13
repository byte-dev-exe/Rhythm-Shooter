import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Trophy, Target, Clock, Skull } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GameOverScreen({ score, level, survivalTime, enemiesKilled, onRestart }) {
  const getRank = (score) => {
    if (score < 1000) return { rank: 'Rookie', color: 'text-gray-400', emoji: '🎯' };
    if (score < 3000) return { rank: 'Sharpshooter', color: 'text-blue-400', emoji: '🔫' };
    if (score < 5000) return { rank: 'Expert', color: 'text-purple-400', emoji: '💎' };
    if (score < 10000) return { rank: 'Master', color: 'text-pink-400', emoji: '⭐' };
    return { rank: 'Legend', color: 'text-yellow-400', emoji: '👑' };
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const rankInfo = getRank(score);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/90 backdrop-blur-md overflow-y-auto"
    >
      <div className="max-w-2xl mx-auto px-6 py-8 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="mb-8">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
              Game Over
            </h2>
            <p className="text-white/60 text-lg">The rhythm has ended...</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/40 to-cyan-900/40 backdrop-blur-md rounded-3xl p-8 border border-white/20 mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <h3 className="text-xl font-bold text-white">Level {level} Stats</h3>
            </div>

            <div className="flex items-center justify-center gap-3 mb-6">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <h3 className="text-3xl font-bold text-white">Final Score</h3>
            </div>
            
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="text-7xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-6"
            >
              {Math.floor(score)}
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white/5 rounded-xl p-4 border border-white/10"
              >
                <Clock className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                <div className="text-xs text-white/60 uppercase tracking-wider mb-1">Survival Time</div>
                <div className="text-2xl font-bold text-white">{formatTime(survivalTime)}</div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-white/5 rounded-xl p-4 border border-white/10"
              >
                <Skull className="w-6 h-6 text-red-400 mx-auto mb-2" />
                <div className="text-xs text-white/60 uppercase tracking-wider mb-1">Enemies Killed</div>
                <div className="text-2xl font-bold text-white">{enemiesKilled}</div>
              </motion.div>
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="inline-flex items-center gap-2 bg-white/10 rounded-full px-6 py-3 border border-white/20"
            >
              <span className="text-3xl">{rankInfo.emoji}</span>
              <div className="text-left">
                <div className="text-xs text-white/60 uppercase tracking-wider">Rank</div>
                <div className={`text-xl font-bold ${rankInfo.color}`}>{rankInfo.rank}</div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="space-y-4"
          >
            <Button
              onClick={onRestart}
              size="lg"
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white text-xl px-8 py-7 rounded-2xl shadow-2xl shadow-purple-500/50 border-2 border-white/20"
            >
              <RotateCcw className="w-6 h-6 mr-3" />
              Play Again
            </Button>

            <p className="text-white/40 text-sm">
              Keep the rhythm alive 🎵
            </p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
