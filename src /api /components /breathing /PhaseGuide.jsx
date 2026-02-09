import React from 'react';
import { motion } from 'framer-motion';
import { Wind, Pause, RotateCcw } from 'lucide-react';

const phases = [
  { id: 'exhale', label: 'Exhale', icon: Wind, color: '#D4A574', description: 'Steady breath out through the didgeridoo' },
  { id: 'sniff', label: 'Sniff', icon: RotateCcw, color: '#A8D4E6', description: 'Quick nose inhale while cheeks push air' },
  { id: 'hold', label: 'Hold', icon: Pause, color: '#E8C07D', description: 'Brief pause to reset' },
];

export default function PhaseGuide({ currentPhase = 'idle', progress = 0 }) {
  return (
    <div className="w-full max-w-md">
      <div className="flex items-center justify-between gap-2">
        {phases.map((phase, index) => {
          const isActive = currentPhase === phase.id;
          const isPast = phases.findIndex(p => p.id === currentPhase) > index;
          const Icon = phase.icon;

          return (
            <React.Fragment key={phase.id}>
              <motion.div
                className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                  isActive ? 'bg-white shadow-lg' : ''
                }`}
                animate={{
                  scale: isActive ? 1.05 : 1,
                  opacity: isActive ? 1 : isPast ? 0.5 : 0.7
                }}
              >
                <motion.div
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-1"
                  style={{ 
                    backgroundColor: isActive ? `${phase.color}30` : 'transparent',
                    border: `2px solid ${isActive ? phase.color : '#D4D4D4'}`
                  }}
                  animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Icon 
                    className="w-5 h-5" 
                    style={{ color: isActive ? phase.color : '#A8A8A8' }}
                  />
                </motion.div>
                <span className={`text-xs font-medium ${isActive ? 'text-stone-800' : 'text-stone-400'}`}>
                  {phase.label}
                </span>
              </motion.div>

              {index < phases.length - 1 && (
                <div className="flex-1 h-0.5 bg-stone-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-amber-500"
                    initial={{ width: '0%' }}
                    animate={{ 
                      width: isPast || (isActive && progress > 50) ? '100%' : isActive ? `${progress * 2}%` : '0%'
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Current phase description */}
      <motion.div
        className="mt-4 text-center"
        key={currentPhase}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-sm text-stone-600">
          {phases.find(p => p.id === currentPhase)?.description || 'Prepare to begin circular breathing'}
        </p>
      </motion.div>
    </div>
  );
}
