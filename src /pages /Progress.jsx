import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Wind, 
  Target, 
  TrendingUp,
  Award,
  Flame
} from 'lucide-react';
import { format, subDays, isAfter } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";

export default function Progress() {
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['training-sessions'],
    queryFn: () => base44.entities.TrainingSession.list('-created_date', 100)
  });

  // Calculate stats
  const totalSessions = sessions.length;
  const totalMinutes = Math.round(sessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) / 60);
  const totalCircularBreaths = sessions.reduce((acc, s) => acc + (s.circular_breaths_count || 0), 0);
  const avgPressure = sessions.length > 0 
    ? Math.round(sessions.reduce((acc, s) => acc + (s.avg_pressure_score || 0), 0) / sessions.length)
    : 0;
  const bestSustained = Math.max(...sessions.map(s => s.longest_sustained_seconds || 0), 0);

  // Calculate streak
  const getStreak = () => {
    let streak = 0;
    let currentDate = new Date();
    
    for (let i = 0; i < 365; i++) {
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      const hasSession = sessions.some(s => {
        const sessionDate = new Date(s.created_date);
        return sessionDate >= dayStart && sessionDate <= dayEnd;
      });
      
      if (hasSession) {
        streak++;
        currentDate = subDays(currentDate, 1);
      } else if (i === 0) {
        // Allow today to not have a session yet
        currentDate = subDays(currentDate, 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  const streak = getStreak();

  // Prepare chart data (last 14 days)
  const chartData = Array.from({ length: 14 }, (_, i) => {
    const date = subDays(new Date(), 13 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const daySessions = sessions.filter(s => 
      format(new Date(s.created_date), 'yyyy-MM-dd') === dateStr
    );
    
    return {
      date: format(date, 'MMM d'),
      sessions: daySessions.length,
      minutes: Math.round(daySessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) / 60),
      avgPressure: daySessions.length > 0 
        ? Math.round(daySessions.reduce((acc, s) => acc + (s.avg_pressure_score || 0), 0) / daySessions.length)
        : 0
    };
  });

  const stats = [
    { icon: Calendar, label: 'Total Sessions', value: totalSessions, color: 'amber' },
    { icon: Clock, label: 'Minutes Trained', value: totalMinutes, color: 'emerald' },
    { icon: Wind, label: 'Circular Breaths', value: totalCircularBreaths, color: 'blue' },
    { icon: Target, label: 'Avg Pressure', value: `${avgPressure}%`, color: 'purple' },
    { icon: TrendingUp, label: 'Best Sustained', value: `${bestSustained}s`, color: 'rose' },
    { icon: Flame, label: 'Day Streak', value: streak, color: 'orange' }
  ];

  const colorMap = {
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', icon: 'text-amber-500' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: 'text-emerald-500' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-500' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'text-purple-500' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', icon: 'text-rose-500' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', icon: 'text-orange-500' }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-light text-stone-800 mb-2">
            Your Progress
          </h1>
          <p className="text-stone-500">
            Track your circular breathing journey
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const colors = colorMap[stat.color];
            
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`${colors.bg} rounded-2xl p-5`}
              >
                <Icon className={`w-6 h-6 ${colors.icon} mb-3`} />
                <p className={`text-2xl md:text-3xl font-bold ${colors.text}`}>
                  {stat.value}
                </p>
                <p className="text-sm text-stone-500 mt-1">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl p-6 shadow-sm mb-8"
        >
          <h2 className="text-lg font-semibold text-stone-800 mb-4">
            Training Activity (Last 14 Days)
          </h2>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4A574" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D4A574" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12, fill: '#78716C' }}
                  axisLine={{ stroke: '#D4D4D4' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#78716C' }}
                  axisLine={{ stroke: '#D4D4D4' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFF',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="minutes" 
                  stroke="#D4A574" 
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorMinutes)"
                  name="Minutes"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-stone-800 mb-4">
            Recent Sessions
          </h2>
          
          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <Wind className="w-12 h-12 text-stone-300 mx-auto mb-4" />
              <p className="text-stone-500">No training sessions yet</p>
              <p className="text-sm text-stone-400 mt-1">Start your first session to see progress here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.slice(0, 10).map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-stone-50 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <Wind className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-stone-800 capitalize">
                        {session.program_type?.replace('_', ' ') || 'Training'}
                      </p>
                      <p className="text-sm text-stone-500">
                        {format(new Date(session.created_date), 'MMM d, yyyy · h:mm a')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <p className="font-semibold text-stone-800">
                        {Math.round((session.duration_seconds || 0) / 60)}m
                      </p>
                      <p className="text-stone-400">Duration</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-600">
                        {session.circular_breaths_count || 0}
                      </p>
                      <p className="text-stone-400">Breaths</p>
                    </div>
                    <div className="text-right hidden md:block">
                      <p className="font-semibold text-blue-600">
                        {session.avg_pressure_score || 0}%
                      </p>
                      <p className="text-stone-400">Pressure</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Achievement badges placeholder */}
        {totalSessions >= 5 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-6 text-white"
          >
            <div className="flex items-center gap-4">
              <Award className="w-10 h-10" />
              <div>
                <h3 className="font-semibold text-lg">Achievement Unlocked!</h3>
                <p className="text-amber-100">
                  Completed {totalSessions} training sessions. Keep going!
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
