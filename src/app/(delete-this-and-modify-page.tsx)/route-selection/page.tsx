// app/(dashboard)/route-selection/page.tsx
'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import DashboardLayout from '@/app/dash/layout';
import DashboardHeader from '@/components/layout/dashboard-header';
import { useRouteSelection } from '@/hooks/use-route-selection';
import { Alert, AlertDescription } from '@/registry/new-york-v4/ui/alert';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent } from '@/registry/new-york-v4/ui/card';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from '@/registry/new-york-v4/ui/select';

import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, MapPin, Navigation, Search, X } from 'lucide-react';

// app/(dashboard)/route-selection/page.tsx

// app/(dashboard)/route-selection/page.tsx

// app/(dashboard)/route-selection/page.tsx

function SelectedPointDisplay({ label, color, onClear }: { label: string; color: string; onClear: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-center justify-between rounded-lg p-3 bg-${color}-50 border border-${color}-200`}>
            <div className='flex items-center'>
                <CheckCircle className={`mr-2 h-4 w-4 text-${color}-600`} />
                <span className={`text-sm text-${color}-800 font-medium`}>{label}</span>
            </div>
            <Button
                variant='ghost'
                size='sm'
                className={`h-6 w-6 rounded-full p-0 hover:bg-${color}-100`}
                onClick={onClear}>
                <X className={`h-4 w-4 text-${color}-600`} />
            </Button>
        </motion.div>
    );
}

// Composant pour une section d'itinéraire (départ ou destination)
function RouteSection({
    title,
    icon,
    color,
    children
}: {
    title: string;
    icon: React.ReactNode;
    color: string;
    children: React.ReactNode;
}) {
    return (
        <Card className='overflow-hidden'>
            <CardContent className='p-0'>
                <div className={`flex items-center p-4 bg-${color}-50 border-b border-${color}-100`}>
                    <div className={`flex items-center justify-center rounded-full p-2 bg-${color}-100 mr-3`}>
                        {icon}
                    </div>
                    <h2 className={`text-lg font-semibold text-${color}-900`}>{title}</h2>
                </div>
                <div className='p-4'>{children}</div>
            </CardContent>
        </Card>
    );
}

export default function RouteSelectionPage() {
    const router = useRouter();
    const {
        departureCities,
        destinationRoutes,
        departurePoints,
        destinationPoints,
        selectedDepartureCity,
        selectedDestinationCity,
        selectedStartPoint,
        selectedEndPoint,
        isLoading,
        error,
        handleDepartureChange,
        handleDestinationChange,
        handleStartPointSelected,
        handleEndPointSelected,
        clearStartPoint,
        clearEndPoint,
        showRoute
    } = useRouteSelection();

    return (
        <DashboardLayout>
            <div className='flex min-h-screen flex-col bg-gray-50'>
                <main className='container mx-auto max-w-4xl flex-1 px-4 py-8'>
                    <div className='mb-6 flex items-center'>
                        <Button variant='ghost' size='icon' className='mr-2' onClick={() => router.back()}>
                            <ArrowLeft className='h-5 w-5' />
                        </Button>
                        <h1 className='text-2xl font-bold text-blue-900'>Afficher un trajet</h1>
                    </div>

                    {error && (
                        <Alert variant='destructive' className='mb-6'>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className='space-y-6'>
                        {/* Section de départ */}
                        <RouteSection
                            title='Point de départ'
                            icon={<Navigation className='h-5 w-5 text-green-600' />}
                            color='green'>
                            <div className='space-y-4'>
                                <div className='space-y-2'>
                                    <label className='text-sm font-medium'>Ville de départ</label>
                                    <Select
                                        value={selectedDepartureCity}
                                        onValueChange={handleDepartureChange}
                                        disabled={isLoading || departureCities.length === 0}>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Sélectionnez votre ville' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Villes disponibles</SelectLabel>
                                                {departureCities.map((city) => (
                                                    <SelectItem key={city} value={city}>
                                                        {city}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {departurePoints.length > 0 && (
                                    <div className='space-y-2'>
                                        <label className='text-sm font-medium'>Point précis</label>
                                        <Select
                                            onValueChange={(value) => handleStartPointSelected(parseInt(value))}
                                            disabled={isLoading}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder='Précisez votre point de départ' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>Points disponibles</SelectLabel>
                                                    {departurePoints.map((point) => (
                                                        <SelectItem key={point.id} value={point.id.toString()}>
                                                            {point.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {selectedStartPoint && (
                                    <SelectedPointDisplay
                                        label={selectedStartPoint.label}
                                        color='green'
                                        onClear={clearStartPoint}
                                    />
                                )}
                            </div>
                        </RouteSection>

                        {/* Ligne de connexion */}
                        {/* {departurePoints.length > 0 && (
                            <div className='flex justify-center py-2'>
                                <div className='h-8 w-0.5 bg-blue-600'></div>
                            </div>
                        )} */}

                        {/* Section de destination */}
                        {destinationRoutes.length > 0 && (
                            <RouteSection
                                title='Destination'
                                icon={<MapPin className='h-5 w-5 text-red-600' />}
                                color='red'>
                                <div className='space-y-4'>
                                    <div className='space-y-2'>
                                        <label className='text-sm font-medium'>Ville d'arrivée</label>
                                        <Select
                                            value={selectedDestinationCity}
                                            onValueChange={handleDestinationChange}
                                            disabled={isLoading || destinationRoutes.length === 0}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder='Sélectionnez votre destination' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>Destinations disponibles</SelectLabel>
                                                    {destinationRoutes.map((route) => (
                                                        <SelectItem key={route.id} value={route.destination_city}>
                                                            {route.destination_city}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {destinationPoints.length > 0 && (
                                        <div className='space-y-2'>
                                            <label className='text-sm font-medium'>Point précis</label>
                                            <Select
                                                onValueChange={(value) => handleEndPointSelected(parseInt(value))}
                                                disabled={isLoading}>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder="Précisez votre point d'arrivée" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectLabel>Points disponibles</SelectLabel>
                                                        {destinationPoints.map((point) => (
                                                            <SelectItem key={point.id} value={point.id.toString()}>
                                                                {point.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {selectedEndPoint && (
                                        <SelectedPointDisplay
                                            label={selectedEndPoint.label}
                                            color='red'
                                            onClear={clearEndPoint}
                                        />
                                    )}
                                </div>
                            </RouteSection>
                        )}

                        {/* Bouton d'action */}
                        {selectedStartPoint && selectedEndPoint && (
                            <div className='pt-6'>
                                <Button
                                    className='w-full bg-blue-800 py-6 hover:bg-blue-900'
                                    onClick={showRoute}
                                    disabled={isLoading}>
                                    {isLoading ? (
                                        <div className='flex items-center'>
                                            <div className='mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
                                            Chargement en cours...
                                        </div>
                                    ) : (
                                        <div className='flex items-center justify-center'>
                                            <Navigation className='mr-2 h-5 w-5' />
                                            Afficher l'itinéraire
                                        </div>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </DashboardLayout>
    );
}
