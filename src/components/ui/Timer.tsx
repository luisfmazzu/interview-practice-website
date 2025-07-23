'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TimerProps } from '@/types';

const Timer: React.FC<TimerProps> = ({
  onTick,
  autoStart = false,
  format = 'MM:SS',
  onReset,
}) => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (autoStart) {
      start();
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoStart]); // eslint-disable-line react-hooks/exhaustive-deps

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
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (onReset) {
      onReset();
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
    <div className="flex items-center space-x-4">
      <div className="text-2xl font-mono font-bold text-primary-600">
        {formatTime(seconds)}
      </div>
      <div className="flex space-x-2">
        {!isRunning ? (
          <button
            onClick={start}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Start
          </button>
        ) : (
          <button
            onClick={pause}
            className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
          >
            Pause
          </button>
        )}
        <button
          onClick={reset}
          className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default Timer;