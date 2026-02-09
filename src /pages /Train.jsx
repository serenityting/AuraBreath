import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, Mic, MicOff, Volume2, Info } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import BreathingVisualizer from '@/components/breathing/BreathingVisualizer';
import PressureMeter from '@/components/breathing/PressureMeter';
import PhaseGuide from '@/components/breathing/PhaseGuide';
import SessionStats from '@/components/breathing/SessionStats';
import ProgramSelector, { programs } from '@/components/breathing/ProgramSelector';
import usePressureSensor from '@/components/breathing/usePressureSensor';

export default function Train() {
  const [selectedProgram, setSelectedProgram] = useState(programs[0]);
  const [isTraining, setIsTraining] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('idle');
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [circularBreaths, setCircularBreaths] = useState(0);
  const [longestSustained, setLongestSustained] = useState(0);
  const [pressureHistory, setPressureHistory] = useState([]);
  const [showTip, setShowTip] = useState(true);

  const {
    isListening,
    pressureLevel,
    blowState,
    hasPermission,
    error,
    startListening,
    stopListening,
    setBlowCallbacks
  } = usePressureSensor();

  const timerRef = useRef(null);
  const phaseTimerRef = useRef(null);
  const currentSustainedRef = useRef(0);

  // Breath-driven phase logic
  const handleBlowStart = useCallback(() => {
    if (!isTraining) return;
    
    // When user starts blowing = exhale phase
    setCurrentPhase('exhale');
    setPhaseProgress(50);
  }, [isTraining]);

  const handleBlowEnd = useCallback(() => {
    if (!isTraining) return;
    
    // When user stops blowing = sniff phase (they should inhale through nose now)
    setCurrentPhase('sniff');
    setPhaseProgress(50);
    
    // After a moment, go to hold phase, then back to waiting for next blow
    setTimeout(() => {
      setCurrentPhase('hold');
      setPhaseProgress(50);
      setCircularBreaths(prev => prev + 1);
      
      setTimeout(() => {
        setCurrentPhase('idle');
        setPhaseProgress(0);
      }, 1000);
    }, 1500);
  }, [isTraining]);

  // Register blow callbacks
  useEffect(() => {
    setBlowCallbacks(handleBlowStart, handleBlowEnd);
  }, [setBlowCallbacks, handleBlowStart, handleBlowEnd]);

  const startTraining = async () => {
    if (!isListening) {
      await startListening();
    }
    
    setIsTraining(true);
    setSessionDuration(0);
    setCircularBreaths(0);
    setLongestSustained(0);
    setPressureHistory([]);
    currentSustainedRef.current = 0;
    setShowTip(false);
    setCurrentPhase('idle');
    
    // Start duration timer
    timerRef.current = setInterval(() => {
      setSessionDuration(prev => prev + 1);
    }, 1000);
    
    // No automatic cycle - now driven by sensor detection
  };

  const stopTraining = async () => {
    setIsTraining(false);
    setCurrentPhase('idle');
    setPhaseProgress(0);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (phaseTimerRef.current) {
      clearInterval(phaseTimerRef.current);
    }
    
    // Calculate average pressure
    const avgPressure = pressureHistory.length > 0 
      ? pressureHistory.reduce((a, b) => a + b, 0) / pressureHistory.length 
      : 0;
    
    // Save session if it was meaningful
    if (sessionDuration > 10) {
      try {
        await base44.entities.TrainingSession.create({
          duration_seconds: sessionDuration,
          program_type: selectedProgram.id,
          avg_pressure_score: Math.round(avgPressure),
          circular_breaths_count: circularBreaths,
          longest_sustained_seconds: longestSustained
        });
        toast.success('Training session saved!');
      } catch (err) {
        console.error('Failed to save session:', err);
      }
    }
  };

  // Track pressure during training
  useEffect(() => {
    if (isTraining && pressureLevel > 0) {
      setPressureHistory(prev => [...prev.slice(-100), pressureLevel]);
      
      // Track sustained breathing
      if (pressureLevel >= 30 && pressureLevel <= 70) {
        currentSustainedRef.current += 0.1;
        if (currentSustainedRef.current > longestSustained) {
          setLongestSustained(Math.floor(currentSustainedRef.current));
        }
      } else {
        currentSustainedRef.current = 0;
      }
    }
  }, [isTraining, pressureLevel, longestSustained]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (phaseTimerRef.current) clearInterval(phaseTimerRef.current);
    };
  }, []);

  const avgPressure = pressureHistory.length > 0 
    ? pressureHistory.reduce((a, b) => a + b, 0) / pressureHistory.length 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-light text-stone-800 mb-2">
            Circular Breathing
          </h1>
          <p className="text-stone-500">
            Train your breathing for better sleep & reduced apnea
          </p>
        </div>

        {/* Main Training Area */}
        <div className="flex flex-col items-center gap-8">
          {/* Visualizer */}
          <BreathingVisualizer 
            pressureLevel={pressureLevel}
            phase={currentPhase}
            isActive={isTraining}
          />

          {/* Pressure Meter */}
          <PressureMeter 
            level={pressureLevel}
            targetMin={30}
            targetMax={70}
          />

          {/* Phase Guide */}
          <AnimatePresence mode="wait">
            {isTraining ? (
              <motion.div
                key="guide"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <PhaseGuide 
                  currentPhase={currentPhase}
                  progress={phaseProgress}
                />
              </motion.div>
            ) : (
              <motion.div
                key="selector"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <ProgramSelector 
                  selectedProgram={selectedProgram}
                  onSelect={setSelectedProgram}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Session Stats */}
          {isTraining && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <SessionStats 
                duration={sessionDuration}
                circularBreaths={circularBreaths}
                avgPressure={avgPressure}
                longestSustained={longestSustained}
              />
            </motion.div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Mic indicator */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              isListening ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'
            }`}>
              {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              <span className="text-sm font-medium">
                {isListening ? 'Sensor Active' : 'Sensor Off'}
              </span>
            </div>

            {/* Main action button */}
            <Button
              onClick={isTraining ? stopTraining : startTraining}
              size="lg"
              className={`rounded-full px-8 py-6 text-lg font-medium transition-all ${
                isTraining 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700'
              }`}
            >
              {isTraining ? (
                <>
                  <Square className="w-5 h-5 mr-2" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Start Training
                </>
              )}
            </Button>
          </div>

          {/* Permission error */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm"
            >
              {error}. Please allow microphone access to use the pressure sensor.
            </motion.div>
          )}

          {/* Tip */}
          <AnimatePresence>
            {showTip && !isTraining && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-start gap-3 bg-blue-50 p-4 rounded-2xl max-w-md"
              >
                <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-800 font-medium mb-1">
                    Sensor-Driven Training
                  </p>
                  <p className="text-sm text-blue-600">
                    The app detects when you start and stop blowing. Blow into your didgeridoo to begin exhaling, then stop to trigger the sniff/inhale phase.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Blow state indicator during training */}
          {isTraining && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                blowState === 'blowing' 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : blowState === 'stopped'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-stone-100 text-stone-500'
              }`}
            >
              {blowState === 'blowing' ? '🌬️ Blowing detected - Exhale!' 
                : blowState === 'stopped' ? '👃 Stopped - Sniff through nose!' 
                : 'Waiting for breath...'}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
