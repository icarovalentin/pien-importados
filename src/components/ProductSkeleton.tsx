'use client';

import React from 'react';

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10 pt-2">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="space-y-3 animate-pulse">
          <div className="w-full aspect-[3/4] bg-[#ebe6dc] dark:bg-dark-850" />
          <div className="space-y-2">
            <div className="flex justify-between">
              <div className="h-2.5 w-16 bg-[#ebe6dc] dark:bg-dark-800" />
              <div className="h-2.5 w-10 bg-[#ebe6dc] dark:bg-dark-800" />
            </div>
            <div className="h-4 w-4/5 bg-[#ebe6dc] dark:bg-dark-800" />
            <div className="h-3.5 w-1/3 bg-[#ebe6dc] dark:bg-dark-800" />
          </div>
        </div>
      ))}
    </div>
  );
}
