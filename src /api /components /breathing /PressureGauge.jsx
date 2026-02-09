import React from 'react';
import { motion } from 'framer-motion';

export default function PressureGauge({ pressure, maxPressure = 100, isConnected }) {
  const normalizedPressure = Math.min((pressure / maxPressure) * 100, 100);
  const radius = 120;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedPressure / 100) * circumference * 0.75;
  
  // Color based on pressure level
  const getColor = () => {
    if (normalizedPressure < 30) return '#60a5fa'; // blue - too low
    if (normalizedPressure < 70) return '#34d399'; // green - optimal
    return '#f97316'; // orange - high
  };

  return (
    <div className="relative flex items-center justify-center">
      <svg width="280" height="280" className="transform -rotate-[135deg]">
        {/* Background arc */}
        <circle
          cx="140"
          cy="140"
          r={radius}
          fill="none"
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * 0.25}
          strokeLinecap="round"
        />
        {/* Pressure arc */}
        <motion.circle
          cx="140"
          cy="140"
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.1 }}
          style={{
            filter: `drop-shadow(0 0 10px ${getColor()})`
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          className="text-5xl font-bold text-white"
          animate={{ scale: isConnected ? [1, 1.05, 1] : 1 }}
          transition={{ duration: 0.3, repeat: isConnected ? Infinity : 0, repeatDelay: 0.5 }}
        >
          {Math.round(pressure)}
        </motion.div>
        <div className="text-slate-400 text-sm mt-1">PRESSURE</div>
        <div className={`mt-2 px-3 py-1 rounded-full text-xs font-medium ${
          isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {isConnected ? '● CONNECTED' : '○ DISCONNECTED'}
        </div>
      </div>
    </div>
  );
}
