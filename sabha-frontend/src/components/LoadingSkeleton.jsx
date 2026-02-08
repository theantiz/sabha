// LoadingSkeleton.jsx - Skeleton loader for rounds and content
import React from 'react';

export function RoundSkeleton() {
  return (
    <div className="rounded-2xl border border-[rgba(130,92,57,.16)] bg-[rgba(255,252,248,.96)] p-4 shadow-[0_8px_18px_rgba(82,51,25,.08)] animate-pulse sm:p-5">
      {/* Header skeleton */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-3">
          <div className="h-4 w-24 bg-[rgba(130,92,57,.2)] rounded" />
          <div className="h-5 w-20 bg-[rgba(130,92,57,.15)] rounded-full" />
        </div>
        <div className="h-3 w-12 bg-[rgba(130,92,57,.15)] rounded" />
      </div>

      {/* Messages skeleton */}
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-xl bg-white/60 p-3 border border-[rgba(130,92,57,.1)]">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-3 w-16 bg-[rgba(130,92,57,.2)] rounded" />
              <div className="h-4 w-14 bg-[rgba(130,92,57,.15)] rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full bg-[rgba(130,92,57,.1)] rounded" />
              <div className="h-3 w-5/6 bg-[rgba(130,92,57,.1)] rounded" />
              <div className="h-3 w-4/6 bg-[rgba(130,92,57,.1)] rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DiscussionFormSkeleton() {
  return (
    <div className="rounded-3xl border border-[rgba(130,92,57,.18)] bg-white p-4 shadow-[0_16px_36px_rgba(76,48,28,.12)] animate-pulse sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="h-3 w-20 bg-[rgba(130,92,57,.2)] rounded mb-2" />
          <div className="h-7 w-32 bg-[rgba(130,92,57,.2)] rounded" />
        </div>
        <div className="h-6 w-24 bg-[rgba(139,62,47,.2)] rounded-full" />
      </div>

      <div className="mt-4 h-14 bg-[rgba(130,92,57,.1)] rounded-2xl" />

      <div className="mt-4 flex items-center gap-3">
        <div className="h-9 w-28 bg-[rgba(143,89,52,.3)] rounded-full" />
        <div className="h-3 w-40 bg-[rgba(130,92,57,.15)] rounded" />
      </div>
    </div>
  );
}

export function ConsensusSkeleton() {
  return (
    <div className="rounded-3xl border border-[rgba(130,92,57,.18)] bg-white p-4 shadow-[0_14px_30px_rgba(76,48,28,.1)] animate-pulse sm:p-5">
      <div className="h-3 w-28 bg-[rgba(130,92,57,.2)] rounded mb-2" />
      <div className="h-5 w-32 bg-[rgba(130,92,57,.2)] rounded mb-3" />
      <div className="space-y-2">
        <div className="h-3 w-full bg-[rgba(130,92,57,.1)] rounded" />
        <div className="h-3 w-5/6 bg-[rgba(130,92,57,.1)] rounded" />
      </div>
      <div className="flex gap-2 mt-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-6 w-20 bg-[rgba(139,62,47,.15)] rounded-full" />
        ))}
      </div>
    </div>
  );
}

export function LoadingIndicator({ text = "Processing..." }) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <div className="relative">
        <div className="h-6 w-6 rounded-full border-2 border-[rgba(143,89,52,.3)] border-t-[#8f3f31]" />
      </div>
      <span className="text-sm text-sabhaMuted">{text}</span>
    </div>
  );
}

export function LoadingDots() {
  return (
    <div className="flex items-center gap-1">
      <div className="h-2 w-2 rounded-full bg-[#8f3f31] animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="h-2 w-2 rounded-full bg-[#8f3f31] animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="h-2 w-2 rounded-full bg-[#8f3f31] animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}

