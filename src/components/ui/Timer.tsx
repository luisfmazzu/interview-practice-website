'use client';

import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { TimerProps, TimerRef } from '@/types';

const Timer = forwardRef<TimerRef, TimerProps>(({
  onTick,
  autoStart = false,
  format = 'MM:SS',
  onReset,
}, ref) => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Expose timer methods to parent component
  useImperativeHandle(ref, () => ({
    reset,
    start,
    pause
  }));

  useEffect(() => {
    if (autoStart) {
      // Small delay to ensure component is fully mounted
      const timeoutId = setTimeout(() => {
        if (!intervalRef.current) {
          setIsRunning(true);
          intervalRef.current = setInterval(() => {
            setSeconds(prev => prev + 1);
          }, 1000);
        }
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [autoStart]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (onTick) {
      onTick(seconds);
    }
  }, [seconds, onTick]);

  const start = () => {
    if (!isRunning) {
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }
  };

  const pause = () => {
    if (isRunning && intervalRef.current) {
      setIsRunning(false);
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const reset = () => {
    setSeconds(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (onReset) {
      onReset();
    }
    // Auto-restart if it was set to autoStart
    if (autoStart) {
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setIsRunning(false);
    }
  };

  const formatTime = (totalSeconds: number): string => {
    if (format === 'SS') {
      return totalSeconds.toString().padStart(2, '0');
    }
    
    // MM:SS format
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center space-x-6">
      <div className="text-3xl font-mono font-bold text-primary-600">
        {formatTime(seconds)}
      </div>
      <div className="flex space-x-3">
        {!isRunning ? (
          <button
            onClick={start}
            className="px-4 py-2 text-base font-medium bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Start
          </button>
        ) : (
          <button
            onClick={pause}
            className="px-4 py-2 text-base font-medium bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
          >
            Pause
          </button>
        )}
        <button
          onClick={reset}
          className="px-4 py-2 text-base font-medium bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
});

Timer.displayName = 'Timer';

export default Timer;