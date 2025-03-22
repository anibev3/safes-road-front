// app/providers.tsx
'use client';

import { ReactNode } from 'react';

import { AuthProvider } from '@/hooks/use-auth';

// app/providers.tsx

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return <AuthProvider>{children}</AuthProvider>;
}
