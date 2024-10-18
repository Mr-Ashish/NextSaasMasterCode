import React from 'react';

const shimmer =
  'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div
        className={`${shimmer} relative overflow-hidden rounded-xl bg-gray-100 p-4 shadow-sm`}
        style={{ width: '80%', maxWidth: '800px' }}
      >
        <div className="flex flex-col md:flex-row">
          {/* Left Section Skeleton */}
          <div className="flex flex-col space-y-6 p-4 md:w-1/3">
            <div className="h-10 w-24 rounded-md bg-gray-200" />
            <div className="h-6 w-40 rounded-md bg-gray-200" />
            <div className="flex flex-col space-y-4">
              <div className="h-10 w-full rounded-md bg-gray-200" />
              <div className="h-10 w-full rounded-md bg-gray-200" />
            </div>
            <div className="h-6 w-32 rounded-md bg-gray-200" />
            <div className="h-4 w-full rounded-md bg-gray-200" />
            <div className="h-4 w-3/4 rounded-md bg-gray-200" />
            <div className="h-4 w-2/3 rounded-md bg-gray-200" />
          </div>

          {/* Right Section Skeleton */}
          <div className="flex flex-1 flex-col p-4 md:w-2/3">
            <div className="mb-4 h-6 w-48 rounded-md bg-gray-200" />
            <div className="h-64 w-full rounded-md bg-gray-200" />
            <div className="mt-4 flex space-x-4">
              <div className="h-10 w-32 rounded-md bg-gray-200" />
              <div className="h-10 w-36 rounded-md bg-gray-200" />
              <div className="h-10 w-40 rounded-md bg-gray-200" />
            </div>
            <div className="mt-4 h-10 w-56 rounded-md bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
