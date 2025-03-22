'use client';

import { Suspense, useEffect, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import TripSummary from '@/components/history/trip-history';

// Create a client component that safely uses useSearchParams inside Suspense
function TripSummaryWrapper() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const routeId = searchParams.get('routeId') || 'route_1742648102885'; // Default ID or from URL

    // State for trip statistics (replace with your real data)
    const [tripStats, setTripStats] = useState({
        avgSpeed: 60.5,
        maxSpeed: 85,
        risksAvoided: 6,
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        endTime: new Date(),
        pauseTime: 15 * 60 * 1000 // 15 minutes
    });

    // Function to handle closing the summary
    const handleClose = () => {
        router.push('/history'); // Redirect to history page
    };

    return <TripSummary routeId={routeId} onClose={handleClose} tripStats={tripStats} />;
}

export default function NavigHistoryPage() {
    return (
        <div className='container mx-auto'>
            <Suspense
                fallback={
                    <div className='flex h-full items-center justify-center'>
                        <div className='h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent'></div>
                    </div>
                }>
                <TripSummaryWrapper />
            </Suspense>
        </div>
    );
}
