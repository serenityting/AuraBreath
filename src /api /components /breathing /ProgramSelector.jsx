import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Trophy, Compass } from 'lucide-react';

const programs = [
  {
    id: 'beginner',
    name: 'Beginner',
    icon: Sparkles,
    duration: '5 min',
    description: 'Learn the basics of circular breathing',
    color: '#7CB5A0',
    cycles: 10,
    exhaleTime: 8,
    sniffTime: 2,
    holdTime: 2
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    icon: Zap,
    duration: '10 min',
    description: 'Build endurance and consistency',
    color: '#E8C07D',
    cycles: 20,
    exhaleTime: 10,
    sniffTime: 1.5,
    holdTime: 1.5
  },
  {
    id: 'advanced',
    name: 'Advanced',
    icon: Trophy,
    duration: '15 min',
    description: 'Master continuous circular breathing',
    color: '#D4A574',
    cycles: 30,
    exhaleTime: 12,
    sniffTime: 1,
    holdTime: 1
  },
  {
    id: 'free_practice',
    name: 'Free Practice',
    icon: Compass,
    duration: 'Unlimited',
    description: 'Practice at your own pace',
    color: '#A8D4E6',
    cycles: null,
    exhaleTime: 10,
    sniffTime: 1.5,
    holdTime: 1.5
  }
];

export default function ProgramSelector({ selectedProgram, onSelect }) {
  return (
    <div className="w-full max-w-2xl">
      <h3 className="text-sm font-medium text-stone-500 uppercase tracking-wide mb-4">
        Select Training Program
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {programs.map((program) => {
          const Icon = program.icon;
          const isSelected = selectedProgram?.id === program.id;

          return (
            <motion.button
              key={program.id}
              onClick={() => onSelect(program)}
              className={`relative p-4 rounded-2xl text-left transition-all ${
                isSelected 
                  ? 'bg-white shadow-lg ring-2' 
                  : 'bg-stone-50 hover:bg-white hover:shadow-md'
              }`}
              style={{ 
                ringColor: isSelected ? program.color : 'transparent'
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${program.color}20` }}
                >
                  <Icon className="w-5 h-5" style={{ color: program.color }} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-stone-800">{program.name}</h4>
                    <span className="text-xs font-medium text-stone-500">
                      {program.duration}
                    </span>
                  </div>
                  <p className="text-sm text-stone-500 mt-1">{program.description}</p>
                </div>
              </div>

              {isSelected && (
                <motion.div
                  className="absolute top-2 right-2 w-2 h-2 rounded-full"
                  style={{ backgroundColor: program.color }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export { programs };
