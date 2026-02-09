import { useState, useEffect, useRef, useCallback } from 'react';

export default function usePressureSensor() {
  const [isListening, setIsListening] = useState(false);
  const [pressureLevel, setPressureLevel] = useState(0);
  const [hasPermission, setHasPermission] = useState(null);
  const [error, setError] = useState(null);
  const [blowState, setBlowState] = useState('idle'); // 'idle', 'blowing', 'stopped'
  
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  // For edge detection (Arduino pressure sensor pattern)
  const baselineRef = useRef(0);
  const historyRef = useRef([]);
  const isBlowingRef = useRef(false);
  const blowStartCallbackRef = useRef(null);
  const blowEndCallbackRef = useRef(null);
  const cooldownRef = useRef(false);

  const startListening = useCallback(async () => {
    try {
      setError(null);
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        } 
      });
      
      streamRef.current = stream;
      setHasPermission(true);

      // Create audio context
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      // Create analyser node
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      // Connect microphone to analyser
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      setIsListening(true);

      // Start analyzing
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      // Edge detection thresholds for Arduino pressure sensor
      const SPIKE_THRESHOLD = 12; // Minimum spike to detect edge
      const HISTORY_SIZE = 10; // Samples to track for baseline
      const COOLDOWN_MS = 800; // Minimum time between detections
      
      const analyze = () => {
        if (!analyserRef.current) return;
        
        analyser.getByteFrequencyData(dataArray);
        
        // Calculate average amplitude
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        
        // Map to 0-100 range
        const currentLevel = Math.min((average / 60) * 100, 100);
        
        // Maintain history for baseline calculation
        historyRef.current.push(currentLevel);
        if (historyRef.current.length > HISTORY_SIZE) {
          historyRef.current.shift();
        }
        
        // Calculate baseline (average of recent history)
        const baseline = historyRef.current.reduce((a, b) => a + b, 0) / historyRef.current.length;
        
        // Detect SPIKE (edge) - difference from baseline
        const spike = currentLevel - baseline;
        
        if (!cooldownRef.current) {
          // Positive spike = blow START
          if (spike > SPIKE_THRESHOLD && !isBlowingRef.current) {
            isBlowingRef.current = true;
            setBlowState('blowing');
            cooldownRef.current = true;
            setTimeout(() => { cooldownRef.current = false; }, COOLDOWN_MS);
            
            if (blowStartCallbackRef.current) {
              blowStartCallbackRef.current();
            }
          }
          
          // Negative spike = blow END (pressure drop)
          if (spike < -SPIKE_THRESHOLD && isBlowingRef.current) {
            isBlowingRef.current = false;
            setBlowState('stopped');
            cooldownRef.current = true;
            setTimeout(() => { cooldownRef.current = false; }, COOLDOWN_MS);
            
            if (blowEndCallbackRef.current) {
              blowEndCallbackRef.current();
            }
            
            // Reset to idle after a moment
            setTimeout(() => setBlowState('idle'), 500);
          }
        }
        
        baselineRef.current = baseline;
        setPressureLevel(currentLevel);
        
        animationFrameRef.current = requestAnimationFrame(analyze);
      };
      
      analyze();
      
    } catch (err) {
      console.error('Microphone access error:', err);
      setHasPermission(false);
      setError(err.message || 'Could not access microphone');
    }
  }, []);

  const stopListening = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    audioContextRef.current = null;
    analyserRef.current = null;
    streamRef.current = null;
    
    setIsListening(false);
    setPressureLevel(0);
    smoothedLevelRef.current = 0;
  }, []);

  // Set callbacks
  const setBlowCallbacks = useCallback((onStart, onEnd) => {
    blowStartCallbackRef.current = onStart;
    blowEndCallbackRef.current = onEnd;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    isListening,
    pressureLevel,
    blowState,
    hasPermission,
    error,
    startListening,
    stopListening,
    setBlowCallbacks
  };
}
