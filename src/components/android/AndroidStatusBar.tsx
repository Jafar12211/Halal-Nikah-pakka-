import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

export const AndroidStatusBar: React.FC = () => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-emerald-950 text-emerald-100/90 px-4 py-1 flex items-center justify-between text-[11px] font-mono tracking-tight select-none border-b border-emerald-900/40">
      <div className="font-semibold text-white">{time || '09:45'}</div>
      <div className="flex items-center gap-2">
        <Signal className="w-3 h-3 text-emerald-300" />
        <Wifi className="w-3 h-3 text-emerald-300" />
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-emerald-200">88%</span>
          <BatteryMedium className="w-3.5 h-3.5 text-emerald-300" />
        </div>
      </div>
    </div>
  );
};
