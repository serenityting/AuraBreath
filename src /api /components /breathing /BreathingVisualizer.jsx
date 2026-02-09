import React from 'react';
import { motion } from 'framer-motion';

export default function BreathingVisualizer({ pressure, isActive }) {
  const rings = [1, 2, 3, 4, 5];
  const normalizedPressure = Math.min(pressure / 100, 1);
  
  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      {rings.map((ring, index) => (
        <motion.div
          key={ring}
          className="absolute rounded-full border-2 border-cyan-400/30"
          style={{
            width: `${40 + index * 40}px`,
            height: `${40 + index * 40}px`,
          }}
          animate={{
            scale: isActive ? [1, 1 + normalizedPressure * 0.3, 1] : 1,
            opacity: isActive ? [0.3, 0.6, 0.3] : 0.2,
            borderColor: isActive 
              ? [`rgba(34, 211, 238, ${0.2 + normalizedPressure * 0.3})`, `rgba(34, 211, 238, ${0.5 + normalizedPressure * 0.3})`, `rgba(34, 211, 238, ${0.2 + normalizedPressure * 0.3})`]
              : 'rgba(34, 211, 238, 0.2)'
          }}
          transition={{
            duration: 2 - normalizedPressure,
            repeat: Infinity,
            delay: index * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
      
      {/* Center breathing indicator */}
      <motion.div
        className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500"
        animate={{
          scale: isActive ? [1, 1 + normalizedPressure * 0.5, 1] : 1,
          boxShadow: isActive 
            ? ['0 0 20px rgba(34, 211, 238, 0.3)', '0 0 40px rgba(34, 211, 238, 0.6)', '0 0 20px rgba(34, 211, 238, 0.3)']
            : '0 0 10px rgba(34, 211, 238, 0.2)'
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}
