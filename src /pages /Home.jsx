import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, BarChart3, BookOpen, Moon, Wind, Heart } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { createPageUrl } from '@/utils';

export default function Home() {
  const features = [
    {
      icon: Wind,
      title: 'Circular Breathing',
      description: 'Learn the traditional didgeridoo technique used for centuries'
    },
    {
      icon: Moon,
      title: 'Sleep Apnea Relief',
      description: 'Strengthen throat muscles to reduce sleep apnea symptoms'
    },
    {
      icon: Heart,
      title: 'Health Benefits',
      description: 'Improve respiratory health and reduce snoring naturally'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="waves" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
            <rect fill="url(#waves)" width="100" height="100" />
          </svg>
        </div>

        <div className="max-w-4xl mx-auto px-4 pt-16 pb-24 md:pt-24 md:pb-32 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Logo/Icon */}
            <motion.div
              className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-xl shadow-amber-200"
              animate={{ 
                scale: [1, 1.05, 1],
                boxShadow: [
                  '0 25px 50px -12px rgba(217, 119, 6, 0.25)',
                  '0 25px 50px -12px rgba(217, 119, 6, 0.4)',
                  '0 25px 50px -12px rgba(217, 119, 6, 0.25)'
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Wind className="w-12 h-12 md:w-16 md:h-16 text-white" />
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-light text-stone-800 mb-4 tracking-tight">
              Breathe
              <span className="font-normal text-amber-600"> Better</span>
            </h1>
            
            <p className="text-lg md:text-xl text-stone-500 mb-8 max-w-xl mx-auto leading-relaxed">
              Master circular breathing with didgeridoo training to naturally reduce sleep apnea and improve your sleep quality.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to={createPageUrl('Train')}>
                <Button 
                  size="lg" 
                  className="rounded-full px-8 py-6 text-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-lg shadow-amber-200 transition-all hover:shadow-xl hover:shadow-amber-300"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Training
                </Button>
              </Link>
              
              <Link to={createPageUrl('Progress')}>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="rounded-full px-8 py-6 text-lg border-2 border-stone-300 hover:border-amber-400 hover:bg-amber-50"
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  View Progress
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-stone-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-stone-500 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-r from-stone-800 to-stone-900 rounded-3xl p-8 text-white"
        >
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">
                How It Works
              </h3>
              <p className="text-stone-300 leading-relaxed mb-4">
                Circular breathing is a technique where you inhale through your nose while simultaneously exhaling through your mouth. This trains the muscles in your upper airway, which studies have shown can significantly reduce sleep apnea severity and snoring.
              </p>
              <p className="text-stone-400 text-sm">
                Use your phone's microphone as a pressure sensor to get real-time feedback on your breathing technique — no didgeridoo required (though one helps!).
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
