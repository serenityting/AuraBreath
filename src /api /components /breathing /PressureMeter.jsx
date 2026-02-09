import React from 'react';
import { motion } from 'framer-motion';

export default function PressureMeter({ level = 0, targetMin = 30, targetMax = 70 }) {
  const normalizedLevel = Math.min(Math.max(level, 0), 100);
  const isInRange = normalizedLevel >= targetMin && normalizedLevel <= targetMax;

  return (
    <div className="w-full max-w-xs">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-medium text-stone-500 uppercase tracking-wide">
          Breath Pressure
        </span>
        <span className={`text-sm font-semibold ${isInRange ? 'text-emerald-600' : 'text-amber-600'}`}>
          {Math.round(normalizedLevel)}%
        </span>
      </div>
      
      <div className="relative h-3 bg-stone-200 rounded-full overflow-hidden">
        {/* Target zone indicator */}
        <div 
          className="absolute h-full bg-emerald-100 rounded-full"
          style={{
            left: `${targetMin}%`,
            width: `${targetMax - targetMin}%`
          }}
        />
        
        {/* Pressure bar */}
        <motion.div
          className="h-full rounded-full"
          style={{
            background: isInRange 
              ? 'linear-gradient(90deg, #059669, #10B981)'
              : 'linear-gradient(90deg, #D97706, #F59E0B)'
          }}
          animate={{ width: `${normalizedLevel}%` }}
          transition={{ duration: 0.1, ease: "easeOut" }}
        />
        
        {/* Target zone markers */}
        <div 
          className="absolute top-0 h-full w-0.5 bg-emerald-500"
          style={{ left: `${targetMin}%` }}
        />
        <div 
          className="absolute top-0 h-full w-0.5 bg-emerald-500"
          style={{ left: `${targetMax}%` }}
        />
      </div>
      
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-stone-400">Soft</span>
        <span className="text-[10px] text-emerald-600">Target Zone</span>
        <span className="text-[10px] text-stone-400">Strong</span>
      </div>
    </div>
  );
}
