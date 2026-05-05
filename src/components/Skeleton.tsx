import React from 'react';
import { cn } from '../lib/utils';

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => {
  return (
    <div 
      className={cn(
        "animate-pulse bg-slate-900 rounded-md",
        className
      )} 
    />
  );
};

export const StatsCardSkeleton = () => (
  <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl min-h-[220px]">
    <Skeleton className="w-12 h-12 rounded-2xl mb-6" />
    <Skeleton className="w-24 h-3 mb-2" />
    <Skeleton className="w-20 h-8 mb-3" />
    <Skeleton className="w-16 h-3" />
  </div>
);

export const RaceCardSkeleton = () => (
  <div className="bg-slate-950 border border-slate-800 rounded-[2.5rem] overflow-hidden min-h-[450px]">
    <div className="h-48 bg-slate-900 animate-pulse" />
    <div className="p-8 space-y-4">
      <Skeleton className="w-3/4 h-8 mb-6" />
      <Skeleton className="w-1/2 h-4" />
      <Skeleton className="w-1/3 h-4" />
      <div className="pt-6 border-t border-slate-900 flex justify-between">
        <Skeleton className="w-20 h-8" />
        <Skeleton className="w-24 h-10 rounded-xl" />
      </div>
    </div>
  </div>
);
