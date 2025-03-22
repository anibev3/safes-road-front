'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import DashboardLayout from '@/app/dash/layout';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/registry/new-york-v4/ui/avatar';
import { Badge } from '@/registry/new-york-v4/ui/badge';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import { Separator } from '@/registry/new-york-v4/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/new-york-v4/ui/tabs';

import {
    Award,
    Briefcase,
    Building,
    Calendar,
    Clock,
    Edit2,
    Mail,
    MapPin,
    Phone,
    Settings,
    Share2,
    Shield,
    User
} from 'lucide-react';

export default function ProfilePage() {
    const router = useRouter();
    const { user, isLoading } = useAuth();
    const [activeTab, setActiveTab] = useState('info');

    // Fonction pour obtenir les initiales de l'utilisateur pour l'avatar
    const getUserInitials = () => {
        console.log('=+++++++++++++++++++', user);
        if (!user) return 'UT';

        return `${user.user.first_name.charAt(0)}${user.user.last_name.charAt(0)}`.toUpperCase();
        // return `${user.first_name} ${user.last_name}`.toUpperCase();
    };

    // Fonction pour formater la date
    const formatDate = (dateString: string) => {
        if (!dateString) return 'Non spécifié';
        const date = new Date(dateString);

        return new Intl.DateTimeFormat('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className='container mx-auto max-w-6xl p-8'>
                    <div className='flex h-96 items-center justify-center'>
                        <div className='h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent'></div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!user) {
        return (
            <DashboardLayout>
                <div className='container mx-auto max-w-6xl p-8'>
                    <div className='flex h-96 flex-col items-center justify-center text-center'>
                        <User className='mb-4 h-16 w-16 text-gray-300' />
                        <h2 className='mb-2 text-2xl font-bold'>Profil indisponible</h2>
                        <p className='mb-4 text-gray-500'>Veuillez vous connecter pour accéder à votre profil.</p>
                        <Button onClick={() => router.push('/auth/login')}>Se connecter</Button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className='container mx-auto max-w-6xl p-4 md:p-8'>
                {/* Section d'en-tête du profil */}
                <div className='relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-800 to-blue-600'>
                    <div className='absolute inset-0 bg-gradient-to-r from-blue-800/90 to-blue-600/90'></div>
                    <div className='relative p-4 md:p-10'>
                        <div className='flex flex-col items-center md:flex-row md:items-start'>
                            <Avatar className='h-28 w-28 rounded-xl border-4 border-white/20 shadow-lg'>
                                <AvatarImage src='/api/placeholder/128/128' alt={user.user.name} />
                                <AvatarFallback className='text-2xl'>{getUserInitials()}</AvatarFallback>
                            </Avatar>

                            <div className='mt-4 text-center md:mt-0 md:ml-6 md:text-left'>
                                <h1 className='text-2xl font-bold text-white md:text-3xl'>{user.user.name}</h1>
                                <div className='mt-1 flex flex-wrap justify-center gap-2 md:justify-start'>
                                    <Badge variant='outline' className='bg-white/10 text-white'>
                                        {user?.user?.profile?.label || 'Non spécifié'}
                                    </Badge>
                                    <Badge
                                        className={
                                            user?.user?.status?.code === 'active' ? 'bg-green-500' : 'bg-gray-500'
                                        }>
                                        {user?.user?.status?.label || 'Non spécifié'}
                                    </Badge>
                                </div>
                                <div className='mt-3 text-blue-50'>
                                    <div className='flex items-center justify-center md:justify-start'>
                                        <Building className='mr-2 h-4 w-4' />
                                        <span>{user?.user?.entity?.name || 'Non spécifié'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className='mt-6 flex gap-2 md:mt-0 md:ml-auto'>
                                <Button
                                    variant='ghost'
                                    size='icon'
                                    className='rounded-full bg-white/10 text-white hover:bg-white/20'
                                    onClick={() => router.push('/settings')}>
                                    <Settings className='h-5 w-5' />
                                </Button>
                                <Button
                                    variant='ghost'
                                    size='icon'
                                    className='rounded-full bg-white/10 text-white hover:bg-white/20'>
                                    <Share2 className='h-5 w-5' />
                                </Button>
                                <Button
                                    variant='ghost'
                                    size='icon'
                                    className='rounded-full bg-white/10 text-white hover:bg-white/20'>
                                    <Edit2 className='h-5 w-5' />
                                </Button>
                            </div>
                        </div>

                        <div className='mt-8 grid grid-cols-1 gap-4 md:grid-cols-4'>
                            <Card className='bg-white/10 py-2 text-white shadow-none'>
                                <CardContent className='p-2'>
                                    <div className='flex items-center'>
                                        <Mail className='mr-3 h-6 w-6 text-blue-200' />
                                        <div>
                                            <p className='text-xs text-blue-200'>Email</p>
                                            <p className='font-medium'>{user.user.email}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className='bg-white/10 py-2 text-white shadow-none'>
                                <CardContent className='p-2'>
                                    <div className='flex items-center'>
                                        <Phone className='mr-3 h-6 w-6 text-blue-200' />
                                        <div>
                                            <p className='text-xs text-blue-200'>Téléphone</p>
                                            <p className='font-medium'>{user.user.telephone || 'Non spécifié'}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className='bg-white/10 py-2 text-white shadow-none'>
                                <CardContent className='p-2'>
                                    <div className='flex items-center'>
                                        <Shield className='mr-3 h-6 w-6 text-blue-200' />
                                        <div>
                                            <p className='text-xs text-blue-200'>Profil</p>
                                            <p className='font-medium'>{user.user.profile.code || 'Non spécifié'}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className='bg-white/10 py-2 text-white shadow-none'>
                                <CardContent className='p-2'>
                                    <div className='flex items-center'>
                                        <Calendar className='mr-3 h-6 w-6 text-blue-200' />
                                        <div>
                                            <p className='text-xs text-blue-200'>Membre depuis</p>
                                            <p className='font-medium'>{formatDate(user.user.created_at || '')}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Onglets d'information */}
                <Tabs defaultValue='info' className='mb-8' onValueChange={setActiveTab}>
                    <TabsList className='w-full justify-start border-b p-0'>
                        <TabsTrigger
                            value='info'
                            className='rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none'>
                            Informations personnelles
                        </TabsTrigger>
                        <TabsTrigger
                            value='entity'
                            className='rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none'>
                            Entité
                        </TabsTrigger>
                        <TabsTrigger
                            value='activity'
                            className='rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none'>
                            Activité
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value='info' className='pt-6'>
                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                            <Card>
                                <CardHeader>
                                    <CardTitle className='flex items-center'>
                                        <User className='mr-2 h-5 w-5 text-blue-600' />
                                        Informations de base
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className='space-y-4'>
                                    <div className='grid grid-cols-2 gap-4'>
                                        <div>
                                            <p className='text-sm text-gray-500'>Prénom</p>
                                            <p className='font-medium'>{user.user.first_name}</p>
                                        </div>
                                        <div>
                                            <p className='text-sm text-gray-500'>Nom</p>
                                            <p className='font-medium'>{user.user.last_name}</p>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <p className='text-sm text-gray-500'>Email</p>
                                        <p className='font-medium'>{user.user.email}</p>
                                    </div>

                                    <Separator />

                                    <div>
                                        <p className='text-sm text-gray-500'>Téléphone</p>
                                        <p className='font-medium'>{user.user.telephone || 'Non spécifié'}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className='flex items-center'>
                                        <Award className='mr-2 h-5 w-5 text-blue-600' />
                                        Statut et profil
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className='space-y-4'>
                                    <div>
                                        <p className='text-sm text-gray-500'>Statut</p>
                                        <div className='mt-1 flex items-center'>
                                            <Badge
                                                className={
                                                    user?.user?.status?.code === 'active'
                                                        ? 'bg-green-500'
                                                        : 'bg-gray-500'
                                                }>
                                                {user?.user?.status?.label || 'Non spécifié'}
                                            </Badge>
                                            <p className='ml-2 text-sm text-gray-500'>
                                                {user?.user?.status?.description || 'Non spécifié'}
                                            </p>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <p className='text-sm text-gray-500'>Profil</p>
                                        <p className='font-medium'>{user?.user?.profile?.label || 'Non spécifié'}</p>
                                        <p className='mt-1 text-sm text-gray-500'>
                                            {user?.user?.profile?.description || 'Non spécifié'}
                                        </p>
                                    </div>

                                    <Separator />

                                    <div>
                                        <p className='text-sm text-gray-500'>Date de création</p>
                                        <p className='font-medium'>{formatDate(user.user.created_at || '')}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value='entity' className='pt-6'>
                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center'>
                                    <Building className='mr-2 h-5 w-5 text-blue-600' />
                                    Informations de l'entité
                                </CardTitle>
                                <CardDescription>
                                    Détails sur l'organisation à laquelle vous êtes rattaché
                                </CardDescription>
                            </CardHeader>
                            <CardContent className='space-y-6'>
                                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                                    <div>
                                        <p className='text-sm text-gray-500'>Nom de l'entité</p>
                                        <p className='font-medium'>{user?.user?.entity?.name || 'Non spécifié'}</p>
                                    </div>

                                    <div>
                                        <p className='text-sm text-gray-500'>Code de l'entité</p>
                                        <p className='font-medium'>{user?.user?.entity?.code || 'Non spécifié'}</p>
                                    </div>
                                </div>

                                <Separator />

                                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                                    <div>
                                        <p className='text-sm text-gray-500'>Email</p>
                                        <p className='font-medium'>{user?.user?.entity?.email || 'Non spécifié'}</p>
                                    </div>

                                    <div>
                                        <p className='text-sm text-gray-500'>Téléphone</p>
                                        <p className='font-medium'>{user?.user?.entity?.telephone || 'Non spécifié'}</p>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <p className='text-sm text-gray-500'>Adresse</p>
                                    <p className='font-medium'>{user?.user?.entity?.address || 'Non spécifiée'}</p>
                                </div>

                                <Separator />

                                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                                    <div>
                                        <p className='text-sm text-gray-500'>Date de création</p>
                                        <p className='font-medium'>
                                            {formatDate(user?.user?.entity?.created_at || '')}
                                        </p>
                                    </div>

                                    <div>
                                        <p className='text-sm text-gray-500'>Dernière mise à jour</p>
                                        <p className='font-medium'>
                                            {formatDate(user?.user?.entity?.updated_at || '')}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value='activity' className='pt-6'>
                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center'>
                                    <Clock className='mr-2 h-5 w-5 text-blue-600' />
                                    Activité récente
                                </CardTitle>
                                <CardDescription>Historique de vos dernières actions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className='flex h-40 items-center justify-center'>
                                    <p className='text-gray-500'>Aucune activité récente à afficher</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
