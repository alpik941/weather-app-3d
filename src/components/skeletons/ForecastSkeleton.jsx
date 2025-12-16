import React from 'react';

export default function ForecastSkeleton({ rows = 3 }) {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-white/10 rounded-lg p-4 flex items-center">
          <div className="w-20 h-4 bg-white/20 rounded mr-4" />
          <div className="flex-1 h-4 bg-white/20 rounded" />
          <div className="w-16 h-4 bg-white/20 rounded ml-4" />
        </div>
      ))}
    </div>
  );
}
