'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import DashboardLayout from '@/app/dash/layout';
import RequireAuth from '@/components/auth/require-auth';
import DashboardHeader from '@/components/layout/dashboard-header';
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
import { Input } from '@/registry/new-york-v4/ui/input';
import { Separator } from '@/registry/new-york-v4/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/new-york-v4/ui/tabs';
import { DisplayRouteResponse, LocationPoint } from '@/utils/models/route';

import {
    AlertTriangle,
    Calendar,
    Clock,
    Download,
    Eye,
    Filter,
    MoreHorizontal,
    Navigation,
    Search,
    Share2,
    Star,
    StarOff,
    Trash2,
    TrendingUp
} from 'lucide-react';

interface RouteHistoryItem {
    id: string;
    timestamp: number;
    route: any;
    name: string;
    startLocation: string;
    endLocation: string;
    isFavorite: boolean;
}

export default function EnhancedHistoryPage() {
    const router = useRouter();
    const [historyItems, setHistoryItems] = useState<RouteHistoryItem[]>([]);
    const [favorites, setFavorites] = useState<RouteHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showConfirmClear, setShowConfirmClear] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'recent' | 'favorites'>('all');

    // Charger l'historique
    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = () => {
        try {
            setLoading(true);
            const history = routeHistoryService.getHistory();
            const favs = routeHistoryService.getFavorites();

            setHistoryItems(history);
            setFavorites(favs);
        } catch (error) {
            console.error("Erreur lors du chargement de l'historique:", error);
        } finally {
            setLoading(false);
        }
    };

    // Filtrer les items en fonction de la recherche
    const filteredItems = historyItems.filter((item) => {
        // Filtrer par texte de recherche
        const matchesSearch =
            searchQuery === '' ||
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.startLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.endLocation.toLowerCase().includes(searchQuery.toLowerCase());

        // Filtrer par statut
        if (filterStatus === 'recent') {
            const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

            return matchesSearch && item.timestamp > thirtyDaysAgo;
        } else if (filterStatus === 'favorites') {
            return matchesSearch && item.isFavorite;
        }

        return matchesSearch;
    });

    // Gérer la suppression d'un élément
    const handleDelete = (id: string) => {
        setItemToDelete(id);
        setShowDeleteDialog(true);
    };

    // Confirmer la suppression d'un élément
    const confirmDelete = () => {
        if (itemToDelete) {
            routeHistoryService.removeFromHistory(itemToDelete);
            loadHistory();
            setShowDeleteDialog(false);
            setItemToDelete(null);
        }
    };

    // Basculer le statut de favori
    const toggleFavorite = (id: string) => {
        routeHistoryService.toggleFavorite(id);
        loadHistory();
    };

    // Effacer tout l'historique
    const clearAllHistory = () => {
        routeHistoryService.clearHistory();
        loadHistory();
        setShowConfirmClear(false);
    };

    // Formater la date
    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);

        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Formater l'heure
    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);

        return date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Items récents (30 derniers jours)
    const recentItems = historyItems.filter((item) => {
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

        return item.timestamp > thirtyDaysAgo;
    });

    return (
        <DashboardLayout>
            <div className='flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900'>
                <main className='container mx-auto max-w-4xl flex-1 px-4 py-8'>
                    <div className='mb-6'>
                        <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Historique des trajets</h1>
                        <p className='text-gray-600 dark:text-gray-400'>Consultez et gérez vos trajets précédents</p>
                    </div>

                    {/* Filtres et recherche */}
                    <div className='mb-6 grid gap-4 md:grid-cols-5'>
                        <div className='relative md:col-span-3'>
                            <Search className='absolute top-3 left-3 h-4 w-4 text-gray-400' />
                            <Input
                                placeholder='Rechercher un trajet...'
                                className='pl-9'
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className='md:col-span-2'>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant='outline' className='w-full justify-between'>
                                        <div className='flex items-center'>
                                            <Filter className='mr-2 h-4 w-4' />
                                            {filterStatus === 'all' && 'Tous les trajets'}
                                            {filterStatus === 'recent' && 'Trajets récents'}
                                            {filterStatus === 'favorites' && 'Trajets favoris'}
                                        </div>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                                        Tous les trajets
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setFilterStatus('recent')}>
                                        Trajets récents (30 derniers jours)
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setFilterStatus('favorites')}>
                                        Trajets favoris
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Onglets principaux */}
                    <Tabs defaultValue='list' className='mb-6'>
                        <TabsList className='grid w-full grid-cols-2'>
                            <TabsTrigger value='list'>Liste</TabsTrigger>
                            <TabsTrigger value='stats'>Statistiques</TabsTrigger>
                        </TabsList>

                        <TabsContent value='list' className='mt-6 space-y-6'>
                            {/* Favoris */}
                            {favorites.length > 0 && (
                                <div>
                                    <h2 className='mb-3 flex items-center text-lg font-semibold text-gray-900 dark:text-white'>
                                        <Star className='mr-2 h-5 w-5 text-yellow-500' />
                                        Trajets favoris
                                    </h2>

                                    <div className='space-y-3'>
                                        {favorites.map((item) => (
                                            <Card key={item.id} className='overflow-hidden'>
                                                <div className='flex flex-col p-4 md:flex-row md:items-center md:justify-between'>
                                                    <div className='mb-3 md:mb-0'>
                                                        <div className='mb-1 flex items-center'>
                                                            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                                                                {item.name}
                                                            </h3>
                                                            <Badge
                                                                variant='secondary'
                                                                className='ml-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'>
                                                                Favori
                                                            </Badge>
                                                        </div>

                                                        <div className='text-sm text-gray-500 dark:text-gray-400'>
                                                            {item.startLocation} → {item.endLocation}
                                                        </div>

                                                        <div className='mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400'>
                                                            <Calendar className='mr-1 h-3 w-3' />
                                                            <span className='mr-3'>{formatDate(item.timestamp)}</span>
                                                            <Clock className='mr-1 h-3 w-3' />
                                                            <span>{formatTime(item.timestamp)}</span>
                                                        </div>
                                                    </div>

                                                    <div className='flex space-x-2'>
                                                        <Button
                                                            variant='outline'
                                                            size='sm'
                                                            onClick={() => router.push(`/map?routeId=${item.id}`)}>
                                                            <Eye className='mr-1 h-4 w-4' />
                                                            Voir
                                                        </Button>

                                                        <Button
                                                            variant='outline'
                                                            size='sm'
                                                            onClick={() => toggleFavorite(item.id)}>
                                                            <StarOff className='mr-1 h-4 w-4' />
                                                            Retirer
                                                        </Button>

                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant='outline' size='sm'>
                                                                    <MoreHorizontal className='h-4 w-4' />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align='end'>
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        router.push(`/navigation?routeId=${item.id}`)
                                                                    }>
                                                                    <Navigation className='mr-2 h-4 w-4' />
                                                                    Naviguer
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem>
                                                                    <Share2 className='mr-2 h-4 w-4' />
                                                                    Partager
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem>
                                                                    <Download className='mr-2 h-4 w-4' />
                                                                    Exporter
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className='text-red-600 dark:text-red-400'
                                                                    onClick={() => handleDelete(item.id)}>
                                                                    <Trash2 className='mr-2 h-4 w-4' />
                                                                    Supprimer
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Liste filtrée */}
                            <div>
                                <div className='mb-3 flex items-center justify-between'>
                                    <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
                                        {filterStatus === 'all' && 'Tous les trajets'}
                                        {filterStatus === 'recent' && 'Trajets récents'}
                                        {filterStatus === 'favorites' && 'Trajets favoris'}
                                    </h2>

                                    <Button
                                        variant='outline'
                                        size='sm'
                                        className='text-red-600 dark:text-red-400'
                                        onClick={() => setShowConfirmClear(true)}>
                                        <Trash2 className='mr-2 h-4 w-4' />
                                        Effacer tout
                                    </Button>
                                </div>

                                {loading ? (
                                    <div className='flex h-40 items-center justify-center'>
                                        <div className='h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent'></div>
                                    </div>
                                ) : filteredItems.length === 0 ? (
                                    <Card className='p-8 text-center'>
                                        <AlertTriangle className='mx-auto mb-2 h-10 w-10 text-gray-400' />
                                        <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
                                            Aucun trajet trouvé
                                        </h3>
                                        <p className='mt-1 text-gray-500 dark:text-gray-400'>
                                            {searchQuery
                                                ? 'Aucun trajet ne correspond à votre recherche.'
                                                : "Vous n'avez pas encore enregistré de trajets."}
                                        </p>
                                    </Card>
                                ) : (
                                    <div className='space-y-3'>
                                        {filteredItems.map((item) => (
                                            <Card key={item.id} className='overflow-hidden'>
                                                <div className='flex flex-col p-4 md:flex-row md:items-center md:justify-between'>
                                                    <div className='mb-3 md:mb-0'>
                                                        <div className='mb-1 flex items-center'>
                                                            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                                                                {item.name}
                                                            </h3>
                                                            {item.isFavorite && (
                                                                <Badge
                                                                    variant='secondary'
                                                                    className='ml-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'>
                                                                    Favori
                                                                </Badge>
                                                            )}
                                                        </div>

                                                        <div className='text-sm text-gray-500 dark:text-gray-400'>
                                                            {item.startLocation} → {item.endLocation}
                                                        </div>

                                                        <div className='mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400'>
                                                            <Calendar className='mr-1 h-3 w-3' />
                                                            <span className='mr-3'>{formatDate(item.timestamp)}</span>
                                                            <Clock className='mr-1 h-3 w-3' />
                                                            <span>{formatTime(item.timestamp)}</span>
                                                        </div>
                                                    </div>

                                                    <div className='flex space-x-2'>
                                                        <Button
                                                            variant='outline'
                                                            size='sm'
                                                            onClick={() => router.push(`/map?routeId=${item.id}`)}>
                                                            <Eye className='mr-1 h-4 w-4' />
                                                            Voir
                                                        </Button>

                                                        <Button
                                                            variant='outline'
                                                            size='sm'
                                                            onClick={() => toggleFavorite(item.id)}>
                                                            {item.isFavorite ? (
                                                                <>
                                                                    <StarOff className='mr-1 h-4 w-4' />
                                                                    Retirer
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Star className='mr-1 h-4 w-4' />
                                                                    Favori
                                                                </>
                                                            )}
                                                        </Button>

                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant='outline' size='sm'>
                                                                    <MoreHorizontal className='h-4 w-4' />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align='end'>
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        router.push(`/navigation?routeId=${item.id}`)
                                                                    }>
                                                                    <Navigation className='mr-2 h-4 w-4' />
                                                                    Naviguer
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem>
                                                                    <Share2 className='mr-2 h-4 w-4' />
                                                                    Partager
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem>
                                                                    <Download className='mr-2 h-4 w-4' />
                                                                    Exporter
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className='text-red-600 dark:text-red-400'
                                                                    onClick={() => handleDelete(item.id)}>
                                                                    <Trash2 className='mr-2 h-4 w-4' />
                                                                    Supprimer
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value='stats' className='mt-6'>
                            <Card className='p-6'>
                                <h2 className='mb-4 text-lg font-semibold text-gray-900 dark:text-white'>
                                    Statistiques d'utilisation
                                </h2>

                                <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-3'>
                                    <div className='rounded-lg border bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950'>
                                        <div className='text-sm text-blue-700 dark:text-blue-300'>
                                            Total des trajets
                                        </div>
                                        <div className='text-3xl font-bold text-blue-900 dark:text-blue-100'>
                                            {historyItems.length}
                                        </div>
                                    </div>

                                    <div className='rounded-lg border bg-green-50 p-4 dark:border-green-800 dark:bg-green-950'>
                                        <div className='text-sm text-green-700 dark:text-green-300'>
                                            Trajets récents
                                        </div>
                                        <div className='text-3xl font-bold text-green-900 dark:text-green-100'>
                                            {recentItems.length}
                                        </div>
                                    </div>

                                    <div className='rounded-lg border bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950'>
                                        <div className='text-sm text-yellow-700 dark:text-yellow-300'>
                                            Trajets favoris
                                        </div>
                                        <div className='text-3xl font-bold text-yellow-900 dark:text-yellow-100'>
                                            {favorites.length}
                                        </div>
                                    </div>
                                </div>

                                <Separator className='my-6' />

                                <div className='text-center'>
                                    <p className='mb-4 text-gray-600 dark:text-gray-400'>
                                        Visualisation des données statistiques en cours de développement.
                                    </p>

                                    <div className='flex items-center justify-center'>
                                        <TrendingUp className='h-24 w-24 text-gray-300 dark:text-gray-700' />
                                    </div>
                                </div>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </main>

                {/* Dialog de confirmation pour effacer tout l'historique */}
                <Dialog open={showConfirmClear} onOpenChange={setShowConfirmClear}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Effacer tout l'historique</DialogTitle>
                            <DialogDescription>
                                Êtes-vous sûr de vouloir effacer tout votre historique de trajets ? Cette action ne peut
                                pas être annulée.
                            </DialogDescription>
                        </DialogHeader>

                        <DialogFooter>
                            <Button variant='outline' onClick={() => setShowConfirmClear(false)}>
                                Annuler
                            </Button>
                            <Button variant='destructive' onClick={clearAllHistory}>
                                Effacer tout l'historique
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Dialog de confirmation pour supprimer un trajet */}
                <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Supprimer ce trajet</DialogTitle>
                            <DialogDescription>
                                Êtes-vous sûr de vouloir supprimer ce trajet de votre historique ? Cette action ne peut
                                pas être annulée.
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
        </DashboardLayout>
    );
}
