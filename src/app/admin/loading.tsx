'use client';

import React from 'react';

export default function AdminLoading() {
    return (
        <div className="flex-1 flex flex-col p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                    <div className="h-4 w-72 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                </div>
                <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
                        <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                        <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                    <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                </div>
                <div className="p-6 space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex gap-4">
                            <div className="h-12 flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-lg animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}


