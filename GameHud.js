import React from 'react';
import { Target, Heart, Zap, Trophy, Shield, Wind, Timer, Pause, Home, Volume2, VolumeX, Skull, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function GameHUD({ 
  score, 
  health, 
  combo, 
  level, 
  activePowerUps, 
  currentRound, 
  roundPhase,
  survivalTime,
  onPause,
  onHome,
  muted,
  onToggleMute
}) {
  const getPowerUpIcon = (type) => {
    switch (type) {
      case 'shield': return Shield;
      case 'speed': return Wind;
      case 'rapidfire': return Timer;
      default: return Zap;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute top-0 left-0 w-full p-4 md:p-6 z-10 pointer-events-none">
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-3">
          {/* Level and Round */}
          <div className="flex gap-3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-r from-yellow-600/80 to-orange-600/80 backdrop-blur-md rounded-xl px-4 py-2 border border-white/20"
            >
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-white" />
                <div>
                  <div className="text-xs text-white/70 uppercase tracking-wider">Level</div>
                  <div className="text-xl font-bold text-white">{level}</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 }}
              className={`backdrop-blur-md rounded-xl px-4 py-2 border-2 ${
                roundPhase === 'boss' 
                  ? 'bg-gradient-to-r from-red-600/80 to-pink-600/80 border-red-400/50 animate-pulse' 
                  : 'bg-gradient-to-r from-blue-600/80 to-cyan-600/80 border-blue-400/50'
              }`}
            >
              <div className="flex items-center gap-2">
                {roundPhase === 'boss' ? (
                  <Skull className="w-4 h-4 text-white" />
                ) : (
                  <Target className="w-4 h-4 text-white" />
                )}
                <div>
                  <div className="text-xs text-white/70 uppercase tracking-wider">
                    {roundPhase === 'boss' ? 'BOSS FIGHT' : 'Round'}
                  </div>
                  <div className="text-xl font-bold text-white">{currentRound}</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Timer */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-black/50 backdrop-blur-md rounded-xl px-4 py-2 border border-white/20"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="text-xs text-white/70 uppercase tracking-wider">Time</div>
                <div className="text-xl font-bold text-white">{formatTime(survivalTime)}</div>
              </div>
            </div>
          </motion.div>

          {/* Score */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gradient-to-r from-purple-600/80 to-pink-600/80 backdrop-blur-md rounded-xl px-4 py-2 border border-white/20"
          >
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-white" />
              <div>
                <div className="text-xs text-white/70 uppercase tracking-wider">Score</div>
                <div className="text-xl font-bold text-white">{Math.floor(score)}</div>
              </div>
            </div>
          </motion.div>

          {/* Health Bar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-black/50 backdrop-blur-md rounded-xl px-4 py-2 border border-white/20 min-w-[180px]"
          >
            <div className="flex items-center gap-3">
              <Heart className="w-4 h-4 text-red-400" />
              <div className="flex-1">
                <div className="text-xs text-white/70 uppercase tracking-wider mb-1">Health</div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-red-500 to-pink-500"
                    initial={{ width: '100%' }}
                    animate={{ width: `${health}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Combo */}
          {combo > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-gradient-to-r from-cyan-600/80 to-blue-600/80 backdrop-blur-md rounded-xl px-4 py-2 border border-white/20"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-300" />
                <div>
                  <div className="text-xs text-white/70 uppercase tracking-wider">Combo</div>
                  <div className="text-xl font-bold text-white">x{combo}</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right side - Controls and Power-ups */}
        <div className="space-y-3">
          {/* Control Buttons */}
          <div className="flex gap-2 pointer-events-auto">
            <Button
              variant="ghost"
              size="icon"
              className="bg-black/50 hover:bg-black/70 text-white border border-white/20"
              onClick={onToggleMute}
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="bg-black/50 hover:bg-black/70 text-white border border-white/20"
              onClick={onHome}
            >
              <Home className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="bg-black/50 hover:bg-black/70 text-white border border-white/20"
              onClick={onPause}
            >
              <Pause className="w-4 h-4" />
            </Button>
          </div>

          {/* Active Power-ups */}
          <AnimatePresence>
            {activePowerUps.map((powerUp, index) => {
              const Icon = getPowerUpIcon(powerUp.type);
              const colors = {
                shield: 'from-blue-600/80 to-cyan-600/80 border-blue-400/50',
                speed: 'from-cyan-600/80 to-teal-600/80 border-cyan-400/50',
                rapidfire: 'from-yellow-600/80 to-orange-600/80 border-yellow-400/50',
              };

              return (
                <motion.div
                  key={powerUp.type}
                  initial={{ opacity: 0, x: 20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.8 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-gradient-to-r ${colors[powerUp.type]} backdrop-blur-md rounded-xl px-3 py-2 border-2`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-white" />
                    <span className="text-sm font-semibold text-white">{powerUp.name}</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Crosshair */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="relative w-8 h-8">
          <div className="absolute top-1/2 left-0 w-2 h-0.5 bg-cyan-400 -translate-y-1/2" />
          <div className="absolute top-1/2 right-0 w-2 h-0.5 bg-cyan-400 -translate-y-1/2" />
          <div className="absolute left-1/2 top-0 w-0.5 h-2 bg-cyan-400 -translate-x-1/2" />
          <div className="absolute left-1/2 bottom-0 w-0.5 h-2 bg-cyan-400 -translate-x-1/2" />
          <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-cyan-400 rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
    </div>
  );
}
