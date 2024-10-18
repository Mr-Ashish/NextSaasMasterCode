import React from 'react';

const shimmer =
  'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

export default function Loading() {
  return (
    <div className="flex h-screen w-full flex-col">
      {/* Back Button Placeholder */}
      <div className="p-4">
        <div
          className={`${shimmer} relative mb-4 h-10 w-24 overflow-hidden rounded-md bg-gray-200`}
        ></div>
      </div>

      {/* Main Editor and Preview Section */}
      <div className="flex h-full w-full">
        {/* Left Side - Editor Placeholder */}
        <div className="w-1/2 overflow-auto border-r p-4">
          <div
            className={`${shimmer} relative mb-2 h-6 w-40 overflow-hidden rounded-md bg-gray-200`}
          ></div>
          <div
            className={`${shimmer} relative h-full w-full overflow-hidden rounded-lg bg-gray-100`}
          ></div>
        </div>

        {/* Right Side - Preview Placeholder */}
        <div className="w-1/2 p-4">
          <div
            className={`${shimmer} relative mb-2 h-6 w-40 overflow-hidden rounded-md bg-gray-200`}
          ></div>
          <div
            className={`${shimmer} relative h-full w-full overflow-hidden rounded-lg bg-gray-100`}
          ></div>
        </div>
      </div>
    </div>
  );
}
