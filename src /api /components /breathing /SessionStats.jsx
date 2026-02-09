import React from 'react';
import { Clock, Wind, TrendingUp, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function SessionStats({ duration, avgPressure, circularBreaths, consistencyScore }) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const stats = [
    { icon: Clock, label: 'Duration', value: formatTime(duration), color: 'text-blue-400' },
    { icon: Wind, label: 'Avg Pressure', value: avgPressure.toFixed(1), color: 'text-cyan-400' },
    { icon: TrendingUp, label: 'Circular Breaths', value: circularBreaths, color: 'text-green-400' },
    { icon: Target, label: 'Consistency', value: `${consistencyScore}%`, color: 'text-purple-400' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map(({ icon: Icon, label, value, color }) => (
        <Card key={label} className="bg-slate-800/50 border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon className={`w-4 h-4 ${color}`} />
            <span className="text-slate-400 text-xs">{label}</span>
          </div>
          <div className={`text-2xl font-bold ${color}`}>{value}</div>
        </Card>
      ))}
    </div>
  );
}
