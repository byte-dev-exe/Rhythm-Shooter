import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Target, Music, Zap, Award, Flame, Skull } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StartScreen({ onStart }) {
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [selectedDifficulty, setSelectedDifficulty] = useState('normal');

  const levels = [
    { number: 1, name: 'Neon Depths', description: 'Enter the rhythm arena' },
    { number: 2, name: 'Bass Canyon', description: 'Feel the bass drop' },
    { number: 3, name: 'Synth Storm', description: 'Dance with danger' },
    { number: 4, name: 'Beat Blitz', description: 'Ultimate challenge' },
    { number: 5, name: 'Rhythm Infinity', description: 'Endless mayhem' },
  ];

  const difficulties = [
    { 
      id: 'easy', 
      name: 'Easy', 
      icon: Target, 
      color: 'from-green-500 to-emerald-500',
      borderColor: 'border-green-400',
      description: 'Chill vibes, slower enemies'
    },
    { 
      id: 'normal', 
      name: 'Normal', 
      icon: Flame, 
      color: 'from-yellow-500 to-orange-500',
      borderColor: 'border-yellow-400',
      description: 'Balanced rhythm action'
    },
    { 
      id: 'hard', 
      name: 'Hard', 
      icon: Skull, 
      color: 'from-red-500 to-pink-500',
      borderColor: 'border-red-400',
      description: 'Intense chaos, fast enemies'
    },
  ];

  const handleStart = () => {
    onStart(selectedLevel, selectedDifficulty);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-20 flex items-center justify-center bg-gradient-to-br from-purple-900/90 via-black/90 to-cyan-900/90 backdrop-blur-sm overflow-y-auto"
    >
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="mb-8">
            <h1 className="text-7xl font-bold mb-4 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
              RHYTHM FPS
            </h1>
            <p className="text-2xl text-white/80 mb-2">Music • Mayhem • Motion</p>
            <p className="text-white/60">Shoot to the beat. Feel the rhythm.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
            >
              <Target className="w-8 h-8 text-pink-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Precision</h3>
              <p className="text-white/60 text-sm">Tap targets as they pulse to the beat</p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
            >
              <Music className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Rhythm</h3>
              <p className="text-white/60 text-sm">Enemies spawn in sync with music</p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
            >
              <Zap className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Power-Ups</h3>
              <p className="text-white/60 text-sm">Collect boosts for special abilities</p>
            </motion.div>
          </div>

          {/* Difficulty Selection */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center justify-center gap-2">
              <Flame className="w-6 h-6" />
              Select Difficulty
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {difficulties.map((diff, index) => {
                const Icon = diff.icon;
                return (
                  <motion.button
                    key={diff.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    onClick={() => setSelectedDifficulty(diff.id)}
                    className={`relative bg-white/5 backdrop-blur-md rounded-2xl p-6 border-2 transition-all ${
                      selectedDifficulty === diff.id
                        ? `${diff.borderColor} bg-white/10 scale-105`
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    {selectedDifficulty === diff.id && (
                      <motion.div
                        layoutId="difficulty-selector"
                        className={`absolute inset-0 bg-gradient-to-r ${diff.color} opacity-20 rounded-2xl`}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                    <Icon className={`w-10 h-10 mx-auto mb-3 bg-gradient-to-r ${diff.color} bg-clip-text text-transparent`} style={{ WebkitTextFillColor: 'transparent', WebkitBackgroundClip: 'text' }} />
                    <h3 className="text-white font-bold text-lg mb-2">{diff.name}</h3>
                    <p className="text-white/60 text-sm">{diff.description}</p>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Level Selection */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mb-10"
          >
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center justify-center gap-2">
              <Award className="w-6 h-6" />
              Choose Your Level
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {levels.map((level, index) => (
                <motion.button
                  key={level.number}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.9 + index * 0.05 }}
                  onClick={() => setSelectedLevel(level.number)}
                  className={`relative bg-white/5 backdrop-blur-md rounded-xl p-4 border-2 transition-all ${
                    selectedLevel === level.number
                      ? 'border-purple-400 bg-white/10 scale-105'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  {selectedLevel === level.number && (
                    <motion.div
                      layoutId="level-selector"
                      className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-20 rounded-xl"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <div className="text-3xl font-bold text-white mb-1">{level.number}</div>
                  <div className="text-xs font-semibold text-white/80">{level.name}</div>
                  <div className="text-xs text-white/50 mt-1">{level.description}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <Button
              onClick={handleStart}
              size="lg"
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white text-xl px-12 py-7 rounded-2xl shadow-2xl shadow-purple-500/50 border-2 border-white/20"
            >
              <Play className="w-6 h-6 mr-3" />
              Start Game
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="mt-8 text-white/40 text-sm"
          >
            Best played with headphones 🎧
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
}
