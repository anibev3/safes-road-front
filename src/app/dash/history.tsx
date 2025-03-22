// app/(dashboard)/history/page.tsx
'use client';

import { SetStateAction, useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import DashboardHeader from '@/components/layout/dashboard-header';
import { routeHistoryService } from '@/lib/services/history-service';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@/registry/new-york-v4/ui/alert-dialog';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/registry/new-york-v4/ui/dialog';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/registry/new-york-v4/ui/tabs';
import { HistoryItem } from '@/types/history';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowRight, Calendar, Clock, Info, Map, Navigation, Plus, Search, Star, Trash2 } from 'lucide-react';

// app/(dashboard)/history/page.tsx

// app/(dashboard)/history/page.tsx

// app/(dashboard)/history/page.tsx

// app/(dashboard)/history/page.tsx

// app/(dashboard)/history/page.tsx

// app/(dashboard)/history/page.tsx

// app/(dashboard)/history/page.tsx

// app/(dashboard)/history/page.tsx

// app/(dashboard)/history/page.tsx

// app/(dashboard)/history/page.tsx

// app/(dashboard)/history/page.tsx

export default function HistoryPage() {
    const router = useRouter();
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmClearAll, setConfirmClearAll] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');

    // Charger l'historique
    useEffect(() => {
        const loadHistory = () => {
            const historyData = routeHistoryService.getHistory();
            setHistory(historyData);
        };

        loadHistory();

        // Recharger l'historique si la fenêtre reprend le focus
        window.addEventListener('focus', loadHistory);

        return () => window.removeEventListener('focus', loadHistory);
    }, []);

    // Filtrer selon l'onglet actif et le terme de recherche
    const filteredHistory = history.filter(
        (item) =>
            (activeTab === 'all' || (activeTab === 'favorites' && item.isFavorite)) &&
            (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.startLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.endLocation.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Ouvrir un itinéraire
    const openRoute = (routeId: string) => {
        router.push(`/map?routeId=${routeId}`);
    };

    // Supprimer un itinéraire
    const deleteRoute = (routeId: string) => {
        routeHistoryService.removeFromHistory(routeId);
        setHistory((prev) => prev.filter((item) => item.id !== routeId));
        setItemToDelete(null);
    };

    // Effacer tout l'historique
    const clearAllHistory = () => {
        routeHistoryService.clearHistory();
        setHistory([]);
        setConfirmClearAll(false);
    };

    // Formater la date
    const formatDate = (timestamp: number) => {
        return format(new Date(timestamp), 'PPP', { locale: fr });
    };

    // Formater l'heure
    const formatTime = (timestamp: number) => {
        return format(new Date(timestamp), 'p', { locale: fr });
    };

    return (
        <div className='flex min-h-screen flex-col bg-gray-50'>
            <main className='container mx-auto max-w-5xl flex-1 px-4 py-8'>
                {/* En-tête de la page */}
                <div className='mb-8 flex flex-col md:flex-row md:items-center md:justify-between'>
                    <div>
                        <h1 className='mb-2 text-2xl font-bold text-blue-900'>Historique des itinéraires</h1>
                        <p className='text-sm text-gray-600'>Retrouvez ici tous vos itinéraires précédents</p>
                    </div>

                    <div className='mt-4 flex flex-col gap-3 sm:flex-row md:mt-0'>
                        <Button
                            variant='outline'
                            className='flex items-center'
                            onClick={() => router.push('/route-selection')}>
                            <Plus className='mr-2 h-4 w-4' />
                            Nouvel itinéraire
                        </Button>

                        <AlertDialog open={confirmClearAll} onOpenChange={setConfirmClearAll}>
                            <AlertDialogTrigger asChild>
                                <Button variant='destructive' className='flex items-center'>
                                    <Trash2 className='mr-2 h-4 w-4' />
                                    Effacer tout
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Cette action ne peut pas être annulée. Tous vos itinéraires sauvegardés seront
                                        définitivement supprimés.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction onClick={clearAllHistory}>Confirmer</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
                <div className='mb-6'>
                    <Tabs defaultValue='all' onValueChange={(value) => setActiveTab(value as 'all' | 'favorites')}>
                        <TabsList className='mb-4'>
                            <TabsTrigger value='all' className='flex items-center'>
                                <Map className='mr-2 h-4 w-4' />
                                Tous les itinéraires
                            </TabsTrigger>
                            <TabsTrigger value='favorites' className='flex items-center'>
                                <Star className='mr-2 h-4 w-4' />
                                Favoris
                            </TabsTrigger>
                        </TabsList>

                        <div className='relative'>
                            <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                            <Input
                                placeholder='Rechercher un itinéraire...'
                                className='pl-10'
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </Tabs>
                </div>
                {/* Barre de recherche */}
                <div className='mb-6'>
                    <div className='relative'>
                        <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                        <Input
                            placeholder='Rechercher un itinéraire...'
                            className='pl-10'
                            value={searchTerm}
                            onChange={(e: { target: { value: SetStateAction<string> } }) =>
                                setSearchTerm(e.target.value)
                            }
                        />
                    </div>
                </div>

                {/* Liste des itinéraires */}
                {filteredHistory.length === 0 ? (
                    <div className='py-12 text-center'>
                        <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100'>
                            <Map className='h-8 w-8 text-gray-400' />
                        </div>
                        <h3 className='mb-2 text-lg font-medium text-gray-900'>Aucun itinéraire trouvé</h3>
                        <p className='mx-auto max-w-md text-gray-600'>
                            {searchTerm
                                ? 'Aucun itinéraire ne correspond à votre recherche.'
                                : "Vous n'avez pas encore d'itinéraires enregistrés. Créez votre premier itinéraire pour l'ajouter à votre historique."}
                        </p>
                        {!searchTerm && (
                            <Button className='mt-4' onClick={() => router.push('/route-selection')}>
                                Créer un itinéraire
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                        {filteredHistory.map((item) => (
                            <Card
                                key={item.id}
                                className='cursor-pointer transition-shadow hover:shadow-md'
                                onClick={() => openRoute(item.id)}>
                                <CardHeader className='pb-2'>
                                    <div className='flex items-start justify-between'>
                                        <div className='flex items-center'>
                                            <CardTitle className='text-lg'>{item.name}</CardTitle>
                                            <Button
                                                variant='ghost'
                                                size='icon'
                                                className={`h-8 w-8 ${item.isFavorite ? 'text-yellow-500' : 'text-gray-300'}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    routeHistoryService.toggleFavorite(item.id);
                                                    setHistory((prev) => {
                                                        const newHistory = [...prev];
                                                        const itemIndex = newHistory.findIndex((h) => h.id === item.id);
                                                        if (itemIndex !== -1) {
                                                            newHistory[itemIndex] = {
                                                                ...newHistory[itemIndex],
                                                                isFavorite: !newHistory[itemIndex].isFavorite
                                                            };
                                                        }

                                                        return newHistory;
                                                    });
                                                }}>
                                                {item.isFavorite ? (
                                                    <Star className='h-5 w-5 fill-current' />
                                                ) : (
                                                    <Star className='h-5 w-5' />
                                                )}
                                            </Button>
                                        </div>
                                        <CardTitle className='text-lg'>{item.name}</CardTitle>
                                        <AlertDialog
                                            open={itemToDelete === item.id}
                                            onOpenChange={(open: any) => !open && setItemToDelete(null)}>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    className='h-8 w-8 text-gray-500'
                                                    onClick={(e: { stopPropagation: () => void }) => {
                                                        e.stopPropagation();
                                                        setItemToDelete(item.id);
                                                    }}>
                                                    <Trash2 className='h-4 w-4' />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Supprimer cet itinéraire ?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Cette action ne peut pas être annulée. L'itinéraire sera
                                                        définitivement supprimé de l'historique.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel
                                                        onClick={(e: { stopPropagation: () => any }) =>
                                                            e.stopPropagation()
                                                        }>
                                                        Annuler
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={(e: { stopPropagation: () => void }) => {
                                                            e.stopPropagation();
                                                            deleteRoute(item.id);
                                                        }}>
                                                        Supprimer
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                    <CardDescription className='flex items-center'>
                                        <Calendar className='mr-1.5 h-3.5 w-3.5 text-gray-400' />
                                        {formatDate(item.timestamp)}
                                        <Clock className='mr-1.5 ml-3 h-3.5 w-3.5 text-gray-400' />
                                        {formatTime(item.timestamp)}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className='pb-2'>
                                    <div className='space-y-2'>
                                        <div className='flex'>
                                            <div className='mt-1 mr-3'>
                                                <div className='h-3 w-3 rounded-full bg-green-600'></div>
                                            </div>
                                            <div className='flex-1 truncate text-sm text-gray-600'>
                                                {item.startLocation}
                                            </div>
                                        </div>

                                        <div className='flex'>
                                            <div className='mt-1 mr-3'>
                                                <div className='h-3 w-3 rounded-full bg-red-600'></div>
                                            </div>
                                            <div className='flex-1 truncate text-sm text-gray-600'>
                                                {item.endLocation}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>

                                <CardFooter>
                                    <Button
                                        variant='ghost'
                                        className='w-full text-blue-600 hover:bg-blue-50 hover:text-blue-800'
                                        onClick={(e: { stopPropagation: () => void }) => {
                                            e.stopPropagation();
                                            openRoute(item.id);
                                        }}>
                                        Voir l'itinéraire
                                        <ArrowRight className='ml-2 h-4 w-4' />
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
