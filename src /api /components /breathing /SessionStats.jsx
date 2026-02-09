import React from 'react';
import { Clock, Wind, Target, TrendingUp } from 'lucide-react';

export default function SessionStats({ 
  duration = 0, 
  circularBreaths = 0, 
  avgPressure = 0,
  longestSustained = 0 
}) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const stats = [
    { 
      icon: Clock, 
      label: 'Duration', 
      value: formatTime(duration),
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    },
    { 
      icon: Wind, 
      label: 'Circular Breaths', 
      value: circularBreaths,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    { 
      icon: Target, 
      label: 'Avg Pressure', 
      value: `${Math.round(avgPressure)}%`,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    { 
      icon: TrendingUp, 
      label: 'Longest Sustained', 
      value: `${longestSustained}s`,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-2xl">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div 
            key={stat.label}
            className={`${stat.bg} rounded-2xl p-4 text-center`}
          >
            <Icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} />
            <p className="text-lg font-bold text-stone-800">{stat.value}</p>
            <p className="text-xs text-stone-500">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
}
