// lib/config.ts
export const config = {
    googleMaps: {
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        url: process.env.NEXT_PUBLIC_GOOGLE_MAPS_URL
    },
    api: {
        baseUrl: process.env.NEXT_PUBLIC_API_URL,
        iconUrl: process.env.NEXT_PUBLIC_ICON_URL,
        photoUrl: process.env.NEXT_PUBLIC_PHOTO_URL
    }
};
