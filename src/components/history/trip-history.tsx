'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { config } from '@/lib/api/config';
import { routeHistoryService } from '@/lib/services/history-service';
import { Badge } from '@/registry/new-york-v4/ui/badge';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Card } from '@/registry/new-york-v4/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/registry/new-york-v4/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/registry/new-york-v4/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/new-york-v4/ui/tabs';
import { DisplayRouteResponse } from '@/utils/models/route';

import {
    AlertTriangle,
    Calendar,
    Clock,
    Download,
    ExternalLink,
    Flag,
    MapPin,
    MoreHorizontal,
    Navigation,
    Share2,
    Star,
    ThumbsUp,
    Trash2,
    Trophy,
    User,
    Zap
} from 'lucide-react';

export default function TripSummary({
    routeId,
    onClose,
    tripStats
}: {
    routeId: string;
    onClose: () => void;
    tripStats: {
        avgSpeed: number;
        maxSpeed: number;
        risksAvoided: number;
        startTime: Date | null;
        endTime?: Date;
        pauseTime: number;
    };
}) {
    const router = useRouter();
    const [routeData, setRouteData] = useState<DisplayRouteResponse | null>(null);
    const [showShareDialog, setShowShareDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Charger les données de l'itinéraire
    useEffect(() => {
        const data = routeHistoryService.getRoute('route_1742648102885');
        console.log('-0--0-0-0-009-0-0-0', data);
        if (data) {
            setRouteData(data);
        }
    }, [routeId]);

    // Formatter la durée
    const formatDuration = (milliseconds: number) => {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}h ${minutes % 60}min`;
        } else {
            return `${minutes}min ${seconds % 60}s`;
        }
    };

    // Calculer la durée du trajet
    const calculateDuration = () => {
        if (!tripStats?.startTime || !tripStats?.endTime) return 'N/A';

        const durationMs = tripStats?.endTime?.getTime() - tripStats?.startTime?.getTime() - tripStats?.pauseTime;

        return formatDuration(durationMs);
    };

    // Gérer le téléchargement du résumé
    const handleDownload = () => {
        // Logique pour télécharger le résumé en PDF ou autre format
        console.log('Téléchargement du résumé');
    };

    // Gérer le partage
    const handleShare = () => {
        setShowShareDialog(true);
    };

    // Gérer la suppression
    const handleDelete = () => {
        setShowDeleteDialog(true);
    };

    // Confirmer la suppression
    const confirmDelete = () => {
        if (routeId) {
            routeHistoryService.removeFromHistory(routeId);
            setShowDeleteDialog(false);
            router.push('/history');
        }
    };

    // Transformer en favori
    const toggleFavorite = () => {
        if (routeId) {
            routeHistoryService.toggleFavorite(routeId);
        }
    };

    if (!routeData) {
        return (
            <div className='flex h-full items-center justify-center'>
                <div className='h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent'></div>
            </div>
        );
    }

    return (
        <div className='h-[calc(100vh-80px)] overflow-y-auto pb-6'>
            {/* En-tête */}
            <div className='mb-6 text-center'>
                <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Résumé de trajet</h1>
                <p className='text-gray-600 dark:text-gray-400'>{routeData.route?.label || 'Trajet terminé'}</p>
            </div>

            {/* Carte de statistiques principales */}
            <Card className='mb-6 overflow-hidden'>
                <div className='bg-blue-800 p-4 text-white dark:bg-blue-900'>
                    <div className='mb-2 flex items-center justify-between'>
                        <h2 className='text-lg font-semibold'>Statistiques du trajet</h2>
                        <Badge variant='secondary' className='bg-blue-700'>
                            {tripStats?.startTime?.toLocaleDateString()}
                        </Badge>
                    </div>
                    <p className='text-sm text-blue-100'>
                        {routeData?.locations?.[0]?.risk_label} →{' '}
                        {routeData?.locations?.[routeData?.locations?.length - 1]?.risk_label}
                    </p>
                </div>

                <div className='grid grid-cols-2 gap-4 p-4 md:grid-cols-4'>
                    <div className='text-center'>
                        <div className='text-2xl font-bold text-gray-900 dark:text-white'>{calculateDuration()}</div>
                        <div className='text-sm text-gray-500 dark:text-gray-400'>Durée</div>
                    </div>

                    <div className='text-center'>
                        <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                            {tripStats?.avgSpeed?.toFixed(1)}
                        </div>
                        <div className='text-sm text-gray-500 dark:text-gray-400'>Vitesse moy. (km/h)</div>
                    </div>

                    <div className='text-center'>
                        <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                            {tripStats?.risksAvoided}
                        </div>
                        <div className='text-sm text-gray-500 dark:text-gray-400'>Risques évités</div>
                    </div>

                    <div className='text-center'>
                        <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                            {tripStats?.maxSpeed?.toFixed(0)}
                        </div>
                        <div className='text-sm text-gray-500 dark:text-gray-400'>Vitesse max (km/h)</div>
                    </div>
                </div>
            </Card>

            {/* Onglets d'information */}
            <Tabs defaultValue='summary' className='mb-6'>
                <TabsList className='grid w-full grid-cols-3'>
                    <TabsTrigger value='summary'>Résumé</TabsTrigger>
                    <TabsTrigger value='risks'>Risques</TabsTrigger>
                    <TabsTrigger value='map'>Carte</TabsTrigger>
                </TabsList>

                <TabsContent value='summary' className='mt-4'>
                    <Card className='p-4'>
                        <h3 className='mb-3 text-lg font-medium'>Détails du trajet</h3>

                        <div className='space-y-2'>
                            <div className='flex justify-between border-b border-gray-200 pb-2 dark:border-gray-700'>
                                <span className='text-gray-600 dark:text-gray-400'>Départ:</span>
                                <span className='font-medium text-gray-900 dark:text-white'>
                                    {tripStats?.startTime?.toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>

                            <div className='flex justify-between border-b border-gray-200 pb-2 dark:border-gray-700'>
                                <span className='text-gray-600 dark:text-gray-400'>Arrivée:</span>
                                <span className='font-medium text-gray-900 dark:text-white'>
                                    {tripStats?.endTime?.toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>

                            <div className='flex justify-between border-b border-gray-200 pb-2 dark:border-gray-700'>
                                <span className='text-gray-600 dark:text-gray-400'>Trajet:</span>
                                <span className='font-medium text-gray-900 dark:text-white'>
                                    {routeData?.route?.label}
                                </span>
                            </div>

                            <div className='flex justify-between border-b border-gray-200 pb-2 dark:border-gray-700'>
                                <span className='text-gray-600 dark:text-gray-400'>Chauffeur:</span>
                                <span className='font-medium text-gray-900 dark:text-white'>Jean Dupont</span>
                            </div>

                            <div className='flex justify-between pb-2'>
                                <span className='text-gray-600 dark:text-gray-400'>Points de risque:</span>
                                <span className='font-medium text-gray-900 dark:text-white'>
                                    {routeData?.risks?.reduce((acc, risk) => acc + (risk.count || 0), 0) || 0}
                                </span>
                            </div>
                        </div>

                        {/* Commentaires et observations */}
                        <div className='mt-4'>
                            <h4 className='mb-2 text-sm font-medium text-gray-600 dark:text-gray-400'>
                                Observations post-trajet
                            </h4>
                            <p className='rounded-md bg-gray-50 p-3 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300'>
                                {routeData?.route?.after_trip_observation ||
                                    "Aucune observation pour ce trajet. Vous pouvez ajouter des commentaires à propos de l'état des routes, des nouveaux risques ou d'autres remarques importantes."}
                            </p>
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value='risks' className='mt-4'>
                    <Card className='p-4'>
                        <h3 className='mb-3 text-lg font-medium'>Risques sur l'itinéraire</h3>

                        <div className='space-y-3'>
                            {routeData?.risks?.map((risk, index) => (
                                <div key={index} className='flex items-start rounded-lg border p-3'>
                                    <div className='mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-900'>
                                        {risk.risk_type_icon ? (
                                            <img
                                                src={`${config.api.iconUrl}${risk.risk_type_icon}`}
                                                alt={risk.risk_type_label || 'Risque'}
                                                className='h-6 w-6'
                                            />
                                        ) : (
                                            <AlertTriangle className='h-6 w-6 text-orange-600 dark:text-orange-400' />
                                        )}
                                    </div>
                                    <div>
                                        <div className='font-medium text-gray-900 dark:text-white'>
                                            {risk.risk_type_label || 'Type de risque'}
                                        </div>
                                        <div className='mt-1 flex space-x-2'>
                                            <Badge
                                                variant='outline'
                                                className='bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300'>
                                                {risk.count} point{risk.count !== 1 ? 's' : ''}
                                            </Badge>
                                            {risk.risk_type_speed && (
                                                <Badge
                                                    variant='outline'
                                                    className='bg-orange-50 text-orange-700 dark:bg-orange-900 dark:text-orange-300'>
                                                    Max {risk.risk_type_speed} km/h
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value='map' className='mt-4'>
                    <Card className='overflow-hidden'>
                        <div className='h-64 bg-gray-200 dark:bg-gray-700'>
                            <div className='flex h-full items-center justify-center'>
                                <p className='text-gray-600 dark:text-gray-400'>
                                    Carte statique de l'itinéraire (à implémenter)
                                </p>
                            </div>
                        </div>
                        <div className='p-4'>
                            <h3 className='mb-2 text-lg font-medium'>Vue de l'itinéraire</h3>
                            <div className='mb-3 flex justify-between'>
                                <div className='flex items-center'>
                                    <MapPin className='mr-1 h-4 w-4 text-green-600' />
                                    <span className='text-sm text-gray-600 dark:text-gray-400'>
                                        {routeData.locations?.[0]?.risk_label}
                                    </span>
                                </div>
                                <div className='flex items-center'>
                                    <Flag className='mr-1 h-4 w-4 text-red-600' />
                                    <span className='text-sm text-gray-600 dark:text-gray-400'>
                                        {routeData.locations?.[routeData.locations.length - 1]?.risk_label}
                                    </span>
                                </div>
                            </div>

                            <Button
                                variant='outline'
                                className='w-full'
                                onClick={() => router.push(`/map?routeId=${routeId}`)}>
                                <ExternalLink className='mr-2 h-4 w-4' />
                                Voir l'itinéraire complet
                            </Button>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Badges et réalisations */}
            <Card className='mb-6 p-4'>
                <h3 className='mb-3 text-lg font-medium'>Réalisations</h3>

                <div className='flex flex-wrap gap-3'>
                    <div className='flex items-center rounded-lg border border-green-100 bg-green-50 px-3 py-2 dark:border-green-900 dark:bg-green-950'>
                        <div className='mr-2 rounded-full bg-green-200 p-1 dark:bg-green-800'>
                            <Trophy className='h-4 w-4 text-green-700 dark:text-green-300' />
                        </div>
                        <span className='text-sm text-green-800 dark:text-green-300'>Trajet complet</span>
                    </div>

                    {tripStats?.risksAvoided > 0 && (
                        <div className='flex items-center rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 dark:border-blue-900 dark:bg-blue-950'>
                            <div className='mr-2 rounded-full bg-blue-200 p-1 dark:bg-blue-800'>
                                <ThumbsUp className='h-4 w-4 text-blue-700 dark:text-blue-300' />
                            </div>
                            <span className='text-sm text-blue-800 dark:text-blue-300'>
                                {tripStats?.risksAvoided} risques évités
                            </span>
                        </div>
                    )}

                    {tripStats?.maxSpeed < 90 && (
                        <div className='flex items-center rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 dark:border-indigo-900 dark:bg-indigo-950'>
                            <div className='mr-2 rounded-full bg-indigo-200 p-1 dark:bg-indigo-800'>
                                <Zap className='h-4 w-4 text-indigo-700 dark:text-indigo-300' />
                            </div>
                            <span className='text-sm text-indigo-800 dark:text-indigo-300'>Conduite économique</span>
                        </div>
                    )}
                </div>
            </Card>

            {/* Actions */}
            <div className='flex justify-between gap-2'>
                <Button variant='outline' className='flex-1' onClick={toggleFavorite}>
                    <Star className='mr-2 h-4 w-4' />
                    Favori
                </Button>

                <Button variant='outline' className='flex-1' onClick={handleShare}>
                    <Share2 className='mr-2 h-4 w-4' />
                    Partager
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant='outline' size='icon'>
                            <MoreHorizontal className='h-4 w-4' />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                        <DropdownMenuItem onClick={handleDownload}>
                            <Download className='mr-2 h-4 w-4' />
                            Exporter PDF
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleDelete} className='text-red-600 dark:text-red-400'>
                            <Trash2 className='mr-2 h-4 w-4' />
                            Supprimer
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Bouton de fermeture */}
            <div className='mt-6 flex justify-center'>
                <Button variant='secondary' onClick={onClose}>
                    Fermer le résumé
                </Button>
            </div>

            {/* Dialog de partage */}
            <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Partager le résumé de trajet</DialogTitle>
                        <DialogDescription>Partagez ce trajet avec vos collègues ou superviseurs</DialogDescription>
                    </DialogHeader>

                    <div className='space-y-4'>
                        <div className='rounded-md bg-gray-50 p-3 dark:bg-gray-800'>
                            <p className='text-sm break-all text-gray-800 dark:text-gray-200'>
                                {config.domaine.namespace}/share/{routeId}
                            </p>
                        </div>

                        <div className='space-y-2'>
                            <label className='text-sm font-medium'>Envoyer par email</label>
                            <input
                                type='email'
                                placeholder='Email du destinataire'
                                className='w-full rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-800'
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant='outline' onClick={() => setShowShareDialog(false)}>
                            Annuler
                        </Button>
                        <Button>Partager</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog de suppression */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Supprimer le trajet</DialogTitle>
                        <DialogDescription>
                            Êtes-vous sûr de vouloir supprimer ce trajet de votre historique ? Cette action ne peut pas
                            être annulée.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button variant='outline' onClick={() => setShowDeleteDialog(false)}>
                            Annuler
                        </Button>
                        <Button variant='destructive' onClick={confirmDelete}>
                            Supprimer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
