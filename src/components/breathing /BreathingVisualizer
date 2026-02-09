import React from 'react';
import { motion } from 'framer-motion';

export default function BreathingVisualizer({ 
  pressureLevel = 0, 
  phase = 'idle', 
  isActive = false 
}) {
  // Normalize pressure to 0-1 range
  const normalizedPressure = Math.min(Math.max(pressureLevel / 100, 0), 1);
  
  // Calculate ring sizes based on pressure
  const innerRingScale = 0.3 + normalizedPressure * 0.4;
  const middleRingScale = 0.5 + normalizedPressure * 0.3;
  const outerRingScale = 0.7 + normalizedPressure * 0.2;

  const phaseColors = {
    idle: { primary: '#D4A574', secondary: '#C4956A' },
    inhale: { primary: '#7CB5A0', secondary: '#5A9A84' },
    hold: { primary: '#E8C07D', secondary: '#D4A85C' },
    exhale: { primary: '#D4A574', secondary: '#B8895A' },
    sniff: { primary: '#A8D4E6', secondary: '#8BC4D8' }
  };

  const colors = phaseColors[phase] || phaseColors.idle;

  return (
    <div className="relative w-72 h-72 md:w-96 md:h-96">
      {/* Outer glow */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${colors.primary}20 0%, transparent 70%)`,
        }}
        animate={{
          scale: isActive ? [1, 1.1, 1] : 1,
          opacity: isActive ? [0.5, 0.8, 0.5] : 0.3
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Outer ring */}
      <motion.div
        className="absolute inset-4 rounded-full border-4"
        style={{ borderColor: `${colors.secondary}40` }}
        animate={{
          scale: outerRingScale,
          borderColor: isActive ? colors.secondary : `${colors.secondary}40`
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />

      {/* Middle ring */}
      <motion.div
        className="absolute inset-12 rounded-full border-4"
        style={{ borderColor: `${colors.primary}60` }}
        animate={{
          scale: middleRingScale,
          borderColor: isActive ? colors.primary : `${colors.primary}60`
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />

      {/* Inner ring */}
      <motion.div
        className="absolute inset-20 rounded-full"
        style={{ backgroundColor: `${colors.primary}30` }}
        animate={{
          scale: innerRingScale,
          backgroundColor: isActive ? `${colors.primary}60` : `${colors.primary}30`
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />

      {/* Center core */}
      <motion.div
        className="absolute rounded-full"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '60px',
          height: '60px',
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
        }}
        animate={{
          scale: isActive ? [1, 1.2, 1] : 1,
          boxShadow: isActive 
            ? [`0 0 20px ${colors.primary}80`, `0 0 40px ${colors.primary}60`, `0 0 20px ${colors.primary}80`]
            : `0 0 10px ${colors.primary}40`
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Pressure indicator particles */}
      {isActive && Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            top: '50%',
            left: '50%',
            backgroundColor: colors.primary
          }}
          animate={{
            x: [0, Math.cos((i * Math.PI * 2) / 8) * (80 + normalizedPressure * 60)],
            y: [0, Math.sin((i * Math.PI * 2) / 8) * (80 + normalizedPressure * 60)],
            opacity: [0, normalizedPressure, 0],
            scale: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeOut"
          }}
        />
      ))}

      {/* Phase label */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          className="text-sm font-medium uppercase tracking-widest"
          style={{ color: colors.secondary }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {phase !== 'idle' ? phase : ''}
        </motion.span>
      </div>
    </div>
  );
}
