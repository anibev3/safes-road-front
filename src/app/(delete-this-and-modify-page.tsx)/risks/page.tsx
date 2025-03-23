'use client';

import { Key, useCallback, useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import DashboardLayout from '@/app/dash/layout';
import { useAuth } from '@/hooks/use-auth';
import { useGoogleMaps } from '@/hooks/use-google-maps';
import { config } from '@/lib/api/config';
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
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/registry/new-york-v4/ui/dropdown-menu';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/registry/new-york-v4/ui/select';
import { GoogleMap, InfoWindow, Marker } from '@react-google-maps/api';

import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertTriangle,
    Calendar,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Clock,
    ExternalLink,
    Eye,
    Filter,
    Image,
    Info,
    Loader2,
    MapPin,
    Navigation,
    Plus,
    RefreshCw,
    Search,
    SlidersHorizontal
} from 'lucide-react';

// Types pour TypeScript
interface City {
    id?: number;
    name?: string;
    description?: string;
}

interface Entity {
    id?: number;
    code?: string;
    name?: string;
    email?: string;
    telephone?: string;
}

interface RiskType {
    id?: number;
    code?: string;
    label?: string;
    description?: string;
    icon?: string;
}

interface RiskStatus {
    id?: number;
    code?: string;
    label?: string;
    description?: string;
}

interface RiskModel {
    id?: number;
    label?: string;
    longitude?: string;
    latitude?: string;
    distance?: string;
    photoUrl?: string;
    status?: RiskStatus;
    riskType?: RiskType;
    entity?: Entity;
    city?: City;
    createdAt?: Date;
}

// Options pour Google Maps
const libraries = ['places', 'geometry'];

export default function RisksListPage() {
    const router = useRouter();
    const { isAuthenticated, token } = useAuth();

    // États pour les données
    const [risks, setRisks] = useState<RiskModel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // États pour les filtres
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<number | null>(1); // Par défaut: actifs
    const [cityFilter, setCityFilter] = useState<number | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // États pour la carte
    const [showMap, setShowMap] = useState(false);
    const [mapCenter, setMapCenter] = useState({ lat: 5.36, lng: -4.0083 }); // Abidjan par défaut
    const [selectedMarker, setSelectedMarker] = useState<RiskModel | null>(null);

    // État pour la vue détaillée
    const [detailViewOpen, setDetailViewOpen] = useState(false);
    const [selectedRisk, setSelectedRisk] = useState<RiskModel | null>(null);

    // Chargement de l'API Google Maps
    const { isLoaded, loadError } = useGoogleMaps();

    // Chargement des risques
    const fetchRisks = useCallback(
        async (page = 1) => {
            if (!isAuthenticated || !token) return;

            setIsLoading(true);
            setHasError(false);

            try {
                // Construire les paramètres de requête
                const params = new URLSearchParams({
                    page: page.toString(),
                    ...(statusFilter !== null && { status_id: statusFilter.toString() }),
                    ...(cityFilter !== null && { city_id: cityFilter.toString() }),
                    ...(searchQuery && { search: searchQuery })
                });

                // Effectuer la requête à l'API
                const response = await fetch(`${config.api.baseUrl}/risks?${params.toString()}`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();

                // Transformer les données en modèles
                const transformedRisks = data.data.map((item: any) => ({
                    id: item.id,
                    label: item.label,
                    longitude: item.longitude?.toString(),
                    latitude: item.latitude?.toString(),
                    distance: item.distance?.toString(),
                    photoUrl: item.photo,
                    status: item.status,
                    riskType: item.risk_type,
                    entity: item.entity,
                    city: item.city,
                    createdAt: item.created_at ? new Date(item.created_at) : undefined
                }));

                setRisks(transformedRisks);
                setCurrentPage(data.meta.current_page);
                setTotalPages(data.meta.last_page);
            } catch (error) {
                console.error('Erreur lors du chargement des risques:', error);
                setHasError(true);
            } finally {
                setIsLoading(false);
            }
        },
        [isAuthenticated, token, statusFilter, cityFilter, searchQuery]
    );

    // Charger les risques au montage et quand les filtres changent
    useEffect(() => {
        fetchRisks(currentPage);
    }, [fetchRisks, currentPage]);

    // Vérifier l'authentification
    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/auth/login?redirect=/risks');
        }
    }, [isAuthenticated, router]);

    // Fonction pour afficher la vue carte
    const showMapView = () => {
        setShowMap(true);

        // Centrer la carte sur le premier risque ou utiliser la position par défaut
        if (risks.length > 0 && risks[0].latitude && risks[0].longitude) {
            setMapCenter({
                lat: parseFloat(risks[0].latitude),
                lng: parseFloat(risks[0].longitude)
            });
        }
    };

    // Fonction pour voir les détails d'un risque
    const viewRiskDetails = (risk: RiskModel) => {
        setSelectedRisk(risk);
        setDetailViewOpen(true);
    };

    // Formatage de la date
    const formatDate = (date?: Date) => {
        if (!date) return 'Date inconnue';

        return new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    // Obtenir la couleur correspondant au statut
    const getStatusColor = (code?: string) => {
        switch (code) {
            case 'active':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
            case 'done':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    // Obtenir l'icône correspondant au statut
    const getStatusIcon = (code?: string) => {
        switch (code) {
            case 'active':
                return <AlertTriangle className='mr-1 h-3.5 w-3.5' />;
            case 'done':
                return <CheckCircle className='mr-1 h-3.5 w-3.5' />;
            default:
                return <Info className='mr-1 h-3.5 w-3.5' />;
        }
    };

    // Obtenir la couleur de marqueur pour Google Maps
    const getMarkerColor = (statusCode?: string) => {
        switch (statusCode) {
            case 'active':
                return 120; // Orange (BitmapDescriptor.hueOrange)
            case 'done':
                return 80; // Vert (BitmapDescriptor.hueGreen)
            default:
                return 0; // Rouge (BitmapDescriptor.hueRed)
        }
    };

    return (
        <DashboardLayout>
            <div className='container mx-auto max-w-6xl px-4 pt-10 pb-20'>
                <div className='mb-6 flex flex-col justify-between md:flex-row md:items-center'>
                    <div className='mb-4 flex items-center md:mb-0'>
                        <Button variant='ghost' size='icon' className='mr-2' onClick={() => router.back()}>
                            <ChevronLeft className='h-5 w-5' />
                        </Button>
                        <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Risques Routiers</h1>
                    </div>

                    <div className='flex flex-wrap gap-2'>
                        <div className='relative flex-1'>
                            <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400' />
                            <Input
                                placeholder='Rechercher un risque...'
                                className='pl-9'
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        fetchRisks(1);
                                    }
                                }}
                            />
                        </div>

                        <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                            <DropdownMenuTrigger asChild>
                                <Button variant='outline' className='gap-2'>
                                    <Filter className='h-4 w-4' />
                                    <span className='hidden sm:inline'>Filtres</span>
                                    {(statusFilter || cityFilter) && (
                                        <Badge className='ml-1 h-5 w-5 rounded-full p-0' variant='secondary'>
                                            {(statusFilter ? 1 : 0) + (cityFilter ? 1 : 0)}
                                        </Badge>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end' className='w-56'>
                                <DropdownMenuLabel>Filtrer par</DropdownMenuLabel>
                                <DropdownMenuSeparator />

                                <div className='px-2 py-1.5'>
                                    <label className='text-xs font-medium'>Statut</label>
                                    <Select
                                        value={statusFilter?.toString() || ''}
                                        onValueChange={(value) => setStatusFilter(value ? parseInt(value) : null)}>
                                        <SelectTrigger className='mt-1'>
                                            <SelectValue placeholder='Tous les statuts' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value=''>Tous les statuts</SelectItem>
                                            <SelectItem value='1'>Actifs</SelectItem>
                                            <SelectItem value='2'>Résolus</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className='px-2 py-1.5'>
                                    <label className='text-xs font-medium'>Ville</label>
                                    <Select
                                        value={cityFilter?.toString() || ''}
                                        onValueChange={(value) => setCityFilter(value ? parseInt(value) : null)}>
                                        <SelectTrigger className='mt-1'>
                                            <SelectValue placeholder='Toutes les villes' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value=''>Toutes les villes</SelectItem>
                                            <SelectItem value='1'>Abidjan</SelectItem>
                                            <SelectItem value='2'>Bouaké</SelectItem>
                                            <SelectItem value='3'>Yamoussoukro</SelectItem>
                                            <SelectItem value='4'>San Pedro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <DropdownMenuSeparator />
                                <div className='flex justify-between p-2'>
                                    <Button
                                        variant='ghost'
                                        size='sm'
                                        onClick={() => {
                                            setStatusFilter(null);
                                            setCityFilter(null);
                                        }}>
                                        Réinitialiser
                                    </Button>
                                    <Button
                                        size='sm'
                                        onClick={() => {
                                            fetchRisks(1);
                                            setIsFilterOpen(false);
                                        }}>
                                        Appliquer
                                    </Button>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button variant='outline' onClick={() => setShowMap(!showMap)}>
                            {showMap ? (
                                <>
                                    <ListIcon className='mr-2 h-4 w-4' />
                                    <span className='hidden sm:inline'>Vue liste</span>
                                </>
                            ) : (
                                <>
                                    <MapPin className='mr-2 h-4 w-4' />
                                    <span className='hidden sm:inline'>Vue carte</span>
                                </>
                            )}
                        </Button>

                        <Button onClick={() => router.push('/add-risk')}>
                            <Plus className='mr-2 h-4 w-4' />
                            <span className='hidden sm:inline'>Signaler un risque</span>
                        </Button>
                    </div>
                </div>

                {/* Affichage principal */}
                <div>
                    {isLoading ? (
                        <Card className='flex h-64 items-center justify-center'>
                            <Loader2 className='h-8 w-8 animate-spin text-blue-600' />
                            <p className='mt-2 text-gray-600 dark:text-gray-400'>Chargement des risques...</p>
                        </Card>
                    ) : hasError ? (
                        <ErrorView onRetry={() => fetchRisks(currentPage)} />
                    ) : risks.length === 0 ? (
                        <EmptyView onAddNew={() => router.push('/add-risk')} />
                    ) : showMap ? (
                        <MapView
                            risks={risks}
                            isLoaded={isLoaded}
                            loadError={loadError === null}
                            center={mapCenter}
                            getMarkerColor={getMarkerColor}
                            onMarkerClick={(risk: RiskModel) => {
                                setSelectedMarker(risk);
                            }}
                            selectedMarker={selectedMarker}
                            onInfoWindowClose={() => setSelectedMarker(null)}
                            onViewDetails={viewRiskDetails}
                        />
                    ) : (
                        <ListView
                            risks={risks}
                            formatDate={formatDate}
                            getStatusColor={getStatusColor}
                            getStatusIcon={getStatusIcon}
                            onViewDetails={viewRiskDetails}
                        />
                    )}
                </div>

                {!isLoading && !hasError && risks.length > 0 && (
                    <div className='fixed right-0 bottom-20 left-0 z-10 mt-6 flex items-center justify-between rounded-t-lg px-4 py-2 shadow-md md:static md:mt-6 md:mb-0 md:rounded-none md:bg-transparent md:px-0 md:py-0 md:shadow-none dark:bg-gray-900 dark:md:bg-transparent'>
                        <Button
                            variant='outline'
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage <= 1}
                            className='text-xs md:text-sm'>
                            <ChevronLeft className='mr-1 h-4 w-4' />
                            {/* <span className='hidden sm:inline'>Précédent</span> */}
                            <span>Précédent</span>
                        </Button>

                        <span className='rounded-lg bg-indigo-200 p-2 px-2 text-xs text-gray-600 md:text-sm dark:text-gray-400'>
                            Page {currentPage} sur {totalPages}
                        </span>

                        <Button
                            variant='outline'
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage >= totalPages}
                            className='text-xs md:text-sm'>
                            {/* <span className='hidden sm:inline'>Suivant</span> */}
                            <span>Suivant</span>
                            <ChevronRight className='ml-1 h-4 w-4' />
                        </Button>
                    </div>
                )}

                {/* Dialogue de détails du risque */}
                <Dialog open={detailViewOpen} onOpenChange={setDetailViewOpen}>
                    <DialogContent className='max-w-3xl'>
                        {selectedRisk && (
                            <>
                                <DialogHeader>
                                    <DialogTitle className='text-xl'>
                                        {selectedRisk.label || 'Risque sans nom'}
                                    </DialogTitle>
                                    <DialogDescription>
                                        Détails du risque signalé le {formatDate(selectedRisk.createdAt)}
                                    </DialogDescription>
                                </DialogHeader>

                                <div className='grid grid-cols-1 gap-6 py-4 md:grid-cols-2'>
                                    {/* Photo du risque */}
                                    <div className='overflow-hidden rounded-lg border dark:border-gray-700'>
                                        {selectedRisk.photoUrl ? (
                                            <img
                                                src={`${config.api.photoUrl}${selectedRisk.photoUrl}`}
                                                alt={selectedRisk.label || 'Photo du risque'}
                                                className='h-full w-full object-cover'
                                                style={{ maxHeight: '300px' }}
                                            />
                                        ) : (
                                            <div className='flex h-full min-h-[200px] items-center justify-center bg-gray-100 dark:bg-gray-800'>
                                                <Image className='h-16 w-16 text-gray-400' />
                                                <p className='ml-2 text-gray-500 dark:text-gray-400'>
                                                    Aucune image disponible
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Informations sur le risque */}
                                    <div className='space-y-4'>
                                        {/* Statut */}
                                        <div>
                                            <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                                                Statut
                                            </h3>
                                            <Badge className={`mt-1 ${getStatusColor(selectedRisk.status?.code)}`}>
                                                {getStatusIcon(selectedRisk.status?.code)}
                                                {selectedRisk.status?.label || 'Inconnu'}
                                            </Badge>
                                        </div>

                                        {/* Position */}
                                        <div>
                                            <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                                                Position
                                            </h3>
                                            <p className='mt-1 flex items-center font-mono text-sm'>
                                                <Navigation className='mr-1 h-4 w-4 text-gray-500' />
                                                {selectedRisk.latitude && selectedRisk.longitude
                                                    ? `${parseFloat(selectedRisk.latitude).toFixed(6)}, ${parseFloat(selectedRisk.longitude).toFixed(6)}`
                                                    : 'Coordonnées non disponibles'}
                                            </p>
                                        </div>

                                        {/* Ville */}
                                        <div>
                                            <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                                                Ville
                                            </h3>
                                            <p className='mt-1'>{selectedRisk.city?.name || 'Non spécifiée'}</p>
                                        </div>

                                        {/* Type de risque */}
                                        <div>
                                            <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                                                Type de risque
                                            </h3>
                                            <p className='mt-1'>{selectedRisk.riskType?.label || 'Non spécifié'}</p>
                                        </div>

                                        {/* Date de signalement */}
                                        <div>
                                            <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                                                Date de signalement
                                            </h3>
                                            <p className='mt-1 flex items-center'>
                                                <Calendar className='mr-1 h-4 w-4 text-gray-500' />
                                                {formatDate(selectedRisk.createdAt)}
                                            </p>
                                        </div>

                                        {/* Entité */}
                                        {selectedRisk.entity && (
                                            <div>
                                                <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                                                    Signalé par
                                                </h3>
                                                <p className='mt-1'>{selectedRisk.entity.name || 'Entité inconnue'}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Mini carte */}
                                {isLoaded && selectedRisk.latitude && selectedRisk.longitude && (
                                    <div className='mt-4 h-40 overflow-hidden rounded-lg border dark:border-gray-700'>
                                        <GoogleMap
                                            mapContainerStyle={{ height: '100%', width: '100%' }}
                                            center={{
                                                lat: parseFloat(selectedRisk.latitude),
                                                lng: parseFloat(selectedRisk.longitude)
                                            }}
                                            zoom={15}
                                            options={{
                                                streetViewControl: false,
                                                mapTypeControl: false,
                                                fullscreenControl: false,
                                                zoomControl: false
                                            }}>
                                            <Marker
                                                position={{
                                                    lat: parseFloat(selectedRisk.latitude),
                                                    lng: parseFloat(selectedRisk.longitude)
                                                }}
                                            />
                                        </GoogleMap>
                                    </div>
                                )}

                                <DialogFooter className='gap-2'>
                                    <Button variant='outline' onClick={() => setDetailViewOpen(false)}>
                                        Fermer
                                    </Button>
                                    {selectedRisk.latitude && selectedRisk.longitude && (
                                        <Button
                                            onClick={() => {
                                                const url = `https://www.google.com/maps/search/?api=1&query=${selectedRisk.latitude},${selectedRisk.longitude}`;
                                                window.open(url, '_blank');
                                            }}>
                                            <ExternalLink className='mr-2 h-4 w-4' />
                                            Voir dans Google Maps
                                        </Button>
                                    )}
                                </DialogFooter>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}

// Composant de vue carte
function MapView({
    risks,
    isLoaded,
    loadError,
    center,
    getMarkerColor,
    onMarkerClick,
    selectedMarker,
    onInfoWindowClose,
    onViewDetails
}: {
    risks: any;
    isLoaded: boolean;
    loadError: boolean;
    center: any;
    getMarkerColor: any;
    onMarkerClick: any;
    selectedMarker: any;
    onInfoWindowClose: any;
    onViewDetails: any;
}) {
    if (loadError) {
        return (
            <div className='rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-900/20'>
                <AlertTriangle className='mx-auto h-10 w-10 text-red-500' />
                <h2 className='mt-4 text-lg font-medium text-red-800 dark:text-red-300'>
                    Erreur de chargement de la carte
                </h2>
                <p className='mt-2 text-red-700 dark:text-red-400'>
                    Impossible de charger Google Maps. Veuillez vérifier votre connexion et réessayer.
                </p>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className='flex h-64 items-center justify-center rounded-lg border'>
                <Loader2 className='h-8 w-8 animate-spin text-blue-600' />
                <p className='ml-2 text-gray-600'>Chargement de la carte...</p>
            </div>
        );
    }

    return (
        <div className='h-[600px] overflow-hidden rounded-lg border dark:border-gray-700'>
            <GoogleMap
                mapContainerStyle={{ height: '100%', width: '100%' }}
                center={center}
                zoom={12}
                options={{
                    streetViewControl: false,
                    mapTypeControl: true,
                    fullscreenControl: true
                }}>
                {risks.map(
                    (risk: {
                        latitude: string;
                        longitude: string;
                        id: Key | null | undefined;
                        status: { code: any };
                    }) => {
                        if (!risk.latitude || !risk.longitude) return null;

                        const position = {
                            lat: parseFloat(risk.latitude),
                            lng: parseFloat(risk.longitude)
                        };

                        return (
                            <Marker
                                key={risk.id}
                                position={position}
                                icon={{
                                    path: google.maps.SymbolPath.CIRCLE,
                                    fillColor: `hsl(${getMarkerColor(risk.status?.code)}, 90%, 55%)`,
                                    fillOpacity: 0.9,
                                    strokeWeight: 2,
                                    strokeColor: '#ffffff',
                                    scale: 8
                                }}
                                onClick={() => onMarkerClick(risk)}
                            />
                        );
                    }
                )}

                {selectedMarker && selectedMarker.latitude && selectedMarker.longitude && (
                    <InfoWindow
                        position={{
                            lat: parseFloat(selectedMarker.latitude),
                            lng: parseFloat(selectedMarker.longitude)
                        }}
                        onCloseClick={onInfoWindowClose}>
                        <div className='max-w-xs'>
                            <h3 className='mb-1 font-medium'>{selectedMarker.label || 'Risque non identifié'}</h3>
                            <p className='mb-2 text-sm text-gray-600'>
                                {selectedMarker.city?.name || 'Emplacement inconnu'}
                            </p>
                            <Button size='sm' className='w-full' onClick={() => onViewDetails(selectedMarker)}>
                                <Eye className='mr-1 h-3.5 w-3.5' />
                                Voir les détails
                            </Button>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </div>
    );
}

// Composant de vue liste
function ListView({
    risks,
    formatDate,
    getStatusColor,
    getStatusIcon,
    onViewDetails
}: {
    risks: any;
    formatDate: any;
    getStatusColor: any;
    getStatusIcon: any;
    onViewDetails: any;
}) {
    return (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {risks.map(
                (risk: {
                    id: Key | null | undefined;
                    photoUrl: any;
                    label: any;
                    status: { code: any; label: any };
                    city: { name: any };
                    createdAt: any;
                }) => (
                    <motion.div
                        key={risk.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}>
                        <Card className='overflow-hidden hover:shadow-md'>
                            <div className='relative h-48 bg-gray-100 dark:bg-gray-800'>
                                {risk.photoUrl ? (
                                    <img
                                        src={`${config.api.photoUrl}${risk.photoUrl}`}
                                        alt={risk.label || 'Photo du risque'}
                                        className='h-full w-full object-cover'
                                    />
                                ) : (
                                    <div className='flex h-full items-center justify-center'>
                                        <Image className='h-16 w-16 text-gray-400' />
                                    </div>
                                )}

                                {/* Badge de statut */}
                                <Badge className={`absolute top-2 right-2 ${getStatusColor(risk.status?.code)}`}>
                                    {getStatusIcon(risk.status?.code)}
                                    {risk.status?.label || 'Inconnu'}
                                </Badge>
                            </div>

                            <div className='p-4'>
                                <h3 className='mb-1 text-lg font-medium text-gray-900 dark:text-white'>
                                    {risk.label || 'Risque non identifié'}
                                </h3>

                                <div className='mb-3 text-sm text-gray-500 dark:text-gray-400'>
                                    <div className='flex items-center'>
                                        <MapPin className='mr-1 h-4 w-4' />
                                        <span>{risk.city?.name || 'Emplacement inconnu'}</span>
                                    </div>
                                    <div className='mt-1 flex items-center'>
                                        <Clock className='mr-1 h-4 w-4' />
                                        <span>{formatDate(risk.createdAt)}</span>
                                    </div>
                                </div>

                                <Button className='w-full' variant='outline' onClick={() => onViewDetails(risk)}>
                                    <Eye className='mr-1 h-4 w-4' />
                                    Voir les détails
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                )
            )}
        </div>
    );
}

// Composant pour l'état vide
function EmptyView({ onAddNew }: { onAddNew: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 p-12 text-center dark:border-gray-700'>
            <div className='mb-4 rounded-full bg-gray-100 p-6 dark:bg-gray-800'>
                <AlertTriangle className='h-12 w-12 text-gray-400 dark:text-gray-500' />
            </div>
            <h2 className='mb-2 text-xl font-semibold text-gray-900 dark:text-white'>Aucun risque signalé</h2>
            <p className='mb-6 max-w-md text-gray-500 dark:text-gray-400'>
                Il n'y a actuellement aucun risque signalé correspondant à vos critères. Soyez le premier à signaler un
                risque pour aider les autres conducteurs.
            </p>
            <Button onClick={onAddNew}>
                <Plus className='mr-2 h-4 w-4' />
                Signaler un risque
            </Button>
        </motion.div>
    );
}

// Composant pour l'état d'erreur
function ErrorView({ onRetry }: { onRetry: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-12 text-center dark:border-red-900 dark:bg-red-900/20'>
            <div className='mb-4 rounded-full bg-red-100 p-4 dark:bg-red-900/50'>
                <AlertTriangle className='h-10 w-10 text-red-600 dark:text-red-400' />
            </div>
            <h2 className='mb-2 text-xl font-semibold text-red-800 dark:text-red-300'>Erreur de chargement</h2>
            <p className='mb-6 max-w-md text-red-700 dark:text-red-400'>
                Une erreur est survenue lors du chargement des risques. Veuillez vérifier votre connexion et réessayer.
            </p>
            <Button onClick={onRetry}>
                <RefreshCw className='mr-2 h-4 w-4' />
                Réessayer
            </Button>
        </motion.div>
    );
}

// Icônes supplémentaires
const CheckCircle = ({ className }: { className: string }) => (
    <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        className={className}>
        <path d='M22 11.08V12a10 10 0 1 1-5.93-9.14'></path>
        <polyline points='22 4 12 14.01 9 11.01'></polyline>
    </svg>
);

const ListIcon = ({ className }: { className: string }) => (
    <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        className={className}>
        <line x1='8' y1='6' x2='21' y2='6'></line>
        <line x1='8' y1='12' x2='21' y2='12'></line>
        <line x1='8' y1='18' x2='21' y2='18'></line>
        <line x1='3' y1='6' x2='3.01' y2='6'></line>
        <line x1='3' y1='12' x2='3.01' y2='12'></line>
        <line x1='3' y1='18' x2='3.01' y2='18'></line>
    </svg>
);
