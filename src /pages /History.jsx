import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Wind, TrendingUp, Target, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function History() {
  const { data: sessions = [], isLoading, refetch } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => base44.entities.BreathingSession.list('-created_date', 50),
  });

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleDelete = async (id) => {
    await base44.entities.BreathingSession.delete(id);
    toast.success('Session deleted');
    refetch();
  };

  const totalSessions = sessions.length;
  const totalMinutes = Math.round(sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / 60);
  const avgConsistency = sessions.length > 0 
    ? Math.round(sessions.reduce((sum, s) => sum + (s.consistency_score || 0), 0) / sessions.length)
    : 0;
  const totalCircularBreaths = sessions.reduce((sum, s) => sum + (s.circular_breaths_count || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl('Home')}>
            <Button variant="outline" size="icon" className="border-slate-600 text-slate-300 hover:bg-slate-700">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Training History</h1>
            <p className="text-slate-400">Track your progress over time</p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <div className="text-slate-400 text-sm">Total Sessions</div>
            <div className="text-2xl font-bold text-cyan-400">{totalSessions}</div>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <div className="text-slate-400 text-sm">Total Practice</div>
            <div className="text-2xl font-bold text-blue-400">{totalMinutes} min</div>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <div className="text-slate-400 text-sm">Avg Consistency</div>
            <div className="text-2xl font-bold text-green-400">{avgConsistency}%</div>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <div className="text-slate-400 text-sm">Circular Breaths</div>
            <div className="text-2xl font-bold text-purple-400">{totalCircularBreaths}</div>
          </Card>
        </div>

        {/* Sessions List */}
        {isLoading ? (
          <div className="text-center text-slate-400 py-12">Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <Card className="bg-slate-800/30 border-slate-700 p-12 text-center">
            <div className="text-slate-400 mb-4">No training sessions yet</div>
            <Link to={createPageUrl('Home')}>
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-500">
                Start Your First Session
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <Card key={session.id} className="bg-slate-800/30 border-slate-700 p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="text-white font-medium">
                      {format(new Date(session.created_date), 'MMMM d, yyyy')}
                    </div>
                    <div className="text-slate-400 text-sm">
                      {format(new Date(session.created_date), 'h:mm a')}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 md:gap-6">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="text-slate-300">{formatDuration(session.duration_seconds || 0)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wind className="w-4 h-4 text-cyan-400" />
                      <span className="text-slate-300">{(session.avg_pressure || 0).toFixed(1)} avg</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-slate-300">{session.circular_breaths_count || 0} breaths</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-purple-400" />
                      <span className="text-slate-300">{session.consistency_score || 0}%</span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(session.id)}
                    className="text-slate-500 hover:text-red-400 hover:bg-red-400/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                {session.notes && (
                  <div className="mt-3 pt-3 border-t border-slate-700 text-slate-400 text-sm">
                    {session.notes}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
