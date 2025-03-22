// components/map/route-directions.tsx
'use client';

import { useEffect, useState } from 'react';

import { GeoPoint, Risk } from '@/lib/mapbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/registry/new-york-v4/ui/accordion';
import { Badge } from '@/registry/new-york-v4/ui/badge';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent } from '@/registry/new-york-v4/ui/card';

import { motion } from 'framer-motion';
import {
    AlertTriangle,
    Car,
    ChevronDown,
    ChevronRight,
    ChevronUp,
    Clock,
    MapPin,
    Navigation,
    Ruler
} from 'lucide-react';

// components/map/route-directions.tsx

// components/map/route-directions.tsx

interface RouteStep {
    instruction: string;
    distance: number;
    duration: number;
    maneuver: string;
}

interface Route {
    distance: number;
    duration: number;
    steps: RouteStep[];
}

interface RouteDirectionsProps {
    startLocation: string;
    endLocation: string;
    route?: Route;
    isLoading?: boolean;
    risks?: Risk[];
    onStartNavigation?: () => void;
    onClose?: () => void;
}

export default function RouteDirections({
    startLocation,
    endLocation,
    route,
    isLoading = false,
    risks = [],
    onStartNavigation,
    onClose
}: RouteDirectionsProps) {
    const [showAllSteps, setShowAllSteps] = useState(false);
    const [expandedStep, setExpandedStep] = useState<number | null>(null);

    // Format distance (mètres -> km)
    const formatDistance = (meters: number): string => {
        if (meters < 1000) {
            return `${meters.toFixed(0)} m`;
        }

        return `${(meters / 1000).toFixed(1)} km`;
    };

    // Format duration (secondes -> heures/minutes)
    const formatDuration = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (hours > 0) {
            return `${hours} h ${minutes} min`;
        }

        return `${minutes} min`;
    };

    // Décider quelle icône afficher pour une manœuvre
    const getManeuverIcon = (maneuver: string) => {
        // Par défaut, on retourne une flèche droite
        return <ChevronRight className='h-4 w-4' />;
    };

    // Simuler un itinéraire pour la démonstration
    const simulatedRoute: Route = {
        distance: 450000, // 450 km
        duration: 16200, // 4h30
        steps: [
            {
                instruction: 'Prendre la direction nord sur Avenue des Champs-Élysées',
                distance: 1200,
                duration: 180,
                maneuver: 'depart'
            },
            {
                instruction: 'Au rond-point, prendre la 2ème sortie sur Place Charles de Gaulle',
                distance: 300,
                duration: 60,
                maneuver: 'roundabout'
            },
            {
                instruction: 'Continuer sur Avenue de la Grande Armée',
                distance: 1500,
                duration: 240,
                maneuver: 'straight'
            },
            {
                instruction: "Prendre l'entrée vers A14 en direction de Rouen/Caen",
                distance: 800,
                duration: 120,
                maneuver: 'on ramp'
            },
            {
                instruction: 'Rejoindre A14',
                distance: 15000,
                duration: 600,
                maneuver: 'merge'
            },
            {
                instruction: 'Continuer sur A13',
                distance: 125000,
                duration: 4200,
                maneuver: 'straight'
            },
            {
                instruction: 'Prendre la sortie 27 vers Caen-Centre',
                distance: 500,
                duration: 60,
                maneuver: 'off ramp'
            },
            {
                instruction: 'Continuer sur N814',
                distance: 12000,
                duration: 600,
                maneuver: 'straight'
            },
            {
                instruction: 'Prendre la sortie vers Centre-Ville',
                distance: 400,
                duration: 60,
                maneuver: 'off ramp'
            },
            {
                instruction: 'Continuer sur Boulevard Maréchal Leclerc',
                distance: 1800,
                duration: 300,
                maneuver: 'straight'
            },
            {
                instruction: 'Tourner à droite sur Rue Saint-Jean',
                distance: 700,
                duration: 180,
                maneuver: 'turn right'
            },
            {
                instruction: 'Vous êtes arrivé à destination',
                distance: 0,
                duration: 0,
                maneuver: 'arrive'
            }
        ]
    };

    // Utiliser l'itinéraire fourni ou le simulé pour la démonstration
    const currentRoute = route || simulatedRoute;

    // Calculer le nombre d'étapes à afficher initialement
    const visibleSteps = showAllSteps ? currentRoute.steps : currentRoute.steps.slice(0, 3);

    return (
        <div className='overflow-hidden rounded-lg bg-white shadow-md'>
            <div className='border-b p-4'>
                <div className='flex items-center justify-between'>
                    <h3 className='text-lg font-semibold'>Itinéraire</h3>
                    {onClose && (
                        <Button variant='ghost' size='sm' onClick={onClose}>
                            <ChevronDown className='h-4 w-4' />
                        </Button>
                    )}
                </div>

                <div className='mt-2 space-y-1 text-sm'>
                    <div className='flex items-center'>
                        <div className='mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100'>
                            <div className='h-2 w-2 rounded-full bg-blue-600'></div>
                        </div>
                        <span className='truncate'>{startLocation}</span>
                    </div>

                    <div className='ml-3 h-4 border-l-2 border-dotted border-gray-300'></div>

                    <div className='flex items-center'>
                        <div className='mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100'>
                            <MapPin className='h-3 w-3 text-blue-600' />
                        </div>
                        <span className='truncate'>{endLocation}</span>
                    </div>
                </div>
            </div>

            <div className='bg-blue-50 p-4'>
                <div className='flex justify-between'>
                    <div className='flex items-center'>
                        <Ruler className='mr-2 h-4 w-4 text-blue-600' />
                        <span className='font-medium'>{formatDistance(currentRoute.distance)}</span>
                    </div>

                    <div className='flex items-center'>
                        <Clock className='mr-2 h-4 w-4 text-blue-600' />
                        <span className='font-medium'>{formatDuration(currentRoute.duration)}</span>
                    </div>

                    <div className='flex items-center'>
                        <Navigation className='mr-2 h-4 w-4 text-blue-600' />
                        <span className='font-medium'>{currentRoute.steps.length} étapes</span>
                    </div>
                </div>
            </div>

            {risks.length > 0 && (
                <div className='border-t border-b border-yellow-200 bg-yellow-50 p-4'>
                    <div className='mb-2 flex items-center'>
                        <AlertTriangle className='mr-2 h-4 w-4 text-yellow-600' />
                        <span className='font-medium text-yellow-800'>Risques sur votre trajet</span>
                    </div>
                    <div className='flex flex-wrap gap-2'>
                        {risks.map((risk) => (
                            <Badge key={risk.id} variant='outline' className='border-yellow-300 bg-white'>
                                {risk.type}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
