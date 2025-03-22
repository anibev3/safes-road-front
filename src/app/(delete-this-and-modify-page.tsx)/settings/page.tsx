'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import DashboardLayout from '@/app/dash/layout';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/registry/new-york-v4/ui/avatar';
import { Badge } from '@/registry/new-york-v4/ui/badge';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Label } from '@/registry/new-york-v4/ui/label';
import { Separator } from '@/registry/new-york-v4/ui/separator';
import { Switch } from '@/registry/new-york-v4/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/new-york-v4/ui/tabs';

import { ArrowLeft, Bell, Eye, EyeOff, Key, Lock, Mail, MoonStar, Save, Shield, Sun, User } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
    const router = useRouter();
    const { user, isLoading } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // États pour les paramètres
    const [darkMode, setDarkMode] = useState(false);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(true);
    const [twoFactorAuth, setTwoFactorAuth] = useState(false);

    // Fonction pour obtenir les initiales de l'utilisateur pour l'avatar
    const getUserInitials = () => {
        if (!user) return 'UT';

        return `${user.user.first_name.charAt(0)}${user.user.last_name.charAt(0)}`.toUpperCase();
    };

    const handleChangePassword = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error('Les mots de passe ne correspondent pas.');

            return;
        }

        toast.success('Votre mot de passe a été mis à jour.');

        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className='container mx-auto max-w-4xl p-8'>
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
                <div className='container mx-auto max-w-4xl p-8'>
                    <div className='flex h-96 flex-col items-center justify-center text-center'>
                        <User className='mb-4 h-16 w-16 text-gray-300' />
                        <h2 className='mb-2 text-2xl font-bold'>Paramètres indisponibles</h2>
                        <p className='mb-4 text-gray-500'>Veuillez vous connecter pour accéder à vos paramètres.</p>
                        <Button onClick={() => router.push('/auth/login')}>Se connecter</Button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className='container mx-auto max-w-4xl p-4 md:p-8'>
                <div className='mb-6 flex items-center'>
                    <Button variant='ghost' size='icon' className='mr-2' onClick={() => router.back()}>
                        <ArrowLeft className='h-5 w-5' />
                    </Button>
                    <h1 className='text-2xl font-bold'>Paramètres</h1>
                </div>

                <Tabs defaultValue='account' className='mb-8'>
                    <TabsList className='grid w-full grid-cols-3 md:flex md:w-auto'>
                        <TabsTrigger value='account'>
                            <User className='mr-2 h-4 w-4' />
                            Compte
                        </TabsTrigger>
                        <TabsTrigger value='password'>
                            <Lock className='mr-2 h-4 w-4' />
                            Mot de passe
                        </TabsTrigger>
                        <TabsTrigger value='notifications'>
                            <Bell className='mr-2 h-4 w-4' />
                            Notifications
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value='account' className='space-y-6 pt-6'>
                        <Card>
                            <CardHeader>
                                <CardTitle>Informations du compte</CardTitle>
                                <CardDescription>
                                    Consultez et modifiez les informations de votre compte
                                </CardDescription>
                            </CardHeader>
                            <CardContent className='space-y-6'>
                                <div className='flex flex-col items-center space-y-4 sm:flex-row sm:items-start sm:space-y-0 sm:space-x-4'>
                                    <Avatar className='h-24 w-24'>
                                        <AvatarImage src='/api/placeholder/128/128' alt={user.user.name} />
                                        <AvatarFallback className='text-lg'>{getUserInitials()}</AvatarFallback>
                                    </Avatar>

                                    <div className='flex-1 space-y-1 text-center sm:text-left'>
                                        <h3 className='text-lg font-medium'>{user.user.name}</h3>
                                        <p className='text-sm text-gray-500'>{user.user.email}</p>
                                        <div className='mt-2 flex flex-wrap justify-center gap-2 sm:justify-start'>
                                            <Badge
                                                variant='outline'
                                                className='bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'>
                                                {user.user.profile.label}
                                            </Badge>
                                        </div>
                                    </div>

                                    <Button variant='outline' size='sm' className='mt-4 sm:mt-0'>
                                        Changer la photo
                                    </Button>
                                </div>

                                <Separator />

                                <div className='grid gap-4 md:grid-cols-2'>
                                    <div className='space-y-2'>
                                        <Label htmlFor='first_name'>Prénom</Label>
                                        <Input id='first_name' defaultValue={user.user.first_name} />
                                    </div>

                                    <div className='space-y-2'>
                                        <Label htmlFor='last_name'>Nom</Label>
                                        <Input id='last_name' defaultValue={user.user.last_name} />
                                    </div>

                                    <div className='space-y-2'>
                                        <Label htmlFor='email'>Email</Label>
                                        <Input id='email' type='email' defaultValue={user.user.email} />
                                    </div>

                                    <div className='space-y-2'>
                                        <Label htmlFor='telephone'>Téléphone</Label>
                                        <Input id='telephone' defaultValue={user.user.telephone} />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className='flex justify-end'>
                                <Button className='w-full sm:w-auto'>
                                    <Save className='mr-2 h-4 w-4' />
                                    Enregistrer les modifications
                                </Button>
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Paramètres d'affichage</CardTitle>
                                <CardDescription>Personnalisez l'apparence de l'application</CardDescription>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                <div className='flex items-center justify-between'>
                                    <div className='flex items-center space-x-2'>
                                        {darkMode ? (
                                            <MoonStar className='h-5 w-5 text-blue-600' />
                                        ) : (
                                            <Sun className='h-5 w-5 text-amber-500' />
                                        )}
                                        <div>
                                            <p className='font-medium'>Mode sombre</p>
                                            <p className='text-sm text-gray-500'>
                                                Basculer entre le mode clair et le mode sombre
                                            </p>
                                        </div>
                                    </div>
                                    <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value='password' className='pt-6'>
                        <Card>
                            <CardHeader>
                                <CardTitle>Changer le mot de passe</CardTitle>
                                <CardDescription>
                                    Assurez-vous d'utiliser un mot de passe fort que vous n'utilisez nulle part ailleurs
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleChangePassword} className='space-y-4'>
                                    <div className='space-y-2'>
                                        <Label htmlFor='current-password'>Mot de passe actuel</Label>
                                        <div className='relative'>
                                            <Input
                                                id='current-password'
                                                type={showPassword ? 'text' : 'password'}
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                required
                                            />
                                            <button
                                                type='button'
                                                className='absolute top-1/2 right-2 -translate-y-1/2 text-gray-500'
                                                onClick={() => setShowPassword(!showPassword)}>
                                                {showPassword ? (
                                                    <EyeOff className='h-4 w-4' />
                                                ) : (
                                                    <Eye className='h-4 w-4' />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className='space-y-2'>
                                        <Label htmlFor='new-password'>Nouveau mot de passe</Label>
                                        <Input
                                            id='new-password'
                                            type={showPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                        />
                                        <div className='text-xs text-gray-500'>
                                            <p>Le mot de passe doit contenir :</p>
                                            <ul className='ml-4 list-disc'>
                                                <li>Au moins 8 caractères</li>
                                                <li>Au moins une lettre majuscule</li>
                                                <li>Au moins un chiffre</li>
                                                <li>Au moins un caractère spécial</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className='space-y-2'>
                                        <Label htmlFor='confirm-password'>Confirmer le nouveau mot de passe</Label>
                                        <Input
                                            id='confirm-password'
                                            type={showPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <Button type='submit' className='w-full'>
                                        <Key className='mr-2 h-4 w-4' />
                                        Mettre à jour le mot de passe
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value='notifications' className='pt-6'>
                        <Card>
                            <CardHeader>
                                <CardTitle>Préférences de notification</CardTitle>
                                <CardDescription>Choisissez comment vous souhaitez être notifié</CardDescription>
                            </CardHeader>
                            <CardContent className='space-y-6'>
                                <div className='flex items-center justify-between'>
                                    <div>
                                        <p className='font-medium'>Notifications par email</p>
                                        <p className='text-sm text-gray-500'>
                                            Recevez des notifications par email concernant votre compte
                                        </p>
                                    </div>
                                    <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                                </div>

                                <Separator />

                                <div className='flex items-center justify-between'>
                                    <div>
                                        <p className='font-medium'>Notifications push</p>
                                        <p className='text-sm text-gray-500'>
                                            Recevez des notifications push sur votre appareil
                                        </p>
                                    </div>
                                    <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
                                </div>

                                <Separator />

                                <div className='flex items-center justify-between'>
                                    <div className='flex items-start space-x-2'>
                                        <Shield className='mt-1 h-5 w-5 text-blue-600' />
                                        <div>
                                            <p className='font-medium'>Authentification à deux facteurs (2FA)</p>
                                            <p className='text-sm text-gray-500'>
                                                Ajoutez une couche supplémentaire de sécurité à votre compte
                                            </p>
                                        </div>
                                    </div>
                                    <Switch checked={twoFactorAuth} onCheckedChange={setTwoFactorAuth} />
                                </div>

                                {twoFactorAuth && (
                                    <Card className='border-dashed'>
                                        <CardContent className='pt-6'>
                                            <div className='flex flex-col items-center text-center'>
                                                <p className='mb-4'>
                                                    L'authentification à deux facteurs n'est pas encore configurée
                                                </p>
                                                <Button>Configurer 2FA</Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}

{
    /* <Card className="mt-6">
              <CardHeader>
                <CardTitle>Sécurité du compte</CardTitle>
                <CardDescription>
                  Gérez la sécurité de votre compte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-2">
                    <Shield className="mt-1 h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Sessions actives</p>
                      <p className="text-sm text-gray-500">
                        Gérez vos sessions de connexion actives
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Voir les sessions
                  </Button>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Historique des connexions</p>
                    <p className="text-sm text-gray-500">
                      Voir l'historique des connexions à votre compte
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Voir l'historique
                  </Button>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-red-600">Supprimer le compte</p>
                    <p className="text-sm text-gray-500">
                      Supprimez définitivement votre compte et toutes vos données
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">
                    Supprimer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="preferences" className="pt-6">
            <Card>
              <CardHeader>
                <CardTitle>Préférences linguistiques</CardTitle>
                <CardDescription>
                  Configurez vos préférences de langue
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Langue de l'interface</Label>
                  <Select defaultValue="fr">
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Sélectionnez une langue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Format de date</Label>
                  <Select defaultValue="dd/mm/yyyy">
                    <SelectTrigger id="dateFormat">
                      <SelectValue placeholder="Sélectionnez un format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd/mm/yyyy">JJ/MM/AAAA</SelectItem>
                      <SelectItem value="mm/dd/yyyy">MM/JJ/AAAA</SelectItem>
                      <SelectItem value="yyyy-mm-dd">AAAA-MM-JJ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>Enregistrer les préférences</Button>
              </CardFooter>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Accessibilité</CardTitle>
                <CardDescription>
                  Améliorez votre expérience d'utilisation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Police à grand contraste</p>
                    <p className="text-sm text-gray-500">
                      Améliore la lisibilité des textes
                    </p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Animations réduites</p>
                    <p className="text-sm text-gray-500">
                      Désactive les animations et transitions
                    </p>
                  </div>
                  <Switch />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fontSize">Taille de la police</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger id="fontSize">
                      <SelectValue placeholder="Sélectionnez une taille" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Petite</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="large">Grande</SelectItem>
                      <SelectItem value="xl">Très grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>Enregistrer les préférences</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="integrations" className="pt-6">
            <Card>
              <CardHeader>
                <CardTitle>Intégrations</CardTitle>
                <CardDescription>
                  Gérez les services connectés à votre compte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">Facebook</p>
                        <p className="text-sm text-gray-500">Non connecté</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Connecter</Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">Twitter</p>
                        <p className="text-sm text-gray-500">Non connecté</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Connecter</Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                        <svg className="h-6 w-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">GitHub</p>
                        <p className="text-sm text-gray-500">Non connecté</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Connecter</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
} */
}
