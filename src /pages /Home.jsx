import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Square, Save, History, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

import PressureGauge from '@/components/breathing/PressureGauge';
import BreathingVisualizer from '@/components/breathing/BreathingVisualizer';
import SessionStats from '@/components/breathing/SessionStats';
import ArduinoConnection from '@/components/breathing/ArduinoConnection';

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [pressure, setPressure] = useState(0);
  const [showConnection, setShowConnection] = useState(false);
  
  // Session data
  const [sessionDuration, setSessionDuration] = useState(0);
  const [pressureHistory, setPressureHistory] = useState([]);
  const [circularBreaths, setCircularBreaths] = useState(0);
  
  const wsRef = useRef(null);
  const serialRef = useRef(null);
  const timerRef = useRef(null);
  const lastPressureRef = useRef(0);

  // Detect circular breath pattern
  useEffect(() => {
    if (isSessionActive && pressureHistory.length > 10) {
      const recent = pressureHistory.slice(-10);
      const hadDip = recent.some((p, i) => i > 0 && recent[i-1] > 30 && p < 20);
      const recovered = recent[recent.length - 1] > 30;
      
      if (hadDip && recovered && lastPressureRef.current < 20) {
        setCircularBreaths(prev => prev + 1);
      }
      lastPressureRef.current = recent[recent.length - 1];
    }
  }, [pressureHistory, isSessionActive]);

  // Session timer
  useEffect(() => {
    if (isSessionActive) {
      timerRef.current = setInterval(() => {
        setSessionDuration(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isSessionActive]);

  const handleConnect = useCallback(async ({ type, url, port }) => {
    if (type === 'websocket') {
      try {
        const ws = new WebSocket(url);
        ws.onopen = () => {
          setIsConnected(true);
          toast.success('Connected to Arduino');
        };
        ws.onmessage = (event) => {
          const value = parseFloat(event.data);
          if (!isNaN(value)) {
            setPressure(value);
            if (isSessionActive) {
              setPressureHistory(prev => [...prev, value]);
            }
          }
        };
        ws.onerror = () => {
          toast.error('Connection failed');
          setIsConnected(false);
        };
        ws.onclose = () => {
          setIsConnected(false);
        };
        wsRef.current = ws;
      } catch (err) {
        toast.error('Failed to connect');
      }
    } else if (type === 'serial') {
      // Web Serial API
      if ('serial' in navigator) {
        try {
          const port = await navigator.serial.requestPort();
          await port.open({ baudRate: 9600 });
          serialRef.current = port;
          setIsConnected(true);
          toast.success('Connected via Serial');
          
          const reader = port.readable.getReader();
          const decoder = new TextDecoder();
          
          const readLoop = async () => {
            while (true) {
              const { value, done } = await reader.read();
              if (done) break;
              const text = decoder.decode(value);
              const num = parseFloat(text.trim());
              if (!isNaN(num)) {
                setPressure(num);
                if (isSessionActive) {
                  setPressureHistory(prev => [...prev, num]);
                }
              }
            }
          };
          readLoop();
        } catch (err) {
          toast.error('Serial connection failed');
        }
      } else {
        toast.error('Web Serial not supported in this browser');
      }
    }
    setShowConnection(false);
  }, [isSessionActive]);

  const handleDisconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (serialRef.current) {
      serialRef.current.close();
      serialRef.current = null;
    }
    setIsConnected(false);
    setPressure(0);
  };

  const startSession = () => {
    setIsSessionActive(true);
    setSessionDuration(0);
    setPressureHistory([]);
    setCircularBreaths(0);
  };

  const stopSession = async () => {
    setIsSessionActive(false);
    
    if (sessionDuration > 5) {
      const avgPressure = pressureHistory.length > 0 
        ? pressureHistory.reduce((a, b) => a + b, 0) / pressureHistory.length 
        : 0;
      
      const maxPressure = pressureHistory.length > 0 
        ? Math.max(...pressureHistory) 
        : 0;
      
      // Calculate consistency (lower variance = higher score)
      const variance = pressureHistory.length > 0
        ? pressureHistory.reduce((sum, p) => sum + Math.pow(p - avgPressure, 2), 0) / pressureHistory.length
        : 0;
      const consistencyScore = Math.max(0, Math.min(100, 100 - Math.sqrt(variance)));

      await base44.entities.BreathingSession.create({
        duration_seconds: sessionDuration,
        avg_pressure: avgPressure,
        max_pressure: maxPressure,
        circular_breaths_count: circularBreaths,
        consistency_score: Math.round(consistencyScore)
      });
      
      toast.success('Session saved!');
    }
  };

  const avgPressure = pressureHistory.length > 0 
    ? pressureHistory.reduce((a, b) => a + b, 0) / pressureHistory.length 
    : 0;
  
  const consistencyScore = pressureHistory.length > 10
    ? Math.max(0, Math.min(100, 100 - Math.sqrt(
        pressureHistory.reduce((sum, p) => sum + Math.pow(p - avgPressure, 2), 0) / pressureHistory.length
      )))
    : 0;

  // Demo mode - simulate pressure when not connected
  useEffect(() => {
    if (!isConnected && isSessionActive) {
      const interval = setInterval(() => {
        const simulated = 40 + Math.sin(Date.now() / 1000) * 30 + Math.random() * 10;
        setPressure(simulated);
        setPressureHistory(prev => [...prev, simulated]);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isConnected, isSessionActive]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              AuraBreath
            </h1>
            <p className="text-slate-400 mt-1">Circular Breathing Trainer</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
              onClick={() => setShowConnection(!showConnection)}
            >
              <Settings className="w-5 h-5" />
            </Button>
            <Link to={createPageUrl('History')}>
              <Button
                variant="outline"
                size="icon"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <History className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Connection Panel */}
        <AnimatePresence>
          {showConnection && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <ArduinoConnection
                isConnected={isConnected}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Training Area */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Pressure Gauge */}
          <Card className="bg-slate-800/30 border-slate-700 p-8 flex flex-col items-center justify-center">
            <PressureGauge 
              pressure={pressure} 
              maxPressure={100} 
              isConnected={isConnected || isSessionActive}
            />
            <div className="mt-6 text-center">
              <p className="text-slate-300 text-sm">
                {pressure < 30 ? 'Blow harder into the didgeridoo' : 
                 pressure < 70 ? 'Great pressure - maintain it!' : 
                 'Strong breath - try circular breathing now!'}
              </p>
            </div>
          </Card>

          {/* Breathing Visualizer */}
          <Card className="bg-slate-800/30 border-slate-700 p-8 flex flex-col items-center justify-center">
            <BreathingVisualizer pressure={pressure} isActive={isSessionActive} />
            <p className="text-slate-400 text-sm mt-4">
              {isSessionActive ? 'Breathe in through your nose while maintaining airflow' : 'Start session to begin training'}
            </p>
          </Card>
        </div>

        {/* Session Stats */}
        <div className="mb-8">
          <SessionStats
            duration={sessionDuration}
            avgPressure={avgPressure}
            circularBreaths={circularBreaths}
            consistencyScore={Math.round(consistencyScore)}
          />
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-4">
          {!isSessionActive ? (
            <Button
              size="lg"
              onClick={startSession}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-lg px-8 py-6"
            >
              <Play className="w-6 h-6 mr-2" />
              Start Session
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={stopSession}
              variant="outline"
              className="border-red-500 text-red-400 hover:bg-red-500/20 text-lg px-8 py-6"
            >
              <Square className="w-6 h-6 mr-2" />
              End Session
            </Button>
          )}
        </div>

        {/* Instructions */}
        <Card className="bg-slate-800/30 border-slate-700 p-6 mt-8">
          <h3 className="text-white font-semibold mb-3">How to Practice Circular Breathing</h3>
          <ol className="text-slate-300 text-sm space-y-2 list-decimal list-inside">
            <li>Connect your Arduino pressure sensor to the didgeridoo</li>
            <li>Start blowing to create a steady drone sound</li>
            <li>Store air in your cheeks while inhaling through your nose</li>
            <li>Push the stored air out with your cheeks while breathing in</li>
            <li>Practice until you can maintain continuous airflow</li>
          </ol>
          <p className="text-cyan-400 text-sm mt-4">
            Regular practice can help strengthen throat muscles and reduce sleep apnea symptoms.
          </p>
        </Card>
      </div>
    </div>
  );
}
