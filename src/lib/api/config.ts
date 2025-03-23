// lib/config.ts
export const config = {
    googleMaps: {
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        url: process.env.NEXT_PUBLIC_GOOGLE_MAPS_URL || 'https://maps.googleapis.com/maps/api/directions/json?'
    },
    api: {
        baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://save-road.roomcodetraining.com/api/v1',
        iconUrl: process.env.NEXT_PUBLIC_ICON_URL || 'https://save-road.roomcodetraining.com/storage/icon/',
        photoUrl: process.env.NEXT_PUBLIC_PHOTO_URL || 'https://save-road.roomcodetraining.com/storage/photo/'
    }
};
