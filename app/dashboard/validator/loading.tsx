// app/dashboard/validator/loading.js

import React from 'react';

const shimmer =
  'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

export default function Loading() {
  return (
    <div className="p-4">
      <div
        className={`${shimmer} relative mb-8 h-8 w-40 overflow-hidden rounded-md bg-gray-200`}
      ></div>
      <div className="overflow-hidden rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              {['Id', 'Name', 'Description', 'Created On', 'Actions'].map(
                (heading, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    {heading}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {[...Array(5)].map((_, index) => (
              <tr key={index}>
                <td className="px-6 py-4">
                  <div
                    className={`${shimmer} relative h-4 w-16 overflow-hidden rounded-md bg-gray-200`}
                  ></div>
                </td>
                <td className="px-6 py-4">
                  <div
                    className={`${shimmer} relative h-4 w-24 overflow-hidden rounded-md bg-gray-200`}
                  ></div>
                </td>
                <td className="px-6 py-4">
                  <div
                    className={`${shimmer} relative h-4 w-32 overflow-hidden rounded-md bg-gray-200`}
                  ></div>
                </td>
                <td className="px-6 py-4">
                  <div
                    className={`${shimmer} relative h-4 w-20 overflow-hidden rounded-md bg-gray-200`}
                  ></div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end space-x-2">
                    <div
                      className={`${shimmer} relative h-8 w-8 overflow-hidden rounded-md bg-gray-200`}
                    ></div>
                    <div
                      className={`${shimmer} relative h-8 w-8 overflow-hidden rounded-md bg-gray-200`}
                    ></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
