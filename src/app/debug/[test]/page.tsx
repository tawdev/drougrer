'use client';

import { use } from 'react';

export default function DebugPage({ params }: { params: Promise<{ test: string }> }) {
    const { test } = use(params);
    return (
        <div className="flex-1 flex flex-col p-20 text-center">
            <h1 className="text-4xl font-bold">Debug Page</h1>
            <p className="mt-4">Dynamic Param: <span className="text-red-500 font-mono">{test}</span></p>
        </div>
    );
}
