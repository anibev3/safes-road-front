import { Suspense } from 'react';

import NavigationScreenContent from '@/components/navigation/page';

export default function NavigationPage() {
    return (
        <Suspense
            fallback={
                <div className='flex h-screen items-center justify-center'>
                    <div className='h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent'></div>
                    <p className='ml-3'>Chargement...</p>
                </div>
            }>
            <NavigationScreenContent />
        </Suspense>
    );
}
